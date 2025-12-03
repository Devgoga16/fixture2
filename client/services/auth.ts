import { apiCall } from "@/config/api";

export interface RequestOTPRequest {
  phone: string;
}

export interface RequestOTPResponse {
  success: boolean;
  message: string;
  expiresIn: string;
}

export interface DelegateRequestOTPResponse {
  success: boolean;
  message: string;
  expiresIn: string;
  teamName: string;
}

export interface VerifyOTPRequest {
  phone: string;
  otpCode: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    phone: string;
    role?: string;
  };
  expiresIn: string;
}

export interface DelegateVerifyOTPResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    phone: string;
    teamName?: string;
    tournamentName?: string;
    role: string;
  };
  expiresIn: string;
}

/**
 * Request OTP code to be sent via WhatsApp
 */
export async function requestOTP(phone: string): Promise<RequestOTPResponse> {
  return apiCall<RequestOTPResponse>("/auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

/**
 * Verify OTP code and login
 */
export async function verifyOTP(
  phone: string,
  otpCode: string
): Promise<VerifyOTPResponse> {
  return apiCall<VerifyOTPResponse>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone, otpCode }),
  });
}

/**
 * Request OTP code for delegate to be sent via WhatsApp
 */
export async function requestDelegateOTP(phone: string): Promise<DelegateRequestOTPResponse> {
  return apiCall<DelegateRequestOTPResponse>("/auth/delegado/request-otp", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

/**
 * Verify OTP code and login as delegate
 */
export async function verifyDelegateOTP(
  phone: string,
  otpCode: string
): Promise<DelegateVerifyOTPResponse> {
  return apiCall<DelegateVerifyOTPResponse>("/auth/delegado/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone, otpCode }),
  });
}

/**
 * Store auth token in localStorage
 */
export function saveAuthToken(token: string): void {
  localStorage.setItem("authToken", token);
}

/**
 * Get auth token from localStorage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem("authToken");
}

/**
 * Remove auth token from localStorage
 */
export function clearAuthToken(): void {
  localStorage.removeItem("authToken");
}

/**
 * Store user data in localStorage
 */
export function saveUserData(user: VerifyOTPResponse["user"] | DelegateVerifyOTPResponse["user"]): void {
  localStorage.setItem("userData", JSON.stringify(user));
}

/**
 * Get user data from localStorage
 */
export function getUserData(): (VerifyOTPResponse["user"] | DelegateVerifyOTPResponse["user"]) | null {
  const data = localStorage.getItem("userData");
  return data ? JSON.parse(data) : null;
}

/**
 * Clear user data from localStorage
 */
export function clearUserData(): void {
  localStorage.removeItem("userData");
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Check if user is an organizer
 */
export function isOrganizer(): boolean {
  const userData = getUserData();
  // Solo es organizador si está autenticado Y tiene rol de organizador (o rol undefined para retrocompatibilidad con datos antiguos)
  if (!isAuthenticated()) return false;
  return !userData?.role || userData?.role === "organizador";
}

/**
 * Check if user is a delegate
 */
export function isDelegate(): boolean {
  const userData = getUserData();
  return userData?.role === "delegado";
}

/**
 * Logout user (clear all auth data)
 */
export function logout(): void {
  clearAuthToken();
  clearUserData();
}
