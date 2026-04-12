"use client";

import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { InventoryList } from "@/features/inventory/components/inventory-list";
import { AssetProvider } from "@/features/inventory/contexts/AssetContext";

export default function InventoryPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.VIEW_ASSETS}>
      <AssetProvider>
        <InventoryList />
      </AssetProvider>
    </PermissionGuard>
  );
}
