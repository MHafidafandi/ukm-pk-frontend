"use client";

import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { InventoryList } from "@/features/inventory/components/inventory-list";
import { AssetProvider } from "@/features/inventory/contexts/AssetContext";

export default function InventoryPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.VIEW_ASSETS}>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="h-full flex-1 flex-col space-y-8 flex">
          <AssetProvider>
            <InventoryList />
          </AssetProvider>
        </div>
      </div>
    </PermissionGuard>
  );
}
