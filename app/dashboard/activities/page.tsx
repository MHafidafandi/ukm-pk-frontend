"use client";

import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { ActivityList } from "@/features/activities/components/activity-list";
import { ActivityProvider } from "@/features/activities/contexts/ActivityContext";

export default function ActivitiesPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.VIEW_ACTIVITIES}>
      <ActivityProvider>
        <ActivityList />
      </ActivityProvider>
    </PermissionGuard>
  );
}
