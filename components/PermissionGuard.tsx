"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { Permission } from "@/lib/permissions";
import { Loader2 } from "lucide-react";

interface PermissionGuardProps {
  readonly children: ReactNode;
  readonly permission: Permission;
  readonly fallbackPath?: string;
  readonly showLoading?: boolean;
}

/**
 * PermissionGuard — proteksi halaman berdasarkan permission.
 *
 * Alur:
 * 1. Selama auth masih "loading" (silent refresh / fetch /me) → tampilkan spinner
 * 2. Setelah selesai:
 *    - Tidak login → redirect ke fallbackPath (default: /login)
 *    - Login tapi tidak punya permission → redirect ke fallbackPath
 *    - Login dan punya permission → render children
 */
export function PermissionGuard({
  children,
  permission,
  fallbackPath = "/login",
  showLoading = true,
}: PermissionGuardProps) {
  const { loading, isLoggedIn, hasPermission } = useAuth();
  const router = useRouter();

  const isAllowed = isLoggedIn && hasPermission(permission);

  useEffect(() => {
    if (!loading && !isAllowed) {
      router.replace(fallbackPath);
    }
  }, [loading, isAllowed, router, fallbackPath]);

  // Selama loading (termasuk silent refresh), tampilkan spinner
  if (loading) {
    return showLoading ? (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ) : null;
  }

  // Tidak diizinkan → null (redirect sedang berjalan via useEffect)
  if (!isAllowed) {
    return showLoading ? (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ) : null;
  }

  return <>{children}</>;
}
