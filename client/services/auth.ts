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
  console.log("[API] Enviando request OTP para teléfono:", phone);
  try {
    const response = await apiCall<RequestOTPResponse>("/auth/request-otp", {
      method: "POST",
      body: JSON.stringify({ phone }),
    });
    console.log("[API] Respuesta request OTP:", response);
    return response;
  } catch (error) {
    console.error("[API] Error en request OTP:", error);
    throw error;
  }
}

/**
 * Verify OTP code and login
 */
export async function verifyOTP(
  phone: string,
  otpCode: string
): Promise<VerifyOTPResponse> {
  console.log("[API] Enviando verify OTP para teléfono:", phone);
  console.log("[API] Código OTP:", otpCode);
  try {
    const response = await apiCall<VerifyOTPResponse>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, otpCode }),
    });
    console.log("[API] Respuesta verify OTP:", response);
    return response;
  } catch (error) {
    console.error("[API] Error en verify OTP:", error);
    throw error;
  }
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
  try {
    console.log("[Auth] Intentando guardar token en localStorage");
    console.log("[Auth] Token length:", token?.length);
    console.log("[Auth] localStorage disponible:", typeof localStorage !== 'undefined');
    
    localStorage.setItem("authToken", token);
    
    // Verificar que se guardó correctamente
    const saved = localStorage.getItem("authToken");
    console.log("[Auth] Token guardado correctamente:", saved === token);
    console.log("[Auth] Token recuperado length:", saved?.length);
  } catch (error) {
    console.error("[Auth] Error guardando token:", error);
    console.error("[Auth] Error tipo:", error instanceof Error ? error.constructor.name : typeof error);
    throw error;
  }
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
  try {
    console.log("[Auth] Intentando guardar userData en localStorage");
    console.log("[Auth] User data:", user);
    
    const jsonString = JSON.stringify(user);
    console.log("[Auth] JSON string length:", jsonString.length);
    
    localStorage.setItem("userData", jsonString);
    
    // Verificar que se guardó correctamente
    const saved = localStorage.getItem("userData");
    console.log("[Auth] userData guardado correctamente:", saved === jsonString);
    console.log("[Auth] userData recuperado:", saved);
  } catch (error) {
    console.error("[Auth] Error guardando userData:", error);
    console.error("[Auth] Error tipo:", error instanceof Error ? error.constructor.name : typeof error);
    throw error;
  }
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
