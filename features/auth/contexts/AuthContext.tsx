"use client";

import React, { createContext, useContext, useMemo, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  login,
  getMe,
  logout,
  updateProfile,
  changePassword,
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

export const isDivisionMe = (division: any): division is DivisionMe => {
  return (
    division !== null && typeof division === "object" && "name" in division
  );
};

export const isDivisionUser = (division: any): division is DivisionUser => {
  return (
    division !== null &&
    typeof division === "object" &&
    "nama_divisi" in division
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
  permissions: string[];
  hasPermission: (permission: string) => boolean;

  // Actions
  login: (data: LoginInput) => Promise<any>;
  logout: () => Promise<any>;
  updateProfile: (data: any) => Promise<any>;
  changePassword: (data: any) => Promise<any>;

  // Loading States
  loading: boolean;
  isFetching: boolean;
  isError: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  isUpdatingProfile: boolean;
  isChangingPassword: boolean;

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

// Also export useAuth for backward compatibility with older components
export const useAuth = useAuthContext;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Use a state loop to safely trigger re-renders when token exists initially
  const [isTokenPresent, setIsTokenPresent] = React.useState<boolean>(false);

  useEffect(() => {
    setIsTokenPresent(!!getToken());
  }, []);

  const {
    data: currentUserData,
    isLoading: userLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    enabled: isTokenPresent,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000, // equivalent to cacheTime in v5
    refetchOnWindowFocus: false,
    retry: 1,
  });

  useEffect(() => {
    if (isError && error) {
      console.error("Auth fetch error:", error);
      if ((error as any).response?.status === 401) {
        removeToken();
        setIsTokenPresent(false);
      }
    }
  }, [isError, error]);

  // Keep compatibility layer
  const currentUser = currentUserData as User | null;

  const loginMutation = useMutation({
    mutationFn: login,
    onMutate: () => console.log("🔄 [LOGIN] Starting..."),
    onSuccess: async (data) => {
      console.log("✅ [LOGIN] Success");
      setToken(data.access_token);
      setIsTokenPresent(true);

      // Fetch user data right after login to guarantee redirection logic applies
      try {
        const user = await getMe();
        queryClient.setQueryData(["auth", "me"], user);

        // Redirect logic
        const permissions = user.permissions || [];
        if (permissions.includes("view-users")) {
          router.replace("/dashboard");
        } else if (permissions.includes("view-users")) {
          router.replace("/dashboard/users");
        } else {
          router.replace("/profile");
        }
      } catch (err) {
        console.error("Redirect logic error:", err);
        router.replace("/dashboard");
      }
    },
    onError: (error: any) => {
      console.error("❌ [LOGIN] Error:", error);
      toast.error(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Login gagal",
      );
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      console.log("✅ [LOGOUT] Success");
      removeToken();
      setIsTokenPresent(false);
      queryClient.clear();
      router.replace("/login");
    },
    onError: (error: any) => {
      console.error("❌ [LOGOUT] Error:", error);
      toast.error(error?.response?.data?.message || "Logout gagal");
      // Fallback logout if api fails
      removeToken();
      setIsTokenPresent(false);
      queryClient.clear();
      router.replace("/login");
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onMutate: () => console.log("🔄 [UPDATE PROFILE] Starting..."),
    onSuccess: () => {
      console.log("✅ [UPDATE PROFILE] Success");
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Profil berhasil diperbarui");
    },
    onError: (error: any) => {
      console.error("❌ [UPDATE PROFILE] Error:", error);
      toast.error(error?.response?.data?.message || "Gagal memperbarui profil");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onMutate: () => console.log("🔄 [CHANGE PASSWORD] Starting..."),
    onSuccess: () => {
      console.log("✅ [CHANGE PASSWORD] Success");
      toast.success("Password berhasil diubah");
    },
    onError: (error: any) => {
      console.error("❌ [CHANGE PASSWORD] Error:", error);
      toast.error(error?.response?.data?.message || "Gagal mengubah password");
    },
  });

  const contextValue = useMemo(
    () => ({
      // Data
      currentUser: currentUser || null,
      isLoggedIn: !!currentUser,
      permissions: currentUser?.permissions || [],
      hasPermission: (permission: string) =>
        currentUser?.permissions?.includes(permission) ?? false,

      // Actions
      login: loginMutation.mutateAsync,
      logout: logoutMutation.mutateAsync,
      updateProfile: updateProfileMutation.mutateAsync,
      changePassword: changePasswordMutation.mutateAsync,

      // Loading States
      loading: isTokenPresent && userLoading, // only loading if we expect a token
      isFetching,
      isError,
      isLoggingIn: loginMutation.isPending,
      isLoggingOut: logoutMutation.isPending,
      isUpdatingProfile: updateProfileMutation.isPending,
      isChangingPassword: changePasswordMutation.isPending,

      // Utils
      refreshUser: () =>
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] }),
    }),
    [
      currentUser,
      isTokenPresent,
      userLoading,
      isFetching,
      isError,
      loginMutation,
      logoutMutation,
      updateProfileMutation,
      changePasswordMutation,
      queryClient,
    ],
  );

  // Show a loading screen if we have a token and we are verifying it on first load
  if (isTokenPresent && userLoading && !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
