"use client";

import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { RolesList } from "@/features/roles/components/roles-list";
import { RoleProvider } from "@/features/roles/contexts/RoleContext";

export default function RolesPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.VIEW_ROLES}>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="h-full flex-1 flex-col space-y-8 flex">
          <RoleProvider>
            <RolesList />
          </RoleProvider>
        </div>
      </div>
    </PermissionGuard>
  );
}
