import { ReactNode } from "react";
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

  if (!can(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
