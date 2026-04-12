"use client";

import { useUserContext } from "@/features/users/contexts/UserContext";
import { useDivisionContext } from "@/features/divisions/contexts/DivisionContext";
import { useActivityContext } from "@/features/activities/contexts/ActivityContext";
import { useDonationContext } from "@/features/donation/contexts/DonationContext";
import { useAssetContext } from "@/features/inventory/contexts/AssetContext";
import {
  Users,
  UserCheck,
  UserX,
  Building2,
  CalendarDays,
  CalendarCheck,
  CalendarClock,
  HeartHandshake,
  BadgeCheck,
  Clock,
  Package,
  PackageCheck,
  AlertTriangle,
  Loader2,
  TrendingUp,
} from "lucide-react";

// ── Shared Primitives ─────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  sub,
  loading,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  sub?: string;
  loading?: boolean;
}) => (
  <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col gap-4">
    <div className="flex items-center gap-4">
      <div
        className={`w-11 h-11 rounded-full ${iconBg} flex items-center justify-center shrink-0`}
      >
        <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={2} />
      </div>
      <span className="text-on-surface-variant font-medium text-sm">
        {label}
      </span>
    </div>
    {loading ? (
      <div className="flex items-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-outline" />
        <span className="text-sm text-on-surface-variant">Memuat...</span>
      </div>
    ) : (
      <>
        <p className="font-['Manrope'] font-extrabold text-2xl text-on-surface">
          {value}
        </p>
        {sub && <p className="text-xs text-on-surface-variant -mt-2">{sub}</p>}
      </>
    )}
  </div>
);

// Badge pill kecil untuk highlight di dalam card
const Pill = ({
  label,
  variant,
}: {
  label: string;
  variant: "primary" | "secondary" | "tertiary" | "error" | "neutral";
}) => {
  const styles = {
    primary: "bg-primary-fixed text-on-primary-fixed-variant",
    secondary: "bg-secondary-fixed text-on-secondary-fixed-variant",
    tertiary: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
    error: "bg-error-container text-on-error-container",
    neutral: "bg-surface-container text-on-surface-variant",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${styles[variant]}`}
    >
      {label}
    </span>
  );
};

// Card yang lebih lebar untuk breakdown detail
const DetailCard = ({
  title,
  loading,
  children,
}: {
  title: string;
  loading?: boolean;
  children: React.ReactNode;
}) => (
  <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm col-span-full flex flex-col gap-4">
    <p className="font-['Manrope'] font-bold text-base text-on-surface">
      {title}
    </p>
    {loading ? (
      <div className="flex items-center gap-2 text-on-surface-variant text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Memuat data...
      </div>
    ) : (
      children
    )}
  </div>
);

// ── User Stats ────────────────────────────────────────────────────────────────

export const UserStats = () => {
  const { stats, isFetchingStats } = useUserContext();

  const total = stats?.total_users ?? 0;
  const active = stats?.active_users ?? 0;
  const inactive = stats?.inactive_users ?? 0;
  const alumni = stats?.alumni_users ?? 0;

  const topDivisions = (stats?.users_by_division ?? [])
    .filter((d) => d.user_count > 0)
    .slice(0, 5);

  return (
    <>
      {/* Primary stat */}
      <StatCard
        label="Total Anggota"
        value={total}
        icon={Users}
        iconBg="bg-secondary-container"
        iconColor="text-on-secondary-container"
        sub={`${active} aktif · ${inactive} nonaktif · ${alumni} alumni`}
        loading={isFetchingStats}
      />

      {/* Sub stats */}
      <StatCard
        label="Anggota Aktif"
        value={active}
        icon={UserCheck}
        iconBg="bg-primary-fixed"
        iconColor="text-on-primary-fixed-variant"
        loading={isFetchingStats}
      />

      <StatCard
        label="Nonaktif / Alumni"
        value={inactive + alumni}
        icon={UserX}
        iconBg="bg-surface-container-high"
        iconColor="text-on-surface-variant"
        loading={isFetchingStats}
      />

      {/* Breakdown divisi */}
      <DetailCard
        title="Distribusi Anggota per Divisi"
        loading={isFetchingStats}
      >
        <div className="flex flex-col gap-3">
          {topDivisions.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              Belum ada data divisi.
            </p>
          ) : (
            topDivisions.map((div) => (
              <div key={div.division_id} className="flex items-center gap-3">
                <span className="text-sm text-on-surface font-medium w-36 truncate">
                  {div.division_name}
                </span>
                <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: div.percentage }}
                  />
                </div>
                <span className="text-xs text-on-surface-variant w-16 text-right">
                  {div.user_count} ({div.percentage})
                </span>
              </div>
            ))
          )}
        </div>
      </DetailCard>
    </>
  );
};

// ── Division Stats ────────────────────────────────────────────────────────────

export const DivisionStats = () => {
  const { divisionStats, isFetchingStats } = useDivisionContext();

  const total = divisionStats?.total_divisions ?? 0;
  const totalUsers = divisionStats?.total_users ?? 0;
  const avg = divisionStats?.average_users_per_division ?? 0;

  const topDivisions = (divisionStats?.divisions ?? [])
    .sort((a, b) => b.user_count - a.user_count)
    .slice(0, 5);

  return (
    <>
      <StatCard
        label="Total Divisi"
        value={total}
        icon={Building2}
        iconBg="bg-secondary-container"
        iconColor="text-on-secondary-container"
        sub={`Rata-rata ${Math.round(avg)} anggota per divisi`}
        loading={isFetchingStats}
      />

      <StatCard
        label="Total Anggota di Divisi"
        value={totalUsers}
        icon={Users}
        iconBg="bg-primary-fixed"
        iconColor="text-on-primary-fixed-variant"
        loading={isFetchingStats}
      />

      <DetailCard
        title="Divisi dengan Anggota Terbanyak"
        loading={isFetchingStats}
      >
        <div className="flex flex-col gap-3">
          {topDivisions.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Belum ada data.</p>
          ) : (
            topDivisions.map((div) => (
              <div key={div.division_id} className="flex items-center gap-3">
                <span className="text-sm text-on-surface font-medium w-36 truncate">
                  {div.nama_divisi}
                </span>
                <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary rounded-full transition-all"
                    style={{
                      width:
                        totalUsers > 0
                          ? `${(div.user_count / totalUsers) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
                <span className="text-xs text-on-surface-variant w-16 text-right">
                  {div.user_count} anggota
                </span>
              </div>
            ))
          )}
        </div>
      </DetailCard>
    </>
  );
};

// ── Activity Stats ────────────────────────────────────────────────────────────

export const ActivityStats = () => {
  const { activities, isFetchingActivities, pagination } = useActivityContext();

  const total = pagination?.total ?? 0;
  const ongoing = activities.filter((a) => a.status === "ongoing").length;
  const completed = activities.filter((a) => a.status === "completed").length;
  const planning = activities.filter((a) => a.status === "pending").length;

  const recentActivities = [...activities]
    .sort(
      (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime(),
    )
    .slice(0, 4);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const statusCfg = (status: string) => {
    const s = status.toLowerCase();
    if (s === "ongoing")
      return { label: "Berjalan", variant: "primary" as const };
    if (s === "completed")
      return { label: "Selesai", variant: "secondary" as const };
    if (s === "pending")
      return { label: "Perencanaan", variant: "tertiary" as const };
    return { label: "Dibatalkan", variant: "error" as const };
  };

  return (
    <>
      <StatCard
        label="Total Kegiatan"
        value={total}
        icon={CalendarDays}
        iconBg="bg-secondary-container"
        iconColor="text-on-secondary-container"
        sub={`${ongoing} berjalan · ${planning} perencanaan`}
        loading={isFetchingActivities}
      />

      <StatCard
        label="Kegiatan Selesai"
        value={completed}
        icon={CalendarCheck}
        iconBg="bg-secondary-fixed"
        iconColor="text-on-secondary-fixed-variant"
        loading={isFetchingActivities}
      />

      <StatCard
        label="Sedang Berjalan"
        value={ongoing}
        icon={CalendarClock}
        iconBg="bg-primary-fixed"
        iconColor="text-on-primary-fixed-variant"
        loading={isFetchingActivities}
      />

      <DetailCard title="Kegiatan Terbaru" loading={isFetchingActivities}>
        <div className="flex flex-col divide-y divide-outline-variant/10">
          {recentActivities.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              Belum ada kegiatan.
            </p>
          ) : (
            recentActivities.map((act) => {
              const cfg = statusCfg(act.status);
              return (
                <div
                  key={act.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex flex-col gap-0.5 min-w-0 pr-4">
                    <p className="text-sm font-medium text-on-surface truncate">
                      {act.judul}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {act.lokasi} · {formatDate(act.tanggal)}
                    </p>
                  </div>
                  <Pill label={cfg.label} variant={cfg.variant} />
                </div>
              );
            })
          )}
        </div>
      </DetailCard>
    </>
  );
};

// ── Donation Stats ────────────────────────────────────────────────────────────

export const DonationStats = () => {
  const { stats, isLoadingStats, donations } = useDonationContext();

  const data = stats?.data;
  const totalAmount = data?.total_amount ?? 0;
  const verifiedAmount = data?.verified_amount ?? 0;
  const pendingAmount = data?.pending_amount ?? 0;
  const totalDonations = data?.total_donations ?? 0;

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      notation: "compact",
      compactDisplay: "short",
    }).format(amount);

  const recentDonations = [...(donations ?? [])].slice(0, 4);

  const statusCfg = (status: string) => {
    if (status === "verified")
      return { label: "Verified", variant: "secondary" as const };
    if (status === "pending")
      return { label: "Pending", variant: "tertiary" as const };
    if (status === "rejected")
      return { label: "Ditolak", variant: "error" as const };
    return { label: status, variant: "neutral" as const };
  };

  return (
    <>
      <StatCard
        label="Total Dana Terverifikasi"
        value={formatRupiah(verifiedAmount)}
        icon={BadgeCheck}
        iconBg="bg-primary-fixed"
        iconColor="text-on-primary-fixed-variant"
        sub={`${totalDonations} total transaksi`}
        loading={isLoadingStats}
      />

      <StatCard
        label="Menunggu Verifikasi"
        value={formatRupiah(pendingAmount)}
        icon={Clock}
        iconBg="bg-tertiary-fixed"
        iconColor="text-on-tertiary-fixed-variant"
        sub="Perlu ditinjau manual"
        loading={isLoadingStats}
      />

      <StatCard
        label="Total Donasi"
        value={formatRupiah(totalAmount)}
        icon={HeartHandshake}
        iconBg="bg-secondary-container"
        iconColor="text-on-secondary-container"
        loading={isLoadingStats}
      />

      <DetailCard title="Donasi Terbaru" loading={isLoadingStats}>
        <div className="flex flex-col divide-y divide-outline-variant/10">
          {recentDonations.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Belum ada donasi.</p>
          ) : (
            recentDonations.map((don) => {
              const cfg = statusCfg(don.status);
              return (
                <div
                  key={don.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex flex-col gap-0.5 min-w-0 pr-4">
                    <p className="text-sm font-medium text-on-surface truncate">
                      {don.nama_donatur}
                    </p>
                    <p className="text-xs text-on-surface-variant capitalize">
                      {don.metode.replace(/_/g, " ")} ·{" "}
                      {new Date(don.tanggal).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="font-['Manrope'] font-bold text-sm text-on-surface">
                      {formatRupiah(don.jumlah)}
                    </span>
                    <Pill label={cfg.label} variant={cfg.variant} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DetailCard>
    </>
  );
};

// ── Inventory Stats ───────────────────────────────────────────────────────────

export const InventoryStats = () => {
  const { stats, loanStatsData, isFetchingAssets } = useAssetContext();

  const totalAssets = stats?.total_assets ?? 0;
  const availableAssets = stats?.available_assets ?? 0;
  const activeLoans = stats?.active_loans ?? 0;
  const overdue = loanStatsData?.total_overdue ?? 0;
  const conditionSummary = stats?.condition_summary ?? [];

  const goodCount =
    conditionSummary.find((c) => c.kondisi === "baik")?.count ?? 0;
  const damagedCount = conditionSummary
    .filter((c) => c.kondisi !== "baik" && c.kondisi !== "dipinjam")
    .reduce((sum, c) => sum + c.count, 0);

  return (
    <>
      <StatCard
        label="Total Aset"
        value={totalAssets}
        icon={Package}
        iconBg="bg-secondary-container"
        iconColor="text-on-secondary-container"
        sub={`${availableAssets} tersedia · ${activeLoans} dipinjam`}
        loading={isFetchingAssets}
      />

      <StatCard
        label="Aset Tersedia"
        value={availableAssets}
        icon={PackageCheck}
        iconBg="bg-primary-fixed"
        iconColor="text-on-primary-fixed-variant"
        loading={isFetchingAssets}
      />

      <StatCard
        label="Peminjaman Terlambat"
        value={overdue}
        icon={AlertTriangle}
        iconBg={
          overdue > 0 ? "bg-error-container" : "bg-surface-container-high"
        }
        iconColor={
          overdue > 0 ? "text-on-error-container" : "text-on-surface-variant"
        }
        sub={overdue > 0 ? "Perlu tindakan segera" : "Tidak ada keterlambatan"}
        loading={isFetchingAssets}
      />

      {/* Kondisi Aset Breakdown */}
      <DetailCard title="Kondisi Aset" loading={isFetchingAssets}>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Kondisi Baik",
                value: goodCount,
                variant: "primary" as const,
                icon: PackageCheck,
                iconBg: "bg-primary-fixed",
                iconColor: "text-on-primary-fixed-variant",
              },
              {
                label: "Perlu Perbaikan",
                value: damagedCount,
                variant: "tertiary" as const,
                icon: AlertTriangle,
                iconBg: "bg-tertiary-fixed",
                iconColor: "text-on-tertiary-fixed-variant",
              },
              {
                label: "Aktif Dipinjam",
                value: activeLoans,
                variant: "secondary" as const,
                icon: TrendingUp,
                iconBg: "bg-secondary-fixed",
                iconColor: "text-on-secondary-fixed-variant",
              },
              {
                label: "Overdue",
                value: overdue,
                variant:
                  overdue > 0 ? ("error" as const) : ("neutral" as const),
                icon: AlertTriangle,
                iconBg:
                  overdue > 0
                    ? "bg-error-container"
                    : "bg-surface-container-high",
                iconColor:
                  overdue > 0
                    ? "text-on-error-container"
                    : "text-on-surface-variant",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-surface-container rounded-xl p-4 flex flex-col gap-2"
              >
                <div
                  className={`w-8 h-8 rounded-full ${item.iconBg} flex items-center justify-center`}
                >
                  <item.icon
                    className={`w-4 h-4 ${item.iconColor}`}
                    strokeWidth={2}
                  />
                </div>
                <p className="font-['Manrope'] font-bold text-xl text-on-surface">
                  {item.value}
                </p>
                <p className="text-xs text-on-surface-variant">{item.label}</p>
              </div>
            ))}
          </div>

          {conditionSummary.length > 0 && (
            <div className="flex flex-col gap-2 pt-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Detail kondisi
              </p>
              {conditionSummary.map((c) => (
                <div key={c.kondisi} className="flex items-center gap-3">
                  <span className="text-sm text-on-surface font-medium w-32 truncate capitalize">
                    {c.kondisi.replace(/_/g, " ")}
                  </span>
                  <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width:
                          totalAssets > 0
                            ? `${(c.count / totalAssets) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                  <span className="text-xs text-on-surface-variant w-12 text-right">
                    {c.count} unit
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DetailCard>
    </>
  );
};
