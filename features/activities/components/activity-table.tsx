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
      {activities.map((item) => {
        const status = statusConfig[item.status] || {
          label: item.status,
          colorClass: "bg-gray-500/90",
        };

        return (
          <div
            key={item.id}
            className="group relative flex flex-col overflow-hidden rounded-xl bg-card shadow-sm border border-border transition-shadow hover:shadow-md"
          >
            {/* Image Section */}
            <div className="relative aspect-video w-full overflow-hidden bg-muted flex items-center justify-center">
              {/* Fallback image if activity doesn't have cover image prop */}
              {/* @ts-ignore */}
              {item.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  // @ts-ignore
                  src={item.image_url}
                  alt={item.judul}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/80 flex items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-muted-foreground/50 transition-transform duration-300 group-hover:scale-110" />
                </div>
              )}

              <div
                className={`absolute right-3 top-3 rounded-full ${status.colorClass} px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm z-10 shadow-sm border border-white/10`}
              >
                {status.label}
              </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-1 flex-col p-5">
              <div className="mb-4 flex-1">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {format(new Date(item.tanggal), "dd MMM yyyy", {
                      locale: idLocale,
                    })}
                  </span>
                  <span className="mx-1">•</span>
                  <MapPin className="h-3.5 w-3.5 min-w-[14px]" />
                  <span className="truncate">{item.lokasi}</span>
                </div>
                <h3 className="line-clamp-2 text-lg font-bold text-foreground">
                  {item.judul}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {item.deskripsi}
                </p>
              </div>

              {/* Actions Section */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  className="flex-1 rounded-lg hover:bg-muted font-medium"
                  onClick={() => onEdit(item)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="default"
                  className="flex-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-medium transition-colors border-0"
                  onClick={() => onViewDetail(item)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Details
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                  onClick={() => onDelete(item)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
