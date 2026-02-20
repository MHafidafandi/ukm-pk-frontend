"use client";

import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { ActivityList } from "@/features/activities/components/activity-list";

export default function ActivitiesPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.VIEW_ACTIVITIES}>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
          <ActivityList />
        </div>
      </div>
    </PermissionGuard>
  );
}
