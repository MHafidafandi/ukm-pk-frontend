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

// ── Token helpers ──────────────────────────────────────────────────────────

const TOKEN_KEY = "access_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
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
    if (typeof window !== "undefined") {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
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
      return Promise.reject(error);
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
        .catch((err) => Promise.reject(err));
    }

    // Mulai proses refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const res = await api.post<{ data: { access_token: string } }>(
        "/auth/refresh",
      );
      const newToken = res.data.data.access_token;
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
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
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
