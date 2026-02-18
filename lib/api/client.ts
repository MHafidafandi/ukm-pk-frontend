/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from "@/configs/env";

type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  cookie?: string;
  params?: Record<string, string | number | boolean | undefined | null>;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
};

function buildUrlWithParams(
  url: string,
  params?: RequestOptions["params"],
): string {
  if (!params) return url;
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  );
  if (Object.keys(filteredParams).length === 0) return url;
  const queryString = new URLSearchParams(
    filteredParams as Record<string, string>,
  ).toString();
  return `${url}?${queryString}`;
}

// Create a separate function for getting server-side cookies that can be imported where needed
export function getServerCookies() {
  if (typeof window !== "undefined") return "";

  // Dynamic import next/headers only on server-side
  return import("next/headers").then(async ({ cookies }) => {
    try {
      const cookieStore = await cookies();
      return cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");
    } catch (error) {
      console.error("Failed to access cookies:", error);
      return "";
    }
  });
}
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

async function refreshToken(): Promise<string> {
  const res = await fetch(`${env.API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include", // kirim cookie refresh token
  });

  if (!res.ok) throw new Error("Refresh token failed");

  const data = await res.json();

  const newToken = data.data?.access_token;

  if (!newToken) throw new Error("No access token from refresh");

  localStorage.setItem("access_token", newToken);

  return newToken;
}
async function fetchApi<T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    headers = {},
    body,
    cookie,
    params,
    cache = "no-store",
    next,
  } = options;

  let authHeader: Record<string, string> = {};

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");

    if (token) {
      authHeader = {
        Authorization: `Bearer ${token}`,
      };
    }
  }
  // Get cookies from the request when running on server
  let cookieHeader = cookie;
  if (typeof window === "undefined" && !cookie) {
    cookieHeader = await getServerCookies();
  }

  const fullUrl = buildUrlWithParams(`${env.API_URL}${url}`, params);

  const response = await fetch(fullUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...authHeader,
      ...headers,
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
    cache,
    next,
  });
  // ===== AUTO REFRESH =====
  if (
    response.status === 401 &&
    typeof window !== "undefined" &&
    !url.includes("/auth/refresh")
  ) {
    try {
      // kalau belum refresh → refresh
      if (!isRefreshing) {
        isRefreshing = true;

        refreshPromise = refreshToken().finally(() => {
          isRefreshing = false;
        });
      }

      if (!refreshPromise) {
        throw new Error("No refresh promise");
      }

      await refreshPromise;

      // ulang request pakai token baru
      return fetchApi<T>(url, options);
    } catch (err) {
      // refresh gagal → logout paksa
      localStorage.clear();
      window.location.href = "/login";

      throw new Error("Session expired");
    }
  }
  if (!response.ok) {
    const errorData = await response.json();

    const message =
      errorData.message ||
      errorData.error ||
      response.statusText ||
      "Terjadi kesalahan";

    throw new Error(message);
  }

  return response.json();
}

export const api = {
  get<T>(url: string, options?: RequestOptions): Promise<T> {
    return fetchApi<T>(url, { ...options, method: "GET" });
  },
  post<T>(url: string, body?: any, options?: RequestOptions): Promise<T> {
    return fetchApi<T>(url, { ...options, method: "POST", body });
  },
  put<T>(url: string, body?: any, options?: RequestOptions): Promise<T> {
    return fetchApi<T>(url, { ...options, method: "PUT", body });
  },
  patch<T>(url: string, body?: any, options?: RequestOptions): Promise<T> {
    return fetchApi<T>(url, { ...options, method: "PATCH", body });
  },
  delete<T>(url: string, options?: RequestOptions): Promise<T> {
    return fetchApi<T>(url, { ...options, method: "DELETE" });
  },
};
