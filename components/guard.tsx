"use client";

import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePermission } from "@/hooks/usePermission";
import { Permission } from "@/lib/permissions";

type GuardProps = {
  children: React.ReactNode;
  /** Cek role langsung (salah satu role harus cocok) */
  role?: string | string[];
  /** Cek permission spesifik */
  permission?: Permission;
  /** Redirect ke path ini jika akses ditolak (default: /login) */
  redirectTo?: string;
  /** Tampilkan fallback ini jika akses ditolak (default: pesan "Akses ditolak") */
  fallback?: React.ReactNode;
};

/**
 * Guard — proteksi halaman/komponen berdasarkan auth, role, atau permission.
 *
 * Alur:
 * 1. Loading → tampilkan spinner
 * 2. Tidak login → redirect ke redirectTo (default: /login)
 * 3. Login tapi tidak punya role/permission → tampilkan fallback atau pesan error
 * 4. Semua ok → render children
 */
export const Guard = ({
  children,
  role,
  permission,
  redirectTo = "/login",
  fallback,
}: GuardProps) => {
  const { currentUser, loading } = useAuth();
  const { can } = usePermission();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.replace(redirectTo);
    }
  }, [loading, currentUser, router, redirectTo]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return null; // redirect sedang berjalan
  }

  // Cek role
  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    const userRoleNames = currentUser.roles?.map((r) => r.name) ?? [];
    const hasRole = allowedRoles.some((r) => userRoleNames.includes(r));
    if (!hasRole) {
      return (
        <>
          {fallback ?? (
            <div className="p-4 text-sm text-muted-foreground">
              Akses ditolak. Anda tidak memiliki role yang diperlukan.
            </div>
          )}
        </>
      );
    }
  }

  // Cek permission
  if (permission && !can(permission)) {
    return (
      <>
        {fallback ?? (
          <div className="p-4 text-sm text-muted-foreground">
            Akses ditolak. Anda tidak memiliki izin untuk halaman ini.
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
};

/**
 * PermissionGate — wrapper ringan untuk show/hide elemen berdasarkan permission.
 * Tidak melakukan redirect, hanya menyembunyikan children jika tidak punya izin.
 *
 * Contoh:
 *   <PermissionGate permission="users:create">
 *     <Button>Tambah User</Button>
 *   </PermissionGate>
 */
export const PermissionGate = ({
  children,
  permission,
  role,
  fallback = null,
}: {
  children: React.ReactNode;
  permission?: Permission;
  role?: string | string[];
  fallback?: React.ReactNode;
}) => {
  const { can, userPermissions } = usePermission();
  const { currentUser } = useAuth();

  if (permission && !can(permission)) {
    return <>{fallback}</>;
  }

  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    const userRoleNames = currentUser?.roles?.map((r) => r.name) ?? [];
    if (!allowedRoles.some((r) => userRoleNames.includes(r) || userPermissions.includes(r))) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};
