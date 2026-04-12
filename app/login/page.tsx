"use client";

import { usePermission } from "@/hooks/usePermission";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { useEffect } from "react";
import { UserProvider } from "@/features/users/contexts/UserContext";
import { DivisionProvider } from "@/features/divisions/contexts/DivisionContext";
import { ActivityProvider } from "@/features/activities/contexts/ActivityContext";
import {
  ActivityStats,
  DivisionStats,
  DonationStats,
  InventoryStats,
  UserStats,
} from "@/features/dashboard/dashboard-list";
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
    <div className="flex flex-col gap-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-2">
        <h1 className="font-['Manrope'] font-bold text-3xl text-on-surface tracking-tight">
          Dashboard
        </h1>
        <p className="text-on-surface-variant text-sm">
          Ringkasan performa organisasi secara menyeluruh.
        </p>
      </div>

      {/* ── Anggota & Divisi ── */}
      <section className="flex flex-col gap-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          Keanggotaan
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <PermissionGate permission={PERMISSIONS.VIEW_USERS}>
            <UserProvider>
              <UserStats />
            </UserProvider>
          </PermissionGate>

          <PermissionGate permission={PERMISSIONS.VIEW_DIVISIONS}>
            <DivisionProvider>
              <DivisionStats />
            </DivisionProvider>
          </PermissionGate>
        </div>
      </section>

      {/* ── Kegiatan ── */}
      <section className="flex flex-col gap-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          Kegiatan
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <PermissionGate permission={PERMISSIONS.VIEW_ACTIVITIES}>
            <ActivityProvider>
              <ActivityStats />
            </ActivityProvider>
          </PermissionGate>
        </div>
      </section>

      {/* ── Donasi ── */}
      <section className="flex flex-col gap-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          Donasi
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <PermissionGate permission={PERMISSIONS.VIEW_DONATIONS}>
            <DonationProvider>
              <DonationStats />
            </DonationProvider>
          </PermissionGate>
        </div>
      </section>

      {/* ── Inventaris ── */}
      <section className="flex flex-col gap-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          Inventaris
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <PermissionGate permission={PERMISSIONS.VIEW_ASSETS}>
            <AssetProvider>
              <InventoryStats />
            </AssetProvider>
          </PermissionGate>
        </div>
      </section>

      {/* ── Fallback ── */}
      {userPermissions.length > 0 &&
        !userPermissions.some((p) => p.startsWith("view-")) && (
          <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-10 text-center">
            <p className="font-['Manrope'] font-bold text-lg text-on-surface mb-2">
              Tidak Ada Data yang Dapat Ditampilkan
            </p>
            <p className="text-sm text-on-surface-variant">
              Kamu tidak memiliki izin untuk melihat statistik dashboard. Akses
              fitur spesifik melalui menu navigasi.
            </p>
          </div>
        )}
    </div>
  );
}
