"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/AuthStore";
import { access } from "fs";

export type UserRole = "super_admin" | "administrator" | "member" | "guest";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  roles: UserRole[];
  nomor_telepon: string;
  avatar?: string;
  alamat: string;
  division_id: string;
  division_name?: string;
  angkatan?: string;
  created_at: string;
  updated_at: string;
  status: "aktif" | "nonaktif" | "alumni";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User, accessToken: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_TIMEOUT_MINUTES = 30;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();
  const logoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fungsi login
  const login = useCallback((userData: User, accessToken: string) => {
    const fixedUser: User = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      roles: userData.roles,
      nomor_telepon: userData.nomor_telepon,
      username: userData.username,
      alamat: userData.alamat,
      division_name: userData.division_name,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
      avatar: userData.avatar,
      division_id: userData.division_id,
      angkatan: userData.angkatan,
      status: userData.status,
    };
    const expiry = new Date().getTime() + SESSION_TIMEOUT_MINUTES * 60 * 1000;
    localStorage.setItem("user", JSON.stringify(fixedUser));
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("expiry", expiry.toString());

    useAuthStore
      .getState()
      .setUser({ email: userData.email, roles: userData.roles }, accessToken);
    useAuthStore.getState().setUserRole({
      isAdmin:
        userData.roles.includes("super_admin") ||
        userData.roles.includes("administrator"),
    });
    setUser(fixedUser);
    setLoading(false);
    setIsAuthenticated(true);

    if (fixedUser.roles.includes("super_admin")) {
      router.replace("/superadmin/dashboard");
    } else if (fixedUser.roles.includes("administrator")) {
      router.replace("/administrator/dashboard");
    } else if (fixedUser.roles.includes("member")) {
      router.replace("/member/dashboard");
    } else {
      router.replace("/member/dashboard");
    }
  }, []);

  // Fungsi logout
  const logout = useCallback(() => {
    // Clear timeout
    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current);
      logoutTimeoutRef.current = null;
    }
    setUser(null);
    setIsAuthenticated(false);
    const storedUser = localStorage.getItem("user");

    // Clear storage
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("expiry");

    // Reset state
    setUser(null);

    // Redirect berdasarkan role sebelumnya
    let role: UserRole = "guest";

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        role = parsedUser.role;
      } catch (error) {
        console.error("Error parsing stored user:", error);
      }
    }

    // Navigasi sesuai role
    switch (role) {
      case "super_admin":
      case "administrator":
        router.replace("/admin/login");
        break;
      case "member":
        router.replace("/login");
        break;
      default:
        router.replace("/login");
    }
  }, [router]);

  // Load user dari localStorage saat mount
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("access_token");
        const storedExpiry = localStorage.getItem("expiry");

        if (storedUser && storedToken && storedExpiry) {
          const now = new Date().getTime();
          const expiry = parseInt(storedExpiry, 10);

          if (now < expiry) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
            // Set timeout untuk sisa waktu session
            const timeLeft = expiry - now;
            if (timeLeft > 0) {
              if (logoutTimeoutRef.current) {
                clearTimeout(logoutTimeoutRef.current);
              }

              logoutTimeoutRef.current = setTimeout(() => logout(), timeLeft);
            } else {
              logout();
            }
          } else {
            logout();
          }
        }
      } catch (error) {
        console.error("Error loading user from storage:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();

    // Cleanup
    return () => {
      if (logoutTimeoutRef.current) {
        clearTimeout(logoutTimeoutRef.current);
      }
    };
  }, [logout]);

  // Nilai context
  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  // Tampilkan loading state selama inisialisasi
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
