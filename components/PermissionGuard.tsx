"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermission } from "@/hooks/usePermission";
import { Permission } from "@/lib/permissions";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PermissionGuardProps {
  children: ReactNode;
  permission: Permission;
  fallbackPath?: string;
  showLoading?: boolean;
}

export function PermissionGuard({
  children,
  permission,
  fallbackPath = "/",
  showLoading = true,
}: PermissionGuardProps) {
  const { can } = usePermission();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && isAuthenticated && !can(permission)) {
      router.replace(fallbackPath);
    }
  }, [authLoading, isAuthenticated, can, permission, router, fallbackPath]);

  if (authLoading || (isAuthenticated && !can(permission))) {
    return showLoading ? (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ) : null;
  }

  return <>{children}</>;
}
