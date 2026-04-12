"use client";

import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { DocumentationList } from "@/features/documentation/components/documentation-list";
import { DocumentationProvider } from "@/features/documentation/contexts/DocumentationContext";

export default function DocumentationPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.VIEW_DOCUMENTATIONS}>
      <DocumentationProvider>
        <DocumentationList />
      </DocumentationProvider>
    </PermissionGuard>
  );
}
