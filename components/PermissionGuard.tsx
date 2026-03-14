"use client";

import { ReactNode, useEffect, useState } from "react";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading && isLoggedIn && !can(permission)) {
      router.replace(fallbackPath);
    }
  }, [mounted, authLoading, isLoggedIn, can, permission, router, fallbackPath]);

  // To prevent hydration errors completely, we shouldn't render complex authenticated trees on the server
  // where localStorage and tokens aren't immediately available, since we rely heavily on client-side state.
  if (!mounted) {
    return showLoading ? (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ) : null;
  }

  if (authLoading || (isLoggedIn && !can(permission))) {
    return showLoading ? (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ) : null;
  }

  return <>{children}</>;
}
