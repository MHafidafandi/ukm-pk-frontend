"use client";

import { usePermission } from "@/hooks/usePermission";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import {
  Users,
  Briefcase,
  FileText,
  HeartHandshake,
  Package,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { useEffect } from "react";
import { UserProvider } from "@/features/users/contexts/UserContext";
import { DivisionProvider } from "@/features/divisions/contexts/DivisionContext";
import { ActivityProvider } from "@/features/activities/contexts/ActivityContext";
import { ActivityStats, DivisionStats, DonationStats, InventoryStats, UserStats } from "@/features/dashboard/dashboard-list";
import { DonationProvider } from "@/features/donation/contexts/DonationContext";
import { AssetProvider } from "@/features/inventory/contexts/AssetContext";

export default function DashboardPage() {
  const { userPermissions } = usePermission();
  const router = useRouter();
  const { isLoggedIn, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn, loading, router]);

  if (loading || !isLoggedIn) return null;

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your organization.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
        {/* User Stats Widget */}
        <PermissionGate permission={PERMISSIONS.VIEW_USERS}>
          <UserProvider>
            <UserStats />
          </UserProvider>
        </PermissionGate>

        {/* Division Stats Widget */}
        <PermissionGate permission={PERMISSIONS.VIEW_DIVISIONS}>
          <DivisionProvider>
            <DivisionStats />
          </DivisionProvider>
        </PermissionGate>

        {/* Activity Stats Widget */}
        <PermissionGate permission={PERMISSIONS.VIEW_ACTIVITIES}>
          <ActivityProvider>
            <ActivityStats />
          </ActivityProvider>
        </PermissionGate>

        {/* Donation Stats Widget */}
        <PermissionGate permission={PERMISSIONS.VIEW_DONATIONS}>
          <DonationProvider>
            <DonationStats />
          </DonationProvider>
        </PermissionGate>

        {/* Inventory Stats Widget */}
        <PermissionGate permission={PERMISSIONS.VIEW_ASSETS}>
          <AssetProvider>
            <InventoryStats />
          </AssetProvider>
        </PermissionGate>
      </div>

      {/* Fallback for empty dashboard if user has no view permissions */}
      {userPermissions.length > 0 &&
        !userPermissions.some((p) => p.startsWith("view-")) && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <h3 className="text-lg font-semibold">No Overview Available</h3>
            <p className="text-muted-foreground">
              You don't have permission to view any dashboard statistics. Please
              access specific features from the menu.
            </p>
          </div>
        )}
    </div>
  );
}
