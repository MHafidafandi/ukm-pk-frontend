"use client";

import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { ActivityDetail } from "@/features/activities/components/activity-detail";
import { ActivityProvider } from "@/features/activities/contexts/ActivityContext";
import { use } from "react";

export default function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <PermissionGuard permission={PERMISSIONS.VIEW_ACTIVITIES}>
      <ActivityProvider>
        <ActivityDetail id={id} />
      </ActivityProvider>
    </PermissionGuard>
  );
}
