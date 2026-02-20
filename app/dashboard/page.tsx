"use client";

import { usePermission } from "@/hooks/usePermission";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Briefcase,
  FileText,
  HeartHandshake,
  Package,
} from "lucide-react";

export default function DashboardPage() {
  const { userPermissions } = usePermission();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your organization.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* User Stats Widget */}
        <PermissionGate permission={PERMISSIONS.VIEW_USERS}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Active members in system
              </p>
            </CardContent>
          </Card>
        </PermissionGate>

        {/* Division Stats Widget */}
        <PermissionGate permission={PERMISSIONS.VIEW_DIVISIONS}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Divisions</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">Active divisions</p>
            </CardContent>
          </Card>
        </PermissionGate>

        {/* Activity Stats Widget */}
        <PermissionGate permission={PERMISSIONS.VIEW_ACTIVITIES}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activities</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Upcoming & ongoing events
              </p>
            </CardContent>
          </Card>
        </PermissionGate>

        {/* Donation Stats Widget */}
        <PermissionGate permission={PERMISSIONS.VIEW_DONATIONS}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Donations</CardTitle>
              <HeartHandshake className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Total donations received
              </p>
            </CardContent>
          </Card>
        </PermissionGate>

        {/* Inventory Stats Widget */}
        <PermissionGate permission={PERMISSIONS.VIEW_ASSETS}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Total assets tracked
              </p>
            </CardContent>
          </Card>
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
