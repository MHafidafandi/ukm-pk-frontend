import { Users, UserCheck, Clock, TrendingUp } from "lucide-react";

type Props = {
    loanStats: {
        total_all: number;
        // total_dikembalikan: number;
        total_dipinjam: number;
        // total_hilang: number;
        total_overdue: number;
        total_rusak: number;
    };
};

export const LoanStats = ({ loanStats }: Props) => {
    const items = [
        {
            label: "Total Loan",
            value: loanStats.total_all,
            icon: Users,
            ringClass: "bg-purple-100 dark:bg-purple-900/30 text-primary",
            hoverClass: "hover:border-primary/50",
        },
        // {
        //     label: "Total Assets Returned",
        //     value: loanStats.total_dikembalikan,
        //     icon: TrendingUp,
        //     ringClass:
        //         "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
        //     hoverClass: "hover:border-blue-500/50",
        // },
        {
            label: "Total Assets In Use",
            value: loanStats.total_dipinjam,
            icon: TrendingUp,
            ringClass:
                "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
            hoverClass: "hover:border-blue-500/50",
        },
        // {
        //     label: "Total Assets Lost",
        //     value: loanStats.total_hilang,
        //     icon: TrendingUp,
        //     ringClass:
        //         "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
        //     hoverClass: "hover:border-blue-500/50",
        // },
        {
            label: "Total Assets Overdue",
            value: loanStats.total_overdue,
            icon: TrendingUp,
            ringClass:
                "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
            hoverClass: "hover:border-blue-500/50",
        },
        {
            label: "Total Assets Damaged",
            value: loanStats.total_rusak,
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
