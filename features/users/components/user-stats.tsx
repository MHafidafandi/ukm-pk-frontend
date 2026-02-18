import { Card, CardContent } from "@/components/ui/card";

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
    { label: "Total Anggota", value: stats.total, color: "text-primary" },
    { label: "Aktif", value: stats.active, color: "text-green-600" },
    {
      label: "Nonaktif",
      value: stats.inactive,
      color: "text-muted-foreground",
    },
    { label: "Alumni", value: stats.alumni, color: "text-orange-600" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.map((s) => (
        <Card key={s.label}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
