import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { setOnAuthExpired } from "./api";
import { getAccessToken } from "./auth-storage";
import { useWishlist } from "./wishlist-store";
import {
  fetchProfile,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  type Customer,
} from "./auth-api";

type AuthState = {
  /** null while restoring the session on app launch. */
  loading: boolean;
  customer: Customer | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: Parameters<typeof apiRegister>[0]) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);

  // Restore session on launch: if we have a stored token, validate it by
  // fetching the profile (the API client refreshes the token if needed).
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const profile = await fetchProfile();
          if (active) setCustomer(profile);
        }
      } catch {
        // invalid/expired session — stay logged out
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // When a token refresh fails mid-session, drop back to logged-out.
  useEffect(() => {
    setOnAuthExpired(() => setCustomer(null));
    return () => setOnAuthExpired(null);
  }, []);

  // Keep the wishlist in sync with auth state.
  useEffect(() => {
    if (customer) useWishlist.getState().load();
    else useWishlist.getState().clear();
  }, [customer]);

  const login = useCallback(async (email: string, password: string) => {
    setCustomer(await apiLogin(email, password));
  }, []);

  const register = useCallback(async (input: Parameters<typeof apiRegister>[0]) => {
    setCustomer(await apiRegister(input));
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setCustomer(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ loading, customer, login, register, logout }),
    [loading, customer, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
