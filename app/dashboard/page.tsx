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

export default function DashboardPage() {
  const { userPermissions } = usePermission();

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
          <div className="bg-gradient-to-br from-[#9F7AEA] to-[#7C3AED] rounded-2xl p-6 text-white shadow-sm transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold">--</h3>
              <p className="text-sm text-white/80 font-medium mt-1">
                Total Users
              </p>
            </div>
          </div>
        </PermissionGate>

        {/* Division Stats Widget */}
        <PermissionGate permission={PERMISSIONS.VIEW_DIVISIONS}>
          <div className="bg-gradient-to-br from-[#60A5FA] to-[#3B82F6] rounded-2xl p-6 text-white shadow-sm transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Briefcase className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold">--</h3>
              <p className="text-sm text-white/80 font-medium mt-1">
                Divisions
              </p>
            </div>
          </div>
        </PermissionGate>

        {/* Activity Stats Widget */}
        <PermissionGate permission={PERMISSIONS.VIEW_ACTIVITIES}>
          <div className="bg-gradient-to-br from-[#34D399] to-[#10B981] rounded-2xl p-6 text-white shadow-sm transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <FileText className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold">--</h3>
              <p className="text-sm text-white/80 font-medium mt-1">
                Activities
              </p>
            </div>
          </div>
        </PermissionGate>

        {/* Donation Stats Widget */}
        <PermissionGate permission={PERMISSIONS.VIEW_DONATIONS}>
          <div className="bg-gradient-to-br from-[#FB923C] to-[#F97316] rounded-2xl p-6 text-white shadow-sm transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <HeartHandshake className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold">--</h3>
              <p className="text-sm text-white/80 font-medium mt-1">
                Donations
              </p>
            </div>
          </div>
        </PermissionGate>

        {/* Inventory Stats Widget */}
        <PermissionGate permission={PERMISSIONS.VIEW_ASSETS}>
          <div className="bg-gradient-to-br from-[#F87171] to-[#EF4444] rounded-2xl p-6 text-white shadow-sm transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Package className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold">--</h3>
              <p className="text-sm text-white/80 font-medium mt-1">
                Inventory
              </p>
            </div>
          </div>
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
