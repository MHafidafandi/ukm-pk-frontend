"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePermission } from "@/hooks/usePermission";
import { Permission } from "@/lib/permissions";

interface PermissionGateProps {
  children: ReactNode;
  permission: Permission;
  fallback?: ReactNode;
}

export function PermissionGate({
  children,
  permission,
  fallback = null,
}: PermissionGateProps) {
  const { can } = usePermission();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  if (!can(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
