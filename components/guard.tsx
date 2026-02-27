"use client";

import { Spinner } from "@/components/ui/spinner";
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
  /** Redirect ke path ini jika akses ditolak (default: redirect ke login) */
  redirectTo?: string;
  /** Tampilkan fallback ini jika akses ditolak (default: pesan "Akses ditolak") */
  fallback?: React.ReactNode;
};

export const Guard = ({
  children,
  role,
  permission,
  redirectTo,
  fallback,
}: GuardProps) => {
  const { currentUser: data, loading: isLoading, isError } = useAuth();
  const { can } = usePermission();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (isError || !data)) {
      router.replace(redirectTo ?? "/login");
    }
  }, [isLoading, isError, data, router, redirectTo]);

  if (isLoading) {
    return <Spinner className="m-4" />;
  }

  if (!data) {
    return null;
  }

  // Cek role
  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    const userRoleNames = data.roles?.map((r) => r.name) || [];
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
  const { can, userPermissions: roles } = usePermission(); // Note: Roles in usePermission might meant permissions. Kept as roles logic below based on permissions if needed. Or we fallback to auth.

  if (permission && !can(permission)) {
    return <>{fallback}</>;
  }

  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.some((r) => roles.includes(r))) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};
