"use client";

/**
 * AuthContext — state auth global untuk seluruh aplikasi.
 *
 * Menyimpan user yang sedang login, status loading, dan fungsi login/logout.
 * Token disimpan di localStorage; user data di-persist via localStorage juga
 * untuk menghindari flash of unauthenticated content saat page refresh.
 */
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { logout as apiLogout } from "@/features/auth/api";
import { ROUTES } from "@/configs/routes";

// ── Types ──────────────────────────────────────────────────────────────────

export type UserRole = "super_admin" | "administrator" | "member";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  roles: UserRole[];
  nomor_telepon: string;
  avatar?: string;
  alamat: string;
  division_id: string | null;
  division_name?: string;
  angkatan?: number;
  status: "aktif" | "nonaktif" | "alumni";
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (userData: User, accessToken: string) => void;
  logout: () => Promise<void>;
}

// ── Context ────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ── Storage helpers ────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  user: "user",
  token: "access_token",
} as const;

function saveToStorage(user: User, token: string) {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEYS.token, token);
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEYS.user);
  localStorage.removeItem(STORAGE_KEYS.token);
}

function loadUserFromStorage(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

// ── Provider ───────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Restore user dari localStorage saat mount
  useEffect(() => {
    const stored = loadUserFromStorage();
    if (stored) {
      setUser(stored);
    }
    setLoading(false);
  }, []);

  // Sync logout antar tab
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.user && e.newValue === null) {
        setUser(null);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const login = useCallback(
    (userData: User, accessToken: string) => {
      saveToStorage(userData, accessToken);
      setUser(userData);

      // Redirect berdasarkan role tertinggi
      if (userData.roles.includes("super_admin")) {
        router.replace(ROUTES.dashboard.superadmin);
      } else if (userData.roles.includes("administrator")) {
        router.replace(ROUTES.dashboard.administrator);
      } else {
        router.replace(ROUTES.dashboard.member);
      }
    },
    [router],
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Tetap logout dari client meski API error
    }

    clearStorage();
    setUser(null);
    router.replace(ROUTES.auth.login);
  }, [router]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
