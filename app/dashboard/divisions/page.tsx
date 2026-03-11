"use client";

import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { DivisionsList } from "@/features/divisions/components/divisions-list";
import { DivisionProvider } from "@/features/divisions/contexts/DivisionContext";

export default function DivisionsPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.VIEW_DIVISIONS}>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="h-full flex-1 flex-col space-y-8 flex">
          <DivisionProvider>
            <DivisionsList />
          </DivisionProvider>
        </div>
      </div>
    </PermissionGuard>
  );
}
