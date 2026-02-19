/**
 * Konfigurasi React Query QueryClient.
 * - staleTime: 5 menit (data dianggap fresh selama 5 menit)
 * - gcTime: 10 menit (cache dibersihkan setelah 10 menit tidak digunakan)
 * - retry: 1x jika query gagal, 0x jika mutation gagal
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  QueryClient,
  UseMutationOptions,
  DefaultOptions,
} from "@tanstack/react-query";

// ── QueryClient Instance ───────────────────────────────────────────────────

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 menit
      gcTime: 10 * 60 * 1000, // 10 menit
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// ── Legacy Config Object (untuk kompatibilitas) ────────────────────────────

export const queryConfig = {
  queries: {
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 1000 * 60,
  },
} satisfies DefaultOptions;

// ── Utility Types ──────────────────────────────────────────────────────────

export type ApiFnReturnType<FnType extends (...args: any) => Promise<any>> =
  Awaited<ReturnType<FnType>>;

export type QueryConfig<T extends (...args: any[]) => any> = Omit<
  ReturnType<T>,
  "queryKey" | "queryFn"
>;

export type MutationConfig<
  MutationFnType extends (...args: any) => Promise<any>,
> = UseMutationOptions<
  ApiFnReturnType<MutationFnType>,
  Error,
  Parameters<MutationFnType>[0]
>;
