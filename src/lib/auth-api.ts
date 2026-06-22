import { api } from "./api";
import { clearTokens, setTokens } from "./auth-storage";

export type Customer = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
};

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  customer: Customer;
};

/** POST /api/mobile/auth/login — stores tokens and returns the customer. */
export async function login(email: string, password: string): Promise<Customer> {
  const data = await api<LoginResponse>("/api/mobile/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
  await setTokens(data.accessToken, data.refreshToken);
  return data.customer;
}

/** POST /api/mobile/auth/register — creates the account, stores tokens, returns the customer. */
export async function register(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<Customer> {
  const data = await api<LoginResponse>("/api/mobile/auth/register", {
    method: "POST",
    auth: false,
    body: input,
  });
  await setTokens(data.accessToken, data.refreshToken);
  return data.customer;
}

/** Returns the current customer's profile, or throws ApiError(401) if not logged in. */
export async function fetchProfile(): Promise<Customer> {
  // /api/account/profile returns { firstName, lastName, email, phone } — no id.
  const p = await api<Omit<Customer, "id">>("/api/account/profile");
  return { id: "", ...p };
}

export async function logout(): Promise<void> {
  await clearTokens();
}
