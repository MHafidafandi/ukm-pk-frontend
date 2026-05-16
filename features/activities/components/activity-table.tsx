"use client";

import { useState } from "react";
import { Eye, Calendar, MapPin, Pencil, Star, Trash2 } from "lucide-react";
import { Activity } from "../services/activityService";
import { ActivityStatus } from "@/lib/validations/activity-schema";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { env } from "@/configs/env";

type Props = {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
  onViewDetail: (activity: Activity) => void;
  onStatusChange: (activity: Activity, status: ActivityStatus) => void;
  onFeaturedChange: (activity: Activity, isFeatured: boolean) => void;
};

// ── Status config ─────────────────────────────────────────────────────────────
const getStatusCfg = (status: string) => {
  const s = status.toLowerCase();
  if (s === "berjalan" || s === "ongoing")
    return {
      label: "Berjalan",
      bg: "bg-primary-fixed",
      text: "text-on-primary-fixed-variant",
    };
  if (s === "selesai" || s === "completed")
    return {
      label: "Selesai",
      bg: "bg-secondary-fixed",
      text: "text-on-secondary-fixed-variant",
    };
  if (s === "perencanaan" || s === "pending")
    return {
      label: "Perencanaan",
      bg: "bg-tertiary-fixed",
      text: "text-on-tertiary-fixed-variant",
    };
  return {
    label: "Dibatalkan",
    bg: "bg-error-container",
    text: "text-on-error-container",
  };
};

const normalizeStatus = (status: string): ActivityStatus => {
  const s = status.toLowerCase();
  if (s === "perencanaan") return "pending";
  if (s === "berjalan") return "ongoing";
  if (s === "selesai") return "completed";
  if (s === "dibatalkan") return "cancelled";
  return s as ActivityStatus;
};

// ── Component ─────────────────────────────────────────────────────────────────
export const ActivityGrid = ({
  activities,
  onEdit,
  onDelete,
  onViewDetail,
  onStatusChange,
  onFeaturedChange,
}: Props) => {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  if (activities.length === 0) {
    return (
      <div className="flex h-48 w-full flex-col items-center justify-center gap-3 rounded-2xl bg-surface-container-low text-on-surface-variant">
        <Calendar className="w-8 h-8 opacity-40" />
        <p className="text-sm font-medium">Belum ada data kegiatan.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {activities.map((item) => {
        const statusCfg = getStatusCfg(item.status);
        const featuredValue = item.is_featured as unknown;
        const isFeatured =
          featuredValue === true ||
          featuredValue === 1 ||
          featuredValue === "true";

        const imgUrl = item.thumbnail
          ? item.thumbnail.startsWith("https")
            ? item.thumbnail
            : `${env.MEDIA_URL}${item.thumbnail}`
          : null;

        const showFallback = !imgUrl || imgErrors[item.id];

        return (
          <div
            key={item.id}
            className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-shadow"
          >
            {/* ── Thumbnail ── */}
            <div className="relative h-44 w-full overflow-hidden bg-surface-container shrink-0">
              {!showFallback ? (
                <img
                  src={imgUrl as string}
                  alt={item.judul}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={() =>
                    setImgErrors((prev) => ({ ...prev, [item.id]: true }))
                  }
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-container">
                  <Calendar className="w-10 h-10 text-outline opacity-40" />
                  <span className="text-xs text-on-surface-variant font-medium">
                    Belum ada thumbnail
                  </span>
                </div>
              )}

              {/* Status Badge */}
              <span
                className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusCfg.bg} ${statusCfg.text}`}
              >
                {statusCfg.label}
              </span>

              {/* Featured Badge */}
              {isFeatured && (
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-tertiary-fixed text-on-tertiary-fixed-variant flex items-center gap-1">
                  <Star className="w-2.5 h-2.5" />
                  Unggulan
                </span>
              )}
            </div>

            {/* ── Content ── */}
            <div className="flex flex-col flex-1 p-5">
              {/* Meta */}
              <div className="flex items-center gap-3 text-xs text-on-surface-variant mb-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(new Date(item.tanggal), "dd MMM yyyy", {
                    locale: idLocale,
                  })}
                </span>
                <span className="w-1 h-1 rounded-full bg-outline-variant" />
                <span className="flex items-center gap-1 truncate max-w-[120px]">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{item.lokasi}</span>
                </span>
              </div>

              {/* Title & Desc */}
              <h3 className="font-['Manrope'] font-bold text-on-surface text-base line-clamp-2 mb-1">
                {item.judul}
              </h3>
              <p className="text-sm text-on-surface-variant line-clamp-2 flex-1">
                {item.deskripsi}
              </p>

              {/* Status Select */}
              <div className="mt-4">
                <select
                  value={normalizeStatus(item.status)}
                  onChange={(e) =>
                    onStatusChange(item, e.target.value as ActivityStatus)
                  }
                  className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant rounded-t-lg px-3 py-2 text-xs font-medium text-on-surface outline-none focus:border-primary transition-colors"
                >
                  <option value="pending">Perencanaan</option>
                  <option value="ongoing">Berjalan</option>
                  <option value="completed">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>

              {/* Featured Toggle */}
              <label className="mt-3 flex items-center gap-2 cursor-pointer text-xs text-on-surface-variant font-medium">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => onFeaturedChange(item, e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant accent-primary"
                />
                Tampilkan sebagai unggulan
              </label>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-outline-variant/10 flex items-center gap-2">
                <button
                  onClick={() => onEdit(item)}
                  className="flex flex-1 items-center justify-center gap-1.5 py-2 rounded-xl bg-surface-container text-on-surface-variant text-xs font-bold hover:bg-surface-container-high transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => onViewDetail(item)}
                  className="flex flex-1 items-center justify-center gap-1.5 py-2 rounded-xl bg-primary-fixed text-on-primary-fixed-variant text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Detail
                </button>
                <button
                  onClick={() => onDelete(item)}
                  className="flex items-center justify-center p-2 rounded-xl bg-error-container text-on-error-container text-xs font-bold hover:opacity-90 transition-opacity"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
