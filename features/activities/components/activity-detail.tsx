"use client";

import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, Calendar, MapPin, Pencil, ImageOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useActivityContext } from "../contexts/ActivityContext";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

import { ProgressReportList } from "./progress-report-list";
import { LpjViewer } from "./lpj-viewer";
import { ActivityFormDialog } from "./activity-form-dialog";
import { CreateActivityInput } from "@/lib/validations/activity-schema";
import { env } from "@/configs/env";

const MEDIA_BASE_URL = env.MEDIA_URL;

type Props = { id: string };

// ── Status config ─────────────────────────────────────────────────────────────
const getStatusCfg = (status: string) => {
  const s = status.toLowerCase();
  if (s === "berjalan" || s === "ongoing")
    return {
      label: "Berjalan",
      bg: "bg-primary-fixed",
      text: "text-on-primary-fixed-variant",
      pulse: true,
    };
  if (s === "selesai" || s === "completed")
    return {
      label: "Selesai",
      bg: "bg-secondary-fixed",
      text: "text-on-secondary-fixed-variant",
      pulse: false,
    };
  if (s === "perencanaan" || s === "pending")
    return {
      label: "Perencanaan",
      bg: "bg-tertiary-fixed",
      text: "text-on-tertiary-fixed-variant",
      pulse: false,
    };
  return {
    label: "Dibatalkan",
    bg: "bg-error-container",
    text: "text-on-error-container",
    pulse: false,
  };
};

// ── Component ─────────────────────────────────────────────────────────────────
export const ActivityDetail = ({ id }: Props) => {
  const router = useRouter();
  const {
    activeActivityDetails: activity,
    isFetchingActivityDetails: isLoading,
    setActiveActivityId,
    updateActivity,
  } = useActivityContext();

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<CreateActivityInput>({
    judul: "",
    deskripsi: "",
    tanggal: new Date(),
    lokasi: "",
  });

  useEffect(() => {
    setActiveActivityId(id);
    return () => setActiveActivityId(null);
  }, [id, setActiveActivityId]);

  const openEditDialog = () => {
    if (!activity) return;
    setEditForm({
      judul: activity.judul,
      deskripsi: activity.deskripsi,
      tanggal: new Date(activity.tanggal),
      lokasi: activity.lokasi,
      thumbnail: undefined,
    });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    try {
      const formData = new FormData();
      formData.append("judul", editForm.judul);
      formData.append("deskripsi", editForm.deskripsi);
      formData.append(
        "tanggal",
        editForm.tanggal instanceof Date
          ? editForm.tanggal.toISOString().split("T")[0]
          : String(editForm.tanggal),
      );
      formData.append("lokasi", editForm.lokasi);

      const existingThumbnailUrl = activity?.thumbnail || "";
      if (editForm.thumbnail instanceof File) {
        formData.append("thumbnail", editForm.thumbnail);
        formData.append("thumbnail_url", "");
      } else if (editForm.thumbnail === null) {
        formData.append("thumbnail", "");
        formData.append("thumbnail_url", "");
      } else if (existingThumbnailUrl) {
        formData.append("thumbnail_url", existingThumbnailUrl);
      } else {
        formData.append("thumbnail_url", "");
      }

      setEditOpen(false);
      await updateActivity({ id, data: formData });
      toast.success("Kegiatan berhasil diperbarui");

    } catch (err: unknown) {
      console.error(err);
      toast.error("Gagal memperbarui kegiatan");
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  // ── Not Found ─────────────────────────────────────────────────────────────
  if (!activity) {
    return (
      <div className="flex h-48 w-full flex-col items-center justify-center gap-4 text-on-surface-variant">
        <p className="text-sm font-medium">Kegiatan tidak ditemukan.</p>
        <button
          onClick={() => router.push("/dashboard/activities")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Kegiatan
        </button>
      </div>
    );
  }

  const statusCfg = getStatusCfg(activity.status);

  return (
    <div className="space-y-8">
      {/* ── Breadcrumb ── */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
        <button
          onClick={() => router.push("/dashboard")}
          className="hover:text-primary transition-colors"
        >
          Dashboard
        </button>
        <span>/</span>
        <button
          onClick={() => router.push("/dashboard/activities")}
          className="hover:text-primary transition-colors"
        >
          Kegiatan
        </button>
        <span>/</span>
        <span className="text-primary font-medium truncate max-w-[200px]">
          {activity.judul}
        </span>
      </div>

      {/* ── Page Header ── */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div className="flex flex-col gap-3">
          {/* Status + Meta */}
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusCfg.bg} ${statusCfg.text}`}
            >
              {statusCfg.pulse && (
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              )}
              {statusCfg.label}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-on-surface-variant">
              <Calendar className="w-4 h-4" />
              {format(new Date(activity.tanggal), "dd MMMM yyyy", {
                locale: idLocale,
              })}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-on-surface-variant">
              <MapPin className="w-4 h-4" />
              {activity.lokasi}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-['Manrope'] font-bold text-3xl text-on-surface tracking-tight leading-tight">
            {activity.judul}
          </h1>
        </div>

        {/* Edit Button */}
        <button
          onClick={openEditDialog}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface text-sm font-bold hover:bg-surface-container-high transition-colors shadow-sm shrink-0"
        >
          <Pencil className="w-4 h-4" />
          Edit Kegiatan
        </button>
      </div>

      {/* ── Overview Card ── */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row gap-0">
        {/* Thumbnail */}
        <div className="w-full md:w-80 h-56 md:h-auto shrink-0 bg-surface-container relative overflow-hidden">
          {activity.thumbnail ? (
            <img
              src={
                activity.thumbnail.startsWith("http")
                  ? activity.thumbnail
                  : `${MEDIA_BASE_URL}${activity.thumbnail}`
              }
              alt={activity.judul}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-outline">
              <ImageOff className="w-10 h-10 opacity-40" />
              <span className="text-xs font-medium text-on-surface-variant">
                Belum ada thumbnail
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between p-6 lg:p-8 flex-1">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">
              Deskripsi Kegiatan
            </p>
            <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
              {activity.deskripsi}
            </p>
          </div>
        </div>
      </div>

      {/* ── Two Column: Progress + LPJ ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ProgressReportList activityId={id} />
        </div>
        <div className="lg:col-span-1">
          <LpjViewer activityId={id} />
        </div>
      </div>

      {/* ── Edit Dialog ── */}
      <ActivityFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        isEdit
        form={editForm}
        setForm={setEditForm}
        onSubmit={handleEditSave}
        existingThumbnailUrl={activity.thumbnail}
      />
    </div>
  );
};
