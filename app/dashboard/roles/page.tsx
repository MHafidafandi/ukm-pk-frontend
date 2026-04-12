"use client";

import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { RolesList } from "@/features/roles/components/roles-list";
import { RoleProvider } from "@/features/roles/contexts/RoleContext";

export default function RolesPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.VIEW_ROLES}>
      <RoleProvider>
        <RolesList />
      </RoleProvider>
    </PermissionGuard>
  );
}
