"use client";

import { usePermission } from "@/hooks/usePermission";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { useEffect } from "react";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { Loader2 } from "lucide-react";

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    notation: "compact",
    compactDisplay: "short",
  }).format(amount);

const timeAgo = (dateInput: string) => {
  const date = new Date(dateInput);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return "Baru saja";
  if (minutes < 60) return `${minutes} menit yang lalu`;
  if (hours < 24) return `${hours} jam yang lalu`;
  if (days === 1) return "Kemarin";
  return `${days} hari yang lalu`;
};

const statusCfg = (status: string) => {
  const s = status.toLowerCase();
  if (s === "verified" || s === "selesai")
    return {
      label: "Selesai",
      variant: "bg-secondary-fixed text-on-secondary-fixed-variant" as const,
    };
  if (s === "pending" || s === "perencanaan")
    return {
      label: "Pending",
      variant: "bg-tertiary-fixed text-on-tertiary-fixed-variant" as const,
    };
  if (s === "rejected" || s === "dibatalkan")
    return {
      label: "Ditolak",
      variant: "bg-error-container text-on-error-container" as const,
    };
  if (s === "aktif")
    return {
      label: "Aktif",
      variant: "bg-primary-fixed text-on-primary-fixed-variant" as const,
    };
  if (s === "nonaktif" || s === "alumni")
    return {
      label: status.toUpperCase(),
      variant: "bg-surface-container text-on-surface-variant" as const,
    };
  if (s === "berjalan")
    return {
      label: "Berjalan",
      variant: "bg-primary-fixed text-on-primary-fixed-variant" as const,
    };

  return {
    label: status.toUpperCase(),
    variant: "bg-surface-container text-on-surface-variant" as const,
  };
};

export default function DashboardPage() {
  const { userPermissions } = usePermission();
  const router = useRouter();
  const { isLoggedIn, loading } = useAuth();
  const { data, isLoading, error } = useDashboard();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn, loading, router]);

  if (loading || !isLoggedIn) return null;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-error font-medium">
        Failed to load dashboard data.
      </div>
    );
  }

  // Fallback if trying to render but permissions are missing entirely
  if (
    userPermissions.length > 0 &&
    !userPermissions.some((p) => p.startsWith("view-"))
  ) {
    return (
      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-10 text-center mt-10 mx-auto max-w-xl">
        <p className="font-['Manrope'] font-bold text-lg text-on-surface mb-2">
          Tidak Ada Data yang Dapat Ditampilkan
        </p>
        <p className="text-sm text-on-surface-variant">
          Kamu tidak memiliki izin untuk melihat statistik dashboard. Akses
          fitur spesifik melalui menu navigasi.
        </p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const {
    users,
    activities,
    inventory,
    donations,
    recruitment,
    recent_activities,
    recent_registrations,
  } = data;

  const totalCapacity = 1500;
  const inventoryPercentage =
    totalCapacity > 0 ? (inventory.total_assets / totalCapacity) * 100 : 0;
  const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL || "";

  return (
    <>
      <header className="mb-10">
        <h2 className="font-['Manrope'] text-3xl font-headline font-extrabold text-on-surface tracking-tight">
          Dashboard
        </h2>
        <p className="font-['Manrope'] text-on-surface-variant font-body mt-1">
          Institutional performance at a glance.
        </p>
      </header>

      {/* Statistics Grid (Bento Style) */}
      <div className=" font-['Manrope'] grid grid-cols-12 gap-6 mb-8">
        {/* Total Users Stats */}
        <div className="col-span-12 md:col-span-3 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined">group</span>
            </div>
            {/* Kept span as placeholder for percent changes if ever supported by backend */}
            {/* <span className="text-xs font-bold px-2 py-1 bg-primary-fixed text-on-primary-fixed-variant rounded-full">+12.5%</span> */}
          </div>
          <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
            Total Users
          </p>
          <h3 className="text-3xl font-headline font-bold text-on-surface mt-1">
            {users.total_users}
          </h3>
          <div className="mt-4 h-12 flex items-end gap-1">
            <div className="w-full bg-primary/20 h-4 rounded-sm"></div>
            <div className="w-full bg-primary/20 h-6 rounded-sm"></div>
            <div className="w-full bg-primary/20 h-5 rounded-sm"></div>
            <div className="w-full bg-primary/20 h-8 rounded-sm"></div>
            <div className="w-full bg-primary/20 h-10 rounded-sm"></div>
            <div className="w-full bg-primary h-12 rounded-sm"></div>
          </div>
        </div>

        {/* Total Donations Stats */}
        <div className="font-['Manrope'] col-span-12 md:col-span-3 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined">
                volunteer_activism
              </span>
            </div>
          </div>
          <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
            Monthly Donations
          </p>
          <h3 className="text-3xl font-headline font-bold text-on-surface mt-1">
            {formatRupiah(donations.total_amount)}
          </h3>
          <p className="text-xs text-on-surface-variant mt-4 flex items-center">
            <span className="material-symbols-outlined text-[14px] mr-1 text-primary">
              trending_up
            </span>
            {donations.total_donations} transaksi masuk
          </p>
        </div>

        {/* Available Assets */}
        <div className="col-span-12 md:col-span-3 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
          </div>
          <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
            Curated Assets
          </p>
          <h3 className="text-3xl font-headline font-bold text-on-surface mt-1">
            {inventory.total_assets}
          </h3>
          <div className="mt-4 w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full"
              style={{ width: `${Math.min(inventoryPercentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-2">
            {Math.round(inventoryPercentage)}% of expected capacity
          </p>
        </div>

        {/* Open Recruitments */}
        <div className="col-span-12 md:col-span-3 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined">person_add</span>
            </div>
          </div>
          <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
            Active Recruitments
          </p>
          <h3 className="text-3xl font-headline font-bold text-on-surface mt-1">
            {recruitment.total_open_recruitments}
          </h3>
          <div className="mt-4 flex -space-x-2">
            <img
              alt=""
              className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuPcJQmxwZb3_M8lWkCAVxq1luXEF_B0hiEF0GqJQiycFxOD16TdlXbfHSUTZXOaDsgFF1r8aUlscUxVqOobFSqlzSYi2XholZadNRgBypCZ_oNfOXf4_DII0RMN_Dd9OSIBibP2kmDP6hUJjNcsnKscjHYxmxgUJA3Ydl69HZBhT1HEd-Udpnl4BpM-r_GyuF3ZotrL6L1lbE0l_ExU_qLiAFJlTmNckT-R3VKEx62kDjQkSTjnI-CfReKosZ2RN52baWavHwLQ"
            />
            <img
              alt=""
              className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCH9zG92kHfEvP-05j3ji5mNGamUXYvg3oojFDjxR_qxG9eUh8G1CgY0TpxSuxYo76FwC-DGasHGzwY5IEMTIkjezJXYok5ELqGgk_8Eoh3dwdmltmagoB6hVlNj_kxE00cjF3dbp7eihTmtM1uXGmlTnvl0_fN7MFmplMFXK0ZP3giKpMygQpX9yVylBuIUe30XsxPy0te6-8ezjVoN_zLbF_tqGjQSh76u3xX6I8Wg2S64L7daccoIYx46AhYwpK_xjGf59gZRw"
            />
            <img
              alt=""
              className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwPXAa5yAQ2zrW5a9rHyCuIUPKkPTqtC7IX0FTJ-Zp7V3DJA1_aXesY41LgV5jjJyfASFBRTEJDimxeBnTYBI72tMFcAHcubgYqtRTKnsyMbb5sfAfqTZah1MR9no9B8JrDv6dJWkdM1t86IGbWLxddgDJADpv-L_cwChminVjfwawIvB1hgSr5vokemQGSDaFoVsZzyRTlxziZS1uIPyB4K_lQBoTa_Wako70w59x9aNGie2eh-5oX3RUR5cIcTl42VQmHxuP9g"
            />
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-surface-container-high text-[10px] font-bold">
              ...
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analysis Section */}
      <div className="font-['Manrope'] grid grid-cols-12 gap-6 pb-10">
        {/* Donation Summary Chart Area */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h4 className="text-lg font-headline font-bold text-on-surface">
                  Donation Summary
                </h4>
                <p className="text-sm text-on-surface-variant font-body">
                  Year-over-year growth analytics
                </p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-1.5 bg-surface-container-low text-on-surface text-xs font-medium rounded-full hover:bg-surface-container-high transition-colors">
                  Daily
                </button>
                <button className="px-4 py-1.5 bg-primary text-white text-xs font-medium rounded-full">
                  Monthly
                </button>
              </div>
            </div>
          </div>

          <div className="relative h-64 w-full flex items-end justify-between px-4 pb-4 overflow-x-auto gap-4">
            {donations.monthly_breakdown &&
            donations.monthly_breakdown.length > 0 ? (
              donations.monthly_breakdown.slice(-7).map((item, index, arr) => {
                const maxAmount = Math.max(...arr.map((a) => a.amount));
                const heightPercentage =
                  maxAmount > 0
                    ? Math.max((item.amount / maxAmount) * 100, 10)
                    : 10;

                // Format month text like "Agu"
                const monthName = new Date(`${item.month}-01`).toLocaleString(
                  "id-ID",
                  { month: "short" },
                );
                const isLatest = index === arr.length - 1;

                if (isLatest) {
                  return (
                    <div
                      key={item.month}
                      className="flex flex-col items-center group w-12 shrink-0"
                    >
                      <div className="w-10 bg-primary/30 rounded-t-lg h-60 relative ring-4 ring-primary/5">
                        <div
                          className="absolute bottom-0 w-10 bg-gradient-to-t from-primary to-primary-container rounded-t-lg"
                          style={{ height: `${heightPercentage}%` }}
                        ></div>
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] py-1 px-2 rounded font-bold shadow-xl whitespace-nowrap">
                          {formatRupiah(item.amount)}
                        </div>
                      </div>
                      <span className="text-[10px] mt-2 text-primary font-bold">
                        {monthName}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.month}
                    className="flex flex-col items-center group w-12 shrink-0"
                  >
                    <div className="w-8 bg-primary/10 group-hover:bg-primary/20 transition-all rounded-t-lg h-48 relative">
                      <div
                        className="absolute bottom-0 w-8 bg-primary rounded-t-lg"
                        style={{ height: `${heightPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] mt-2 text-on-surface-variant font-medium">
                      {monthName}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full text-center text-sm text-on-surface-variant mb-10">
                Belum ada data historis donasi.
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="font-['Manrope'] col-span-12 lg:col-span-4 bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-headline font-bold text-on-surface mb-6">
              Recent Activities
            </h4>
            <div className="space-y-6 overflow-y-auto max-h-[350px] no-scrollbar">
              {recent_activities.length === 0 ? (
                <p className="text-sm text-on-surface-variant">
                  Belum ada kegiatan terbaru.
                </p>
              ) : (
                recent_activities.map((act) => {
                  const sCfg = statusCfg(act.status);
                  return (
                    <div key={act.id} className="flex gap-4">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full ${sCfg.variant.split(" ")[0]} flex items-center justify-center`}
                      >
                        <span
                          className={`material-symbols-outlined text-sm ${sCfg.variant.split(" ")[1]}`}
                        >
                          event
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">
                          {act.judul}
                        </p>
                        <p className="text-xs text-on-surface-variant line-clamp-1">
                          {act.deskripsi || act.lokasi}
                        </p>
                        <span className="text-[10px] text-outline font-medium">
                          {timeAgo(act.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <button
            className="w-full mt-6 py-2 border-t border-outline-variant/20 text-xs font-bold text-primary hover:text-primary-container transition-colors uppercase tracking-widest"
            onClick={() => router.push("/dashboard/activities")}
          >
            View All Activities
          </button>
        </div>

        {/* Recent Registrations */}
        <div className="font-['Manrope'] col-span-12 bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10 mt-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="text-lg font-headline font-bold text-on-surface">
                Recent Registrations
              </h4>
              <p className="text-sm text-on-surface-variant">
                Newly vetted or registered users
              </p>
            </div>
            <button
              className="text-sm font-bold text-primary flex items-center"
              onClick={() => router.push("/dashboard/users")}
            >
              See all users{" "}
              <span className="material-symbols-outlined ml-1">
                arrow_forward
              </span>
            </button>
          </div>
          <div className="space-y-4">
            {recent_registrations.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                Belum ada registrasi terbaru.
              </p>
            ) : (
              recent_registrations.slice(0, 5).map((user) => {
                const sCfg = statusCfg(user.status);
                // Try to format roles string neatly
                const applyFor =
                  user.roles && user.roles.length > 0
                    ? user.roles
                        .map((r) => r.name.replace(/_/g, " "))
                        .join(", ")
                    : "Member";

                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-surface hover:bg-surface-container transition-all rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      {user.avatar_url ? (
                        <img
                          className="w-10 h-10 rounded-full object-cover"
                          src={
                            user.avatar_url.startsWith("http")
                              ? user.avatar_url
                              : `${mediaUrl}${user.avatar_url}`
                          }
                          alt={user.nama}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold">
                          {user.nama.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-on-surface">
                          {user.nama}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="hidden md:block w-48 truncate">
                      <p className="text-xs font-medium text-on-surface-variant mb-1">
                        Applied For
                      </p>
                      <p className="text-xs font-bold text-on-surface capitalize">
                        {applyFor}
                      </p>
                    </div>

                    <div className="hidden md:block w-32">
                      <p className="text-xs font-medium text-on-surface-variant mb-1">
                        Status
                      </p>
                      <span
                        className={`px-3 py-1 text-[10px] font-bold rounded-full ${sCfg.variant}`}
                      >
                        {sCfg.label}
                      </span>
                    </div>

                    <button className="px-4 py-2 bg-surface-container-high rounded-full hover:bg-surface-container-highest transition-colors">
                      <span className="material-symbols-outlined text-sm">
                        more_vert
                      </span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
