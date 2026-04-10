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

const AUTH_COOKIE_ENDPOINTS = new Set(["/auth/login", "/auth/refresh"]);

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
<<<<<<< HEAD
=======
  access_token?: string;
>>>>>>> d1006d5a3f81168775557fa0498b538d3dcbbd83
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
      if (token && !AUTH_COOKIE_ENDPOINTS.has(requestUrl)) {
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
<<<<<<< HEAD
      const newToken = res?.data?.access_token;
=======
      const newToken = res?.access_token ?? res?.data?.access_token;
>>>>>>> d1006d5a3f81168775557fa0498b538d3dcbbd83

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
    // Handle specific HTTP Status Codes
    if (error.response?.status === 413) {
      return "File terlalu besar. Silakan upload file dengan ukuran lebih kecil (Maks. limit diserver).";
    }

    const data = error.response?.data;

    // Jika pesan error berupa array (misal dari validasi payload "request required", "asset code already exists", dll)
    if (data?.errors && Array.isArray(data.errors)) {
      return data.errors.map((e: any) => (typeof e === 'string' ? e : (e.msg || e.message || JSON.stringify(e)))).join(", ");
    }

    if (Array.isArray(data?.message)) {
      return data.message.join(", ");
    }

    return (
<<<<<<< HEAD
      data?.error ||
      data?.message ||
=======
      error.response?.data?.message ||
      error.response?.data?.error ||
>>>>>>> d1006d5a3f81168775557fa0498b538d3dcbbd83
      error.message ||
      "Terjadi kesalahan pada server"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Terjadi kesalahan tidak dikenal";
};
