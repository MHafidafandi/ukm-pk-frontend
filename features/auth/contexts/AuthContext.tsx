"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  login as loginService,
  getMe,
  logout as logoutService,
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAvatar,
  refreshToken as refreshTokenService,
} from "@/features/auth/services/authService";
import { LoginInput } from "@/lib/validations/auth-schema";
import { setToken, removeToken, getToken } from "@/lib/api/client";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Role {
  id: string;
  name: string;
}

export type DivisionMe = { id: string; name: string };
export type DivisionUser = { id: string; nama_divisi: string };

export const isDivisionMe = (division: unknown): division is DivisionMe => {
  return (
    division !== null &&
    typeof division === "object" &&
    "name" in (division as object)
  );
};

export const isDivisionUser = (division: unknown): division is DivisionUser => {
  return (
    division !== null &&
    typeof division === "object" &&
    "nama_divisi" in (division as object)
  );
};

export interface User {
  id: string;
  nama: string;
  username: string;
  email: string;

  nomor_telepon?: string;
  alamat?: string;
  angkatan: number;
  status: "aktif" | "nonaktif" | "alumni";
  avatar_url?: string;

  // Relations
  division?: DivisionMe | DivisionUser;
  roles?: Role[];

  permissions?: string[];

  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  // Data
  currentUser: User | null;
  isLoggedIn: boolean;
  isAuthenticated: boolean; // alias untuk isLoggedIn — ikuti naming convention umum
  permissions: string[];
  hasPermission: (permission: string) => boolean;

  // Actions
  login: (data: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Record<string, unknown>) => Promise<unknown>;
  changePassword: (data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }) => Promise<unknown>;
  uploadAvatar: (file: File) => Promise<unknown>;
  deleteAvatar: () => Promise<unknown>;

  // Loading States
  loading: boolean;
  isFetching: boolean;
  isError: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  isUpdatingProfile: boolean;
  isChangingPassword: boolean;
  isUploadingAvatar: boolean;
  isDeletingAvatar: boolean;

  // Utils
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};

// Backward compatibility
export const useAuth = useAuthContext;

// ── AuthProvider ───────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  /**
   * isInitialized: apakah kita sudah selesai mencoba silent refresh saat app load.
   * Mencegah halaman flash ke login sebelum kita tahu apakah user masih punya sesi.
   */
  const [isInitialized, setIsInitialized] = React.useState(false);

  /**
   * hasToken: apakah ada access token di memory.
   * Ini yang mengontrol apakah query /auth/me dijalankan.
   */
  const [hasToken, setHasToken] = React.useState<boolean>(false);
  const initializingRef = useRef(false);

  /**
   * Saat app pertama kali load, coba silent refresh menggunakan refresh token
   * yang tersimpan di HttpOnly cookie. Jika berhasil, simpan access token ke memory.
   * Jika gagal (cookie expired / tidak ada), langsung mark initialized.
   */
  useEffect(() => {
    if (initializingRef.current) return;
    initializingRef.current = true;

    const tryInit = async () => {
      // Jika sudah ada token di memory (misalnya dari login di sesi ini), skip
      if (getToken()) {
        setHasToken(true);
        setIsInitialized(true);
        return;
      }

      // Coba silent refresh untuk restore sesi dari refresh token cookie
      try {
        const res = await refreshTokenService();
        const token =
          (res as { access_token?: string }).access_token ??
          (res as unknown as { data?: { access_token?: string } }).data
            ?.access_token;
        if (token) {
          setToken(token);
          setHasToken(true);
        }
      } catch {
        // Tidak ada sesi aktif — normal, tidak perlu log error
        setHasToken(false);
      } finally {
        setIsInitialized(true);
      }
    };

    void tryInit();
  }, []);

  // ── Query: current user ─────────────────────────────────────────────────

  const {
    data: currentUserData,
    isLoading: userLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    enabled: isInitialized && hasToken,
    staleTime: 5 * 60 * 1000, // 5 menit — tidak refetch jika data masih fresh
    gcTime: 30 * 60 * 1000, // 30 menit cache
    refetchOnWindowFocus: false,
    retry: false, // Jangan retry — interceptor sudah handle 401
  });

  // Jika getMe gagal dengan 401 setelah refresh, paksa logout
  useEffect(() => {
    if (isError && error) {
      const status = (error as { response?: { status?: number } }).response
        ?.status;
      if (status === 401) {
        removeToken();
        setHasToken(false);
        queryClient.removeQueries({ queryKey: ["auth", "me"] });
      }
    }
  }, [isError, error, queryClient]);

  const currentUser = (currentUserData as User | undefined) ?? null;

  // ── Mutations ───────────────────────────────────────────────────────────

  const loginMutation = useMutation({
    mutationFn: loginService,
    onSuccess: async (data) => {
      // data sudah di-unwrap oleh response interceptor
      const tokenData = data as
        | { access_token?: string }
        | { data?: { access_token?: string } };
      const token =
        (tokenData as { access_token?: string }).access_token ??
        (tokenData as { data?: { access_token?: string } }).data?.access_token;

      if (!token) {
        toast.error(
          "Login berhasil tapi tidak ada token. Hubungi administrator.",
        );
        return;
      }

      // Simpan token ke memory
      setToken(token);
      setHasToken(true);

      // Fetch user data untuk redirect logic
      try {
        const user = (await getMe()) as User & { permissions?: string[] };
        queryClient.setQueryData(["auth", "me"], user);

        // Redirect berdasarkan permissions
        const perms = user?.permissions ?? [];
        if (perms.length > 0) {
          router.replace("/dashboard");
        } else {
          router.replace("/dashboard");
        }
      } catch {
        // Fallback redirect jika getMe gagal
        router.replace("/dashboard");
      }
    },
    onError: (error: unknown) => {
      const axiosError = error as {
        response?: { data?: { message?: string; error?: string } };
      };
      toast.error(
        axiosError?.response?.data?.message ??
          axiosError?.response?.data?.error ??
          "Kombinasi email dan password tidak sesuai",
      );
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutService,
    onSettled: () => {
      // Selalu bersihkan state, baik sukses maupun error
      removeToken();
      setHasToken(false);
      queryClient.clear();
      router.replace("/login");
    },
    onError: () => {
      // onSettled sudah handle, tidak perlu toast tambahan
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Profil berhasil diperbarui");
    },
    onError: (error: unknown) => {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(
        axiosError?.response?.data?.message ?? "Gagal memperbarui profil",
      );
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Password berhasil diubah");
    },
    onError: (error: unknown) => {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(
        axiosError?.response?.data?.message ?? "Gagal mengubah password",
      );
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Avatar berhasil diupload");
    },
    onError: (error: unknown) => {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(
        axiosError?.response?.data?.message ?? "Gagal mengupload avatar",
      );
    },
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: deleteAvatar,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Avatar berhasil dihapus");
    },
    onError: (error: unknown) => {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(
        axiosError?.response?.data?.message ?? "Gagal menghapus avatar",
      );
    },
  });

  // ── Stable callbacks ────────────────────────────────────────────────────

  const loginFn = useCallback(
    (data: LoginInput) => loginMutation.mutateAsync(data).then(() => undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loginMutation.mutateAsync],
  );

  const logoutFn = useCallback(
    () => logoutMutation.mutateAsync().then(() => undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logoutMutation.mutateAsync],
  );

  const refreshUser = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
  }, [queryClient]);

  // ── Context value ────────────────────────────────────────────────────────

  const contextValue = useMemo(
    () => ({
      currentUser,
      isLoggedIn: !!currentUser,
      isAuthenticated: !!currentUser,
      permissions: currentUser?.permissions ?? [],
      hasPermission: (permission: string) =>
        currentUser?.permissions?.includes(permission) ?? false,

      login: loginFn,
      logout: logoutFn,
      updateProfile: updateProfileMutation.mutateAsync,
      changePassword: changePasswordMutation.mutateAsync,
      uploadAvatar: uploadAvatarMutation.mutateAsync,
      deleteAvatar: deleteAvatarMutation.mutateAsync,

      loading: !isInitialized || (hasToken && userLoading && !currentUser),
      isFetching,
      isError,
      isLoggingIn: loginMutation.isPending,
      isLoggingOut: logoutMutation.isPending,
      isUpdatingProfile: updateProfileMutation.isPending,
      isChangingPassword: changePasswordMutation.isPending,
      isUploadingAvatar: uploadAvatarMutation.isPending,
      isDeletingAvatar: deleteAvatarMutation.isPending,

      refreshUser,
    }),
    [
      currentUser,
      isInitialized,
      hasToken,
      userLoading,
      isFetching,
      isError,
      loginMutation.isPending,
      logoutMutation.isPending,
      updateProfileMutation,
      changePasswordMutation,
      uploadAvatarMutation,
      deleteAvatarMutation,
      loginFn,
      logoutFn,
      refreshUser,
    ],
  );

  // ── Loading screen saat initialization ─────────────────────────────────
  // Tampilkan spinner penuh selama kita belum tahu status auth (silent refresh)
  // Ini mencegah flash of unauthenticated content.
  if (!isInitialized) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background"
        role="status"
        aria-label="Memverifikasi sesi..."
      >
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Memverifikasi sesi...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
