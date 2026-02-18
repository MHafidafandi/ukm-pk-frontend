import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dashboardStats, mockActivities, mockDonations } from "@/mocks/data";
import { Calendar, Heart, Package, Users } from "lucide-react";

const statusVariant: Record<string, string> = {
  planning: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  ongoing:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  verified: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusLabel: Record<string, string> = {
  planning: "Perencanaan",
  ongoing: "Berjalan",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  pending: "Menunggu",
  verified: "Terverifikasi",
  rejected: "Ditolak",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Ringkasan data SI-PEDULI</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Anggota"
          value={dashboardStats.totalMembers}
          icon={Users}
          description={`${dashboardStats.activeMembers} aktif`}
        />
        <StatCard
          title="Kegiatan Aktif"
          value={dashboardStats.activeActivities}
          icon={Calendar}
          description={`${dashboardStats.totalActivities} total kegiatan`}
        />
        <StatCard
          title="Total Donasi"
          value={formatCurrency(dashboardStats.totalDonations)}
          icon={Heart}
          description={`${dashboardStats.pendingDonations} menunggu verifikasi`}
        />
        <StatCard
          title="Aset Tersedia"
          value={dashboardStats.totalAssets}
          icon={Package}
          description="Unit terkelola"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kegiatan Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockActivities.slice(0, 4).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {activity.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.date}
                    </p>
                  </div>
                  <Badge
                    // variant="secondary"
                    className={statusVariant[activity.status]}
                  >
                    {statusLabel[activity.status]}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Donations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Donasi Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockDonations.slice(0, 4).map((donation) => (
                <div
                  key={donation.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {donation.donorName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(donation.amount)}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={statusVariant[donation.status]}
                  >
                    {statusLabel[donation.status]}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
