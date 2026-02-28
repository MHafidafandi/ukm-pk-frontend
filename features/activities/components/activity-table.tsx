import { Button } from "@/components/ui/button";
import {
  Edit,
  Eye,
  MapPin,
  Calendar,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { Activity } from "../services/activityService";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type Props = {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
  onViewDetail: (activity: Activity) => void;
};

const statusConfig: Record<string, { label: string; colorClass: string }> = {
  ongoing: { label: "Berjalan", colorClass: "bg-blue-500/90" },
  completed: { label: "Selesai", colorClass: "bg-emerald-500/90" },
  pending: { label: "Perencanaan", colorClass: "bg-amber-500/90" },
  cancelled: { label: "Dibatalkan", colorClass: "bg-rose-500/90" },
};

export const ActivityGrid = ({
  activities,
  onEdit,
  onDelete,
  onViewDetail,
}: Props) => {
  if (activities.length === 0) {
    return (
      <div className="flex h-48 w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 text-muted-foreground">
        <p>Tidak ada data kegiatan.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {activities.map((item, idx) => {
        const isOngoing =
          item.status.toLowerCase() === "ongoing" ||
          item.status.toLowerCase() === "berjalan";
        const isCompleted =
          item.status.toLowerCase() === "selesai" ||
          item.status.toLowerCase() === "completed";
        const isPending =
          item.status.toLowerCase() === "perencanaan" ||
          item.status.toLowerCase() === "pending";

        let statusConfig: { label: string; colorClass: string } = {
          label: item.status,
          colorClass: "bg-gray-500/90",
        };
        if (isOngoing)
          statusConfig = { label: "Berjalan", colorClass: "bg-blue-500/90" };
        else if (isCompleted)
          statusConfig = { label: "Selesai", colorClass: "bg-emerald-500/90" };
        else if (isPending)
          statusConfig = {
            label: "Perencanaan",
            colorClass: "bg-amber-500/90",
          };
        else
          statusConfig = { label: "Dibatalkan", colorClass: "bg-rose-500/90" };

        // Basic avatar placeholder map based on index to give it the mockup feel
        const placeholders = [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAO8GEaq_Vag4jtDnbHAvZbXpUsvJD0qcB47SmV6hYWdxQDCTQVZl3-WJDfSj-ucb20bbl0_MMWjKK1_i81GTQ-aGP5wr57x5-pnB1De0uq0kyCHkewYNYdjv3D_0vSW4n6f0eI9PE4zbeLr2htMi4sd2niN8i11RZYDuBBimgmEGKydB9gCTRVfx7xXIAUPSS1A0kdXELcNmrWVKWg_ioiZcRjrs0jwLd3fbptMBQGgIqzc5s1skqRRgc2wDsED_bKlalBhi5R-Yip",
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBNPmD8Jaq-s0QtD26NPe4qp7WX8EEG0-pGj0I4k7eP1rQFgKdGL_f1b480tdtlskzZ56qXxJMTgK6H9a7_ygquqFJfAV3IfB4A3MSJe5UkMq8HmSuDtVnEAKeCETcBe7r7lNYg9Nom7gUV-YiFZsyh7HlMPSYqewi808wvJt9VoGSmmzA1_J5hcpwCR3tn6GBfj9_mx-uQlIGxmIRBwSnyyhY-dKVBecJ-wEPKvktqTyY-NvC81b-EZZoe4ehAkCjCAFx6V7oP16Es",
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDwuiDTEat7Oay3nLmz1WytSng9grFFxilTb_SCdpQ2cA9eFgJICq91TcJGaRhWEIhgi8VF6q8kF5ntLCNYj0hYWbK0IBc-2ciTcHeq2PLNRLAowqCIDEVy2hBKSQwAG3qSnKCNK8P-b8g6rQrKGmjen5lD15iGJXe8AmDN5rl6Qo8EGCvl6tBv8ETMekqGDvOQ69bbGQHkH9PjpHYvexDFcN3mxOUWh6qTtZabqEPi1cK2WyijNb0QlsOY6kyZdjioU-_GQk4oSlZ9",
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDgPKLlrVT45MltACdHNQceh3-11WKaTEZaAed3NfJmDEa9U8azpo15gIkeiJphulnTNkbkul-uLb2bdyGChU725DxQcRz7nmLxxyfVFQJTfeye_OfmCvbYLcH08OUZn51VKE7Zgs2YMNh-bDJ0v4h8QbP6fNRebCawn7jqgSUcUGIOlmxNrN5zzh6ihJHdI_1L8OX77eP9mOy0JuD3nGBfASBveQra-UmVRWfBvpM-kE5IpozN7QM95FyUkfQnMliTgiHLqYIDwAfl",
        ];
        const imgUrl =
          (item as any).image_url || placeholders[idx % placeholders.length];

        return (
          <div
            key={item.id}
            className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-[#1e1429]"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
              {imgUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imgUrl}
                  alt={item.judul}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-slate-400">
                    image
                  </span>
                </div>
              )}
              <div
                className={`absolute right-3 top-3 rounded-full ${statusConfig.colorClass} px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm`}
              >
                {statusConfig.label}
              </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <div className="mb-4 flex-1">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="material-symbols-outlined text-[16px]">
                    calendar_today
                  </span>
                  <span>
                    {format(new Date(item.tanggal), "dd MMM yyyy", {
                      locale: idLocale,
                    })}
                  </span>
                  <span className="mx-1">•</span>
                  <span className="material-symbols-outlined text-[16px]">
                    location_on
                  </span>
                  <span className="truncate max-w-[120px]">{item.lokasi}</span>
                </div>
                <h3 className="line-clamp-2 text-lg font-bold text-slate-900 dark:text-white">
                  {item.judul}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                  {item.deskripsi}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => onEdit(item)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    edit
                  </span>
                  Edit
                </button>
                <button
                  onClick={() => onViewDetail(item)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary/10 py-2 text-sm font-medium text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary-light dark:hover:bg-primary/30 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    visibility
                  </span>
                  Details
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
