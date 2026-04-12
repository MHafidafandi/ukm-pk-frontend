import { ShoppingBag, Clock, AlertTriangle, Hammer } from "lucide-react";

type Props = {
  loanStats: {
    total_all: number;
    total_dipinjam: number;
    total_overdue: number;
    total_rusak: number;
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

export const LoanStats = ({ loanStats }: Props) => {
  const items: StatItem[] = [
    {
      label: "Total Peminjaman",
      value: loanStats.total_all,
      icon: ShoppingBag,
      iconBg: "bg-secondary-container",
      iconColor: "text-on-secondary-container",
      sub: "Semua periode",
    },
    {
      label: "Sedang Dipinjam",
      value: loanStats.total_dipinjam,
      icon: Clock,
      iconBg: "bg-primary-fixed",
      iconColor: "text-on-primary-fixed-variant",
      sub: "Aktif saat ini",
    },
    {
      label: "Terlambat Dikembalikan",
      value: loanStats.total_overdue,
      icon: AlertTriangle,
      iconBg: "bg-error-container",
      iconColor: "text-on-error-container",
      sub: "Perlu tindakan segera",
    },
    {
      label: "Aset Rusak",
      value: loanStats.total_rusak,
      icon: Hammer,
      iconBg: "bg-tertiary-fixed",
      iconColor: "text-on-tertiary-fixed-variant",
      sub: "Saat pengembalian",
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
