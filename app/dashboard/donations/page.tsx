"use client";

import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { DonationList } from "@/features/donation/components/donation-list";
import { DonationProvider } from "@/features/donation/contexts/DonationContext";

export default function DonationsPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.VIEW_DONATIONS}>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="h-full flex-1 flex-col space-y-8 flex">
          <DonationProvider>
            <DonationList />
          </DonationProvider>
        </div>
      </div>
    </PermissionGuard>
  );
}
