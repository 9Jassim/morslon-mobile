import * as SecureStore from "expo-secure-store";

/**
 * Persisted auth tokens for the Morslon backend.
 * Stored in the OS keychain/keystore via expo-secure-store — never AsyncStorage,
 * since these are bearer credentials.
 */

const ACCESS_KEY = "morslon.accessToken";
const REFRESH_KEY = "morslon.refreshToken";

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_KEY);
}

export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_KEY, refreshToken),
  ]);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY),
    SecureStore.deleteItemAsync(REFRESH_KEY),
  ]);
}
