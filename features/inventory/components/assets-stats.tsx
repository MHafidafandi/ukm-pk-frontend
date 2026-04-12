import { Package, CheckCircle2, Wrench, TrendingUp } from "lucide-react";

type Props = {
  stats: {
    total_assets: number;
    available_assets: number;
    condition_summary: {
      kondisi: string;
      count: number;
    }[];
  };
};

type StatItem = {
  label: string;
  value: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  sub?: string;
};

export const AssetsStats = ({ stats }: Props) => {
  const goodCount =
    stats.condition_summary.find((s) => s.kondisi === "baik")?.count ?? 0;
  const minorDamageCount =
    stats.condition_summary.find((s) => s.kondisi === "rusak_ringan")?.count ??
    0;
  const majorDamageCount =
    stats.condition_summary.find((s) => s.kondisi === "rusak_berat")?.count ??
    0;
  const maintenanceCount = minorDamageCount + majorDamageCount;

  const items: StatItem[] = [
    {
      label: "Total Aset",
      value: stats.total_assets,
      icon: Package,
      iconBg: "bg-secondary-container",
      iconColor: "text-on-secondary-container",
      sub: `${stats.condition_summary.length} kategori kondisi`,
    },
    {
      label: "Aset Tersedia",
      value: stats.available_assets,
      icon: CheckCircle2,
      iconBg: "bg-primary-fixed",
      iconColor: "text-on-primary-fixed-variant",
      sub: "Siap dipinjam",
    },
    {
      label: "Kondisi Baik",
      value: goodCount,
      icon: TrendingUp,
      iconBg: "bg-secondary-fixed",
      iconColor: "text-on-secondary-fixed-variant",
      sub: "Tidak perlu perbaikan",
    },
    {
      label: "Perlu Perbaikan",
      value: maintenanceCount,
      icon: Wrench,
      iconBg: "bg-tertiary-fixed",
      iconColor: "text-on-tertiary-fixed-variant",
      sub: `${minorDamageCount} ringan · ${majorDamageCount} berat`,
    },
  ];

  return (
    <>
      {items.map((s) => (
        <div
          key={s.label}
          className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`w-11 h-11 rounded-full ${s.iconBg} flex items-center justify-center shrink-0`}
            >
              <s.icon className={`w-5 h-5 ${s.iconColor}`} strokeWidth={2} />
            </div>
            <span className="text-on-surface-variant font-medium text-sm">
              {s.label}
            </span>
          </div>
          <p className="font-['Manrope'] font-extrabold text-2xl text-on-surface">
            {s.value}
          </p>
          {s.sub && (
            <p className="text-xs text-on-surface-variant mt-1.5">{s.sub}</p>
          )}
        </div>
      ))}
    </>
  );
};
