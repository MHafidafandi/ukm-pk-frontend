// services/authService.ts
import axios, { AxiosError, AxiosResponse } from "axios";
import api from "./client";
import { User, UserRole } from "@/contexts/AuthContext";

// ==================== TYPE DEFINITIONS ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseData {
  access_token: string;
  expires_in: number;
}

export interface LoginResponse {
  data: LoginResponseData;
}

export interface ApiErrorResponse {
  error?: string;
  message?: string;
  statusCode?: number;
}

export interface GetMeResponse {
  data: User;
}

export interface RefreshTokenResponse {
  data: LoginResponseData;
}

// Custom error type
export class AuthError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

// ==================== UTILITY FUNCTIONS ====================

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const setToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
};

const removeToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("token_expiry");
};

const setCurrentUser = (user: User): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("user", JSON.stringify(user));
};

const setTokenExpiry = (expiresIn: number): void => {
  if (typeof window === "undefined") return;
  const expiryTime = Date.now() + expiresIn * 1000;
  localStorage.setItem("token_expiry", expiryTime.toString());
};

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
};

const getTokenExpiry = (): number | null => {
  if (typeof window === "undefined") return null;
  const expiryTime = localStorage.getItem("token_expiry");
  return expiryTime ? parseInt(expiryTime, 10) : null;
};

const isTokenExpired = (): boolean => {
  const expiryTime = getTokenExpiry();
  if (!expiryTime) return true;
  return Date.now() > expiryTime;
};

// ==================== AXIOS INSTANCE ====================

// Helper untuk extract error message
const extractErrorMessage = (error: unknown): string => {
  if (error instanceof AuthError) {
    return error.message;
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.message) {
      return axiosError.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unknown error occurred";
};

// ==================== AUTH SERVICES ====================

/**
 * Login service
 */
export const loginService = async (payload: LoginRequest): Promise<string> => {
  console.log("[AUTH API] POST /auth/login", { email: payload.email });
  console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
  try {
    const response: AxiosResponse<LoginResponse> = await api.post(
      "/auth/login",
      payload,
    );

    const token = response.data.data.access_token;
    const expiresIn = response.data.data.expires_in;

    if (!token) {
      throw new AuthError("No access token received");
    }

    // Save token and expiry
    setToken(token);
    setTokenExpiry(expiresIn);

    // Get user data after successful login
    try {
      await getMeService();
      console.log("[AUTH API] Login successful, user data retrieved");
    } catch (userError) {
      console.warn(
        "[AUTH API] Could not fetch user data immediately after login:",
        userError,
      );
    }

    console.log("[AUTH API] Login successful, token saved");
    return token;
  } catch (error: unknown) {
    console.error("[AUTH API] Login failed:", error);

    const errorMessage = extractErrorMessage(error);
    const authError = new AuthError(errorMessage);

    // Clear any existing tokens on login failure
    removeToken();

    throw authError;
  }
};

/**
 * Get current user profile
 */
export const getMeService = async (): Promise<User> => {
  console.log("[AUTH API] GET /auth/me");

  const token = getToken();

  if (!token) {
    throw new AuthError("No token available");
  }

  try {
    const response: AxiosResponse<GetMeResponse> = await api.get("/auth/me");

    const userData = response.data.data;

    // Cache user data in localStorage
    setCurrentUser(userData);

    console.log("[AUTH API] User data retrieved successfully");
    return userData;
  } catch (error: unknown) {
    console.error("[AUTH API] Failed to get user profile:", error);

    let errorMessage = "Failed to load user profile";

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
      } else {
        errorMessage = extractErrorMessage(error);
      }
    }

    // Clear token if getting profile fails (might be invalid/expired)
    removeToken();

    throw new AuthError(errorMessage);
  }
};

/**
 * Refresh access token
 */
export const refreshTokenService = async (): Promise<string> => {
  console.log("📡 [AUTH API] GET /auth/refresh");

  const oldToken = getToken();

  if (!oldToken) {
    throw new AuthError("No token to refresh");
  }

  try {
    const response: AxiosResponse<RefreshTokenResponse> =
      await api.get("/auth/refresh");

    const newToken = response.data.data.access_token;
    const expiresIn = response.data.data.expires_in;

    if (!newToken) {
      throw new AuthError("No new token received");
    }

    // Save new token and expiry
    setToken(newToken);
    setTokenExpiry(expiresIn);

    console.log("[AUTH API] Token refreshed and saved");
    return newToken;
  } catch (error: unknown) {
    console.error("[AUTH API] Refresh failed:", error);

    const errorMessage = extractErrorMessage(error);

    // Clear token if refresh fails
    removeToken();

    throw new AuthError(errorMessage);
  }
};

/**
 * Logout service
 */
export const logoutService = async (): Promise<void> => {
  console.log("[AUTH API] POST /auth/logout");

  const token = getToken();

  if (token) {
    try {
      // Try to notify backend about logout
      await api.post("/auth/logout", {});
      console.log("[AUTH API] Backend logout successful");
    } catch (error: unknown) {
      // Log but don't throw - we still want to clear local storage
      console.warn(
        "[AUTH API] Backend logout failed:",
        extractErrorMessage(error),
      );
    }
  }

  // Always clear local storage
  removeToken();
  console.log("[AUTH API] Logout completed");
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;

  const token = getToken();
  const user = getCurrentUser();
  const expired = isTokenExpired();

  return !!(token && user && !expired);
};

/**
 * Check if user has specific role
 */
export const hasRole = (role: string | string[]): boolean => {
  if (typeof window === "undefined") return false;

  const user = getCurrentUser();
  if (!user) return false;

  if (Array.isArray(role)) {
    return role.some((r) => user.roles.includes(r as UserRole));
  }

  return user.roles.includes(role as UserRole);
};

/**
 * Check if user is admin/super_admin
 */
export const isAdmin = (): boolean => {
  return hasRole(["super_admin", "admin"]);
};

/**
 * Initialize auth state on app load
 */
export const initializeAuth = async (): Promise<User | null> => {
  if (typeof window === "undefined") return null;

  try {
    const token = getToken();
    const cachedUser = getCurrentUser();

    if (!token) {
      return null;
    }

    // Check if token is expired
    if (isTokenExpired()) {
      console.log("[AUTH] Token expired, attempting refresh");
      try {
        await refreshTokenService();
      } catch (refreshError) {
        console.warn("[AUTH] Token refresh failed:", refreshError);
        removeToken();
        return null;
      }
    }

    // Try to get fresh user data
    const user = await getMeService();
    return user;
  } catch (error: unknown) {
    console.warn("[AUTH] Failed to initialize auth:", error);

    // Return cached user as fallback if token is still valid
    const token = getToken();
    const cachedUser = getCurrentUser();

    if (token && cachedUser && !isTokenExpired()) {
      return cachedUser;
    }

    removeToken();
    return null;
  }
};

/**
 * Update user profile
 */
export const updateProfileService = async (
  userData: Partial<User>,
): Promise<User> => {
  console.log("[AUTH API] PUT /auth/me");

  try {
    const response: AxiosResponse<GetMeResponse> = await api.put(
      "/auth/me",
      userData,
    );

    const updatedUser = response.data.data;

    // Update cached user data
    setCurrentUser(updatedUser);

    console.log("[AUTH API] Profile updated successfully");
    return updatedUser;
  } catch (error: unknown) {
    console.error("[AUTH API] Failed to update profile:", error);

    const errorMessage = extractErrorMessage(error);
    throw new AuthError(errorMessage);
  }
};
