/**
 * Axios instance dengan konfigurasi base URL dan interceptors.
 * - Request interceptor: inject Authorization header dari localStorage
 * - Response interceptor: auto-refresh token on 401, redirect ke login jika refresh gagal
 *
 * Menggunakan failed queue untuk menangani multiple concurrent request yang 401
 * secara bersamaan — semua request akan di-retry setelah token berhasil di-refresh.
 */
import axios, { AxiosRequestConfig } from "axios";
import { env } from "@/configs/env";

export const api = axios.create({
  baseURL: env.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // untuk httpOnly cookies (refresh_token)
});

const AUTH_NO_BEARER_EXACT = new Set([
  "/auth/login",
  "/auth/refresh",
  "/auth/logout",
]);

const isAuthNoBearerEndpoint = (url: string): boolean => {
  if (AUTH_NO_BEARER_EXACT.has(url)) {
    return true;
  }

  // /auth/:userId/logout-all
  if (/^\/auth\/[^/]+\/logout-all$/.test(url)) {
    return true;
  }

  return false;
};

// ── Token helpers ──────────────────────────────────────────────────────────

const TOKEN_KEY = "access_token";

export function getToken(): string | null {
  if (typeof globalThis.window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function clearClientAuthArtifacts(): void {
  removeToken();

  if (typeof globalThis.document === "undefined") {
    return;
  }

  // Best-effort cleanup for non-httpOnly cookies if they exist.
  const cookieNames = ["refresh_token", "access_token", "token"];
  const paths = ["/", "/api", "/api/v1"];

  for (const name of cookieNames) {
    for (const path of paths) {
      document.cookie = `${name}=; Path=${path}; Max-Age=0; SameSite=Lax`;
    }
  }
}

// ── Refresh token state ────────────────────────────────────────────────────

/** Apakah sedang dalam proses refresh token */
let isRefreshing = false;

/**
 * Antrian request yang gagal karena 401 saat refresh sedang berjalan.
 * Setelah refresh selesai, semua request di antrian akan di-retry.
 */
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

type RefreshTokenResponse = {
  access_token?: string;
  data?: {
    access_token?: string;
  };
};

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
}

// ── Request interceptor ────────────────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    if (typeof globalThis.window !== "undefined") {
      const requestUrl = config.url ?? "";
      const token = getToken();
      if (token && !isAuthNoBearerEndpoint(requestUrl)) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    config.withCredentials = config.withCredentials ?? true;

    return config;
  },
  (error) => {
    throw error;
  },
);

// ── Response interceptor (auto-refresh) ───────────────────────────────────

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Hanya handle 401, dan jangan retry request refresh itu sendiri
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url === "/auth/refresh"
    ) {
      throw error;
    }

    // Jika sudah ada proses refresh berjalan, masukkan ke antrian
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${token}`,
          };
          return api(originalRequest);
        })
        .catch((err) => {
          throw err;
        });
    }

    // Mulai proses refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const res = (await api.post("/auth/refresh", undefined, {
        withCredentials: true,
      })) as RefreshTokenResponse;
      const newToken = res?.access_token ?? res?.data?.access_token;

      if (!newToken) {
        throw new Error("Refresh token response did not include access_token");
      }

      setToken(newToken);

      // Update header untuk request yang di-retry
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${newToken}`,
      };

      // Selesaikan semua request yang antri
      processQueue(null, newToken);

      return api(originalRequest);
    } catch (refreshError) {
      // Refresh gagal → logout paksa
      processQueue(refreshError, null);
      removeToken();
      if (typeof globalThis.window !== "undefined") {
        globalThis.window.location.href = "/login";
      }
      throw refreshError;
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Terjadi kesalahan pada server"
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Terjadi kesalahan tidak dikenal";
};
