"use client";

import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { DocumentationList } from "@/features/documentation/components/documentation-list";
import { DocumentationProvider } from "@/features/documentation/contexts/DocumentationContext";

export default function DocumentationPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.VIEW_DOCUMENTS}>
      <div className="flex-1 space-y-4 p-8 pt-6 h-full min-h-0 flex flex-col">
        <DocumentationProvider>
          <DocumentationList />
        </DocumentationProvider>
      </div>
    </PermissionGuard>
  );
}
