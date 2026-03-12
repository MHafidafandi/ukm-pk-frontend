import { useState } from "react";
import { Eye, Calendar, LocateIcon, Pencil } from "lucide-react";
import { Activity } from "../services/activityService";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type Props = {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
  onViewDetail: (activity: Activity) => void;
};

export const ActivityGrid = ({
  activities,
  onEdit,
  onDelete,
  onViewDetail,
}: Props) => {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  if (activities.length === 0) {
    return (
      <div className="flex h-48 w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 text-muted-foreground">
        <p>Tidak ada data kegiatan.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {activities.map((item) => {
        const statusLower = item.status.toLowerCase();
        const isOngoing = statusLower === "ongoing" || statusLower === "berjalan";
        const isCompleted = statusLower === "selesai" || statusLower === "completed";
        const isPending = statusLower === "perencanaan" || statusLower === "pending";

        let statusConfig: { label: string; colorClass: string } = {
          label: item.status,
          colorClass: "bg-gray-500/90",
        };
        if (isOngoing)
          statusConfig = { label: "Berjalan", colorClass: "bg-blue-500/90" };
        else if (isCompleted)
          statusConfig = { label: "Selesai", colorClass: "bg-emerald-500/90" };
        else if (isPending)
          statusConfig = { label: "Perencanaan", colorClass: "bg-amber-500/90" };
        else
          statusConfig = { label: "Dibatalkan", colorClass: "bg-rose-500/90" };

        const imgUrl = item.thumbnail
          ? `${process.env.NEXT_PUBLIC_MEDIA_URL ?? ""}${item.thumbnail}`
          : null;

        const showFallback = !imgUrl || imgErrors[item.id];

        return (
          <div
            key={item.id}
            className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-[#1e1429]"
          >
            {/* ── Gambar ── */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              {!showFallback ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imgUrl!}
                  alt={item.judul}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={() =>
                    setImgErrors((prev) => ({ ...prev, [item.id]: true }))
                  }
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
                  <Calendar className="size-10 text-slate-300 dark:text-slate-600" />
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    Tidak ada thumbnail
                  </span>
                </div>
              )}

              {/* Badge status */}
              <div
                className={`absolute right-3 top-3 rounded-full ${statusConfig.colorClass} px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm`}
              >
                {statusConfig.label}
              </div>
            </div>

            {/* ── Konten ── */}
            <div className="flex flex-1 flex-col p-5">
              <div className="mb-4 flex-1">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <Calendar className="size-4" />
                  <span>
                    {format(new Date(item.tanggal), "dd MMM yyyy", {
                      locale: idLocale,
                    })}
                  </span>
                  <span className="mx-1">•</span>
                  <LocateIcon className="size-4" />
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
                  <Pencil className="size-4" />
                  Edit
                </button>
                <button
                  onClick={() => onViewDetail(item)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary/10 py-2 text-sm font-medium text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary-light dark:hover:bg-primary/30 transition-colors"
                >
                  <Eye className="size-4" />
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