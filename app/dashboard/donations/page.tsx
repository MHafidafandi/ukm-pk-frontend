"use client";

import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { DonationList } from "@/features/donation/components/donation-list";
import { DonationProvider } from "@/features/donation/contexts/DonationContext";

export default function DonationsPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.VIEW_DONATIONS}>
      <DonationProvider>
        <DonationList />
      </DonationProvider>
    </PermissionGuard>
  );
}
