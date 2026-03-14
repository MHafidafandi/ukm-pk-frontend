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
      label: "Total Members",
      value: stats.total,
      icon: Users,
      ringClass: "bg-purple-100 dark:bg-purple-900/30 text-primary",
      hoverClass: "hover:border-primary/50",
    },
    {
      label: "Active Users",
      value: stats.active,
      icon: UserCheck,
      ringClass:
        "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
      hoverClass: "hover:border-green-500/50",
    },
    {
      label: "Pending / Inactive",
      value: stats.inactive,
      icon: Clock,
      ringClass:
        "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
      hoverClass: "hover:border-orange-500/50",
    },
    {
      label: "Alumni",
      value: stats.alumni,
      icon: TrendingUp,
      ringClass:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      hoverClass: "hover:border-blue-500/50",
    },
  ];

  return (
    <>
      {items.map((s) => (
        <div
          key={s.label}
          className={`bg-slate-50/50 dark:bg-slate-800 p-6 rounded-2xl shadow-soft border border-border-light dark:border-border-dark flex items-center justify-between group transition-all ${s.hoverClass}`}
        >
          <div>
            <p className="text-sm font-medium text-subtext-light dark:text-subtext-dark">
              {s.label}
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {s.value}
            </h3>
          </div>
          <div
            className={`h-12 w-12 rounded-xl flex items-center justify-center ${s.ringClass}`}
          >
            <s.icon className="h-6 w-6" />
          </div>
        </div>
      ))}
    </>
  );
};
