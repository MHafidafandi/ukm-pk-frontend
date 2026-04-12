/**
 * Axios instance dengan konfigurasi base URL dan interceptors.
 *
 * Arsitektur Token:
 * - Access token disimpan di MEMORY (bukan localStorage) → aman dari XSS
 * - Refresh token disimpan di HttpOnly cookie yang di-set oleh backend
 * - Request interceptor: inject Authorization header dari memory
 * - Response interceptor: auto-refresh on 401 dengan single-flight pattern
 *
 * Single-flight pattern: jika ada banyak request yang 401 bersamaan,
 * hanya 1 request refresh yang dikirim. Yang lain menunggu di queue.
 */
import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { env } from "@/configs/env";

export const api = axios.create({
  baseURL: env.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // selalu kirim HttpOnly cookie (refresh_token)
});

// ── In-Memory Token Store (XSS-safe) ──────────────────────────────────────
// Tidak pakai localStorage. Token hilang saat tab ditutup.
// Re-hydration otomatis via refresh token cookie saat app load.

let _accessToken: string | null = null;

export function getToken(): string | null {
  return _accessToken;
}

export function setToken(token: string): void {
  _accessToken = token;
  if (typeof document !== "undefined") {
    document.cookie =
      "is_authenticated=true; path=/; max-age=86400; SameSite=Lax";
  }
}

export function removeToken(): void {
  _accessToken = null;
  if (typeof document !== "undefined") {
    document.cookie = "is_authenticated=; path=/; max-age=0; SameSite=Lax";
  }
}

// ── Refresh token state (single-flight) ───────────────────────────────────

let isRefreshing = false;

let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

type AccessTokenResponse = {
  access_token: string;
  expires_in?: number;
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
  (config: InternalAxiosRequestConfig) => {
    const requestUrl = config.url ?? "";
    const token = getToken();
    const isAuthFlowRoute =
      requestUrl === "/auth/refresh" || requestUrl === "/auth/login";

    if (token && !isAuthFlowRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Pastikan cookie selalu dikirim
    config.withCredentials = true;

    return config;
  },
  (error) => {
    throw error;
  },
);

// ── Response interceptor ───────────────────────────────────────────────────
// PENTING: response.data di-unwrap di sini supaya caller langsung dapat data body.
// Ini berarti di refresh handler kita harus akses langsung ke property,
// bukan .data.access_token.

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;
    const requestUrl = originalRequest.url ?? "";
    const headerRecord = originalRequest.headers as
      | Record<string, unknown>
      | undefined;
    const hasAuthHeader = Boolean(
      headerRecord?.Authorization ?? headerRecord?.authorization,
    );
    const hasSessionInMemory = Boolean(getToken());

    // Jangan handle jika:
    // - bukan 401
    // - sudah pernah di-retry
    // - request dari endpoint /auth/refresh itu sendiri (hindari infinite loop)
    if (
      status !== 401 ||
      originalRequest._retry ||
      requestUrl === "/auth/refresh"
    ) {
      throw error;
    }

    // Public request tanpa sesi aktif tidak perlu trigger refresh/redirect login.
    if (!hasAuthHeader && !hasSessionInMemory) {
      throw error;
    }

    if (status === 403) {
      // forbidden → user gak punya permission
      alert("Kamu tidak punya akses");
    }
    // Jika sudah ada proses refresh berjalan, masukkan ke antrian
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${token}`,
        };
        return api(originalRequest);
      });
    }

    // Mulai proses refresh (single-flight)
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Response interceptor sudah unwrap .data, jadi kita langsung dapat object
      const res = (await api.post("/auth/refresh", undefined, {
        withCredentials: true,
      })) as AccessTokenResponse | { data: AccessTokenResponse };

      // Handle kedua kemungkinan format response: langsung atau nested {data: ...}
      const newToken =
        (res as AccessTokenResponse).access_token ??
        (res as { data: AccessTokenResponse }).data?.access_token;

      if (!newToken) {
        throw new Error("Refresh response tidak mengandung access_token");
      }

      setToken(newToken);

      // Retry original request dengan token baru
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${newToken}`,
      };

      // Selesaikan semua request yang antri
      processQueue(null, newToken);

      return api(originalRequest);
    } catch (refreshError) {
      // Refresh gagal → force logout
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

// ── Error message helper ───────────────────────────────────────────────────

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 413) {
      return "File terlalu besar. Silakan upload file dengan ukuran lebih kecil (Maks. limit di server).";
    }

    const data = error.response?.data;

    if (data?.errors && Array.isArray(data.errors)) {
      return data.errors
        .map((e: unknown) =>
          typeof e === "string"
            ? e
            : typeof e === "object" && e !== null
              ? ((e as Record<string, string>).msg ??
                (e as Record<string, string>).message ??
                JSON.stringify(e))
              : String(e),
        )
        .join(", ");
    }

    if (Array.isArray(data?.message)) {
      return (data.message as string[]).join(", ");
    }

    return (
      data?.error ??
      data?.message ??
      error.message ??
      "Terjadi kesalahan pada server"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Terjadi kesalahan tidak dikenal";
};
