"use client";

import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { RolesList } from "@/features/roles/components/roles-list";

export default function RolesPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.VIEW_ROLES}>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Role Management</h2>
        </div>
        <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
          <RolesList />
        </div>
      </div>
    </PermissionGuard>
  );
}
