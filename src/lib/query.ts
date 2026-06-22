import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./api";

/**
 * Shared React Query client. Sensible mobile defaults: cache for a minute,
 * one retry, and never retry on a 4xx (auth/validation errors won't fix
 * themselves on retry).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});
