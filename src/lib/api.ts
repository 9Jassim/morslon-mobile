import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "./auth-storage";

/**
 * Thin fetch wrapper around the Morslon backend.
 *
 * - Attaches `Authorization: Bearer <accessToken>` automatically.
 * - On a 401, tries once to refresh the token pair (POST /api/mobile/auth/refresh)
 *   and replays the original request. If refresh fails, it clears tokens and the
 *   caller surfaces an unauthenticated state.
 *
 * Base URL comes from EXPO_PUBLIC_API_URL (set in .env / EAS). For local dev:
 *   - iOS simulator:      http://localhost:3001
 *   - Android emulator:   http://10.0.2.2:3001
 *   - physical device:    http://<your-LAN-ip>:3001
 */
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Called when refresh fails — set by the auth context so it can log the user out. */
let onAuthExpired: (() => void) | null = null;
export function setOnAuthExpired(fn: (() => void) | null) {
  onAuthExpired = fn;
}

type ApiOptions = Omit<RequestInit, "body"> & {
  /** Plain object — JSON-encoded automatically. */
  body?: unknown;
  /** Skip the bearer token (for public endpoints / login). */
  auth?: boolean;
};

async function rawFetch(path: string, opts: ApiOptions, token: string | null) {
  const headers = new Headers(opts.headers);
  if (opts.body !== undefined) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(`${API_URL}${path}`, {
    ...opts,
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
}

/** Attempt a single refresh. Returns the new access token or null. */
async function tryRefresh(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${API_URL}/api/mobile/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return null;

  const data = (await res.json()) as { accessToken: string; refreshToken: string };
  await setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

/**
 * Make an API request. Returns parsed JSON (typed as T).
 * Throws ApiError on non-2xx responses.
 */
export async function api<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const useAuth = opts.auth !== false;
  let token = useAuth ? await getAccessToken() : null;

  let res = await rawFetch(path, opts, token);

  // One refresh-and-retry on 401 (only for authed requests).
  if (res.status === 401 && useAuth) {
    token = await tryRefresh();
    if (token) {
      res = await rawFetch(path, opts, token);
    } else {
      await clearTokens();
      onAuthExpired?.();
    }
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const err = (await res.json()) as { error?: string };
      if (err?.error) message = err.error;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
