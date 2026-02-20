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

export interface Role {
  id: string;
  name: string;
}

export interface Division {
  id: string;
  nama_divisi: string;
}

export interface User {
  id: string;
  nama: string;
  username: string;
  email: string;

  nomor_telepon: string;
  alamat: string;
  angkatan: number;
  status: "aktif" | "nonaktif" | "alumni";
  avatar_url?: string;

  // Relations
  division: Division;
  roles: Role[];

  permissions?: string[];

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

      // Redirect based on permissions
      // Prioritas: Dashboard -> Users -> Profile
      const permissions = userData.permissions || [];
      if (permissions.includes("view-dashboard")) {
        router.replace("/dashboard");
      } else if (permissions.includes("view-users")) {
        router.replace("/users");
      } else {
        // Fallback untuk user tanpa permission dashboard/users
        router.replace("/profile");
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
    router.replace("/login");
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
