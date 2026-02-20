"use client";

import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { DivisionsList } from "@/features/divisions/components/divisions-list";

export default function DivisionsPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.VIEW_DIVISIONS}>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Division Management
          </h2>
        </div>
        <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
          <DivisionsList />
        </div>
      </div>
    </PermissionGuard>
  );
}
