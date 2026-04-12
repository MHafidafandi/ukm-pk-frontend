import { Users, UserCheck, Clock, TrendingUp } from "lucide-react";

type Props = {
  stats: {
    total: number;
    active: number;
    inactive: number;
    alumni: number;
  };
};

export const UsersStats = ({ stats }: Props) => {
  const items = [
    {
      label: "Total Anggota",
      value: stats.total,
      icon: Users,
      iconBg: "bg-secondary-container",
      iconColor: "text-on-secondary-container",
    },
    {
      label: "Anggota Aktif",
      value: stats.active,
      icon: UserCheck,
      iconBg: "bg-primary-fixed",
      iconColor: "text-on-primary-fixed-variant",
    },
    {
      label: "Nonaktif",
      value: stats.inactive,
      icon: Clock,
      iconBg: "bg-tertiary-fixed",
      iconColor: "text-on-tertiary-fixed-variant",
    },
    {
      label: "Alumni",
      value: stats.alumni,
      icon: TrendingUp,
      iconBg: "bg-secondary-fixed",
      iconColor: "text-on-secondary-fixed-variant",
    },
  ];

  return (
    <>
      {items.map((s) => (
        <div
          key={s.label}
          className="bg-surface-container-lowest rounded-2xl p-6 flex items-center justify-between shadow-ambient"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">
              {s.label}
            </p>
            <h3 className="font-['Manrope'] text-2xl font-bold text-on-surface">
              {s.value.toLocaleString()}
            </h3>
          </div>
          <div
            className={`h-12 w-12 rounded-full flex items-center justify-center ${s.iconBg}`}
          >
            <s.icon className={`h-5 w-5 ${s.iconColor}`} />
          </div>
        </div>
      ))}
    </>
  );
};
