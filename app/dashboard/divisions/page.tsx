"use client";

import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { DivisionsList } from "@/features/divisions/components/divisions-list";
import { DivisionProvider } from "@/features/divisions/contexts/DivisionContext";

export default function DivisionsPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.VIEW_DIVISIONS}>
      <DivisionProvider>
        <DivisionsList />
      </DivisionProvider>
    </PermissionGuard>
  );
}
