/**
 * Centralized API Configuration
 * Change the API_BASE_URL here to point to your backend
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://fixture-api-6ds7q1-0d111f-31-97-133-67.traefik.me/api";

/**
 * Helper function to make API calls
 */
export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}
