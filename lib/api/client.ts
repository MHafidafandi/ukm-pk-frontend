// lib/api/client.ts
import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { refreshTokenService } from "@/lib/api/auth-service";

// Type definitions
type FailedRequest = {
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
};

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: unknown;
  config: AxiosRequestConfig;
}

interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

interface ErrorResponse {
  message: string;
  status?: number;
  code?: string;
  errors?: Record<string, string[]>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Refresh token state
let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null,
): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Only access localStorage on client side
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Logging only in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    console.error("[API] Request error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[API] ${response.config.method?.toUpperCase()} ${
          response.config.url
        } - ${response.status}`,
      );
    }
    return response;
  },
  async (error: AxiosError): Promise<AxiosResponse | Promise<never>> => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Log error
    console.error(
      `[API] ${originalRequest?.method?.toUpperCase()} ${
        originalRequest?.url
      } - ${error.response?.status}`,
      error.response?.data,
    );

    // Handle 401 - Unauthorized
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // Skip refresh for auth endpoints
      const authEndpoints = ["/auth/login", "/auth/refresh", "/auth/register"];
      const shouldSkipRefresh = authEndpoints.some((endpoint) =>
        originalRequest.url?.includes(endpoint),
      );

      if (shouldSkipRefresh) {
        console.log("[API] Skipping refresh for auth endpoint");
        return Promise.reject(error);
      }

      // Queue system for multiple requests
      if (isRefreshing) {
        console.log("[API] Adding request to queue");
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err: AxiosError) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("[API] Token expired, refreshing...");
        const newToken = await refreshTokenService();
        console.log("[API] Token refreshed successfully");

        // Update default header and original request
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Update localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("token", newToken);
        }

        // Process queued requests
        processQueue(null, newToken);

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error("[API] Token refresh failed:", refreshError);

        // Clear auth data
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("currentUser");
        }

        // Process queued requests with error
        processQueue(refreshError as AxiosError, null);

        // Redirect to login (client-side only)
        if (typeof window !== "undefined") {
          const { pathname } = window.location;
          if (!pathname.includes("/login")) {
            window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
          }
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    const errorResponse = error.response?.data as ErrorResponse;
    const errorMessage =
      errorResponse?.message || error.message || "An unknown error occurred";

    // Create a typed error object
    const typedError: AxiosError<ErrorResponse> = {
      ...error,
      message: errorMessage,
      response: error.response
        ? {
            ...error.response,
            data: {
              ...errorResponse,
              message: errorMessage,
              status: error.response.status,
            },
          }
        : undefined,
    };

    return Promise.reject(typedError);
  },
);

// Utility functions
export const setAuthToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export const clearAuthToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
  }
  delete api.defaults.headers.common.Authorization;
};

// Generic API methods with proper typing
export const apiGet = <T = unknown>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> =>
  api.get<T>(url, config).then((res: AxiosResponse<T>) => res.data);

export const apiPost = <T = unknown, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig,
): Promise<T> =>
  api.post<T>(url, data, config).then((res: AxiosResponse<T>) => res.data);

export const apiPut = <T = unknown, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig,
): Promise<T> =>
  api.put<T>(url, data, config).then((res: AxiosResponse<T>) => res.data);

export const apiPatch = <T = unknown, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig,
): Promise<T> =>
  api.patch<T>(url, data, config).then((res: AxiosResponse<T>) => res.data);

export const apiDelete = <T = unknown>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> =>
  api.delete<T>(url, config).then((res: AxiosResponse<T>) => res.data);

// Export the axios instance with proper typing
export default api;
