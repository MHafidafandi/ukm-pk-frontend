"use client";

import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { InventoryList } from "@/features/inventory/components/inventory-list";

export default function InventoryPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.VIEW_ASSETS}>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
          <InventoryList />
        </div>
      </div>
    </PermissionGuard>
  );
}
