"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermission } from "@/hooks/usePermission";
import { Permission } from "@/lib/permissions";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/contexts/AuthContext";

interface PermissionGuardProps {
  readonly children: ReactNode;
  readonly permission: Permission;
  readonly fallbackPath?: string;
  readonly showLoading?: boolean;
}

export function PermissionGuard({
  children,
  permission,
  fallbackPath = "/",
  showLoading = true,
}: PermissionGuardProps) {
  const { can } = usePermission();
  const { loading: authLoading, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && isLoggedIn && !can(permission)) {
      router.replace(fallbackPath);
    }
  }, [authLoading, isLoggedIn, can, permission, router, fallbackPath]);

  if (authLoading || (isLoggedIn && !can(permission))) {
    return showLoading ? (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ) : null;
  }

  return <>{children}</>;
}
