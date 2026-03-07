"use client";

import { Spinner } from "@/components/ui/spinner";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Pencil,
  FileText,
  Users,
  Info,
  Image as ImageIcon,
} from "lucide-react";
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

type Props = {
  id: string;
};

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

  // Sync edit form when activity data loads
  useEffect(() => {
    if (activity) {
      setEditForm({
        judul: activity.judul,
        deskripsi: activity.deskripsi,
        tanggal: new Date(activity.tanggal),
        lokasi: activity.lokasi,
      });
    }
  }, [activity]);

  const handleEditSave = async () => {
    try {
      const formData = new FormData();
      formData.append("judul", editForm.judul);
      formData.append("deskripsi", editForm.deskripsi);
      formData.append(
        "tanggal",
        editForm.tanggal instanceof Date
          ? editForm.tanggal.toISOString()
          : String(editForm.tanggal),
      );
      formData.append("lokasi", editForm.lokasi);

      if (editForm.thumbnail instanceof File) {
        formData.append("thumbnail", editForm.thumbnail);
      }

      await updateActivity({ id, data: formData });
      toast.success("Kegiatan berhasil diperbarui");
      setEditOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal memperbarui kegiatan");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="flex h-48 w-full flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>Activity not found</p>
        <button
          onClick={() => router.push("/dashboard/activities")}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          <ArrowLeft className="size-4" />
          Back to Activities
        </button>
      </div>
    );
  }

  // Status styling
  const statusLower = activity.status.toLowerCase();
  const isOngoing = statusLower === "ongoing" || statusLower === "berjalan";
  const isCompleted = statusLower === "selesai" || statusLower === "completed";
  const isPending = statusLower === "perencanaan" || statusLower === "pending";

  let statusConfig: { label: string; colorClass: string } = {
    label: activity.status,
    colorClass: "bg-gray-500/90 text-white",
  };
  if (isOngoing)
    statusConfig = {
      label: "Berjalan",
      colorClass:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    };
  else if (isCompleted)
    statusConfig = {
      label: "Selesai",
      colorClass:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    };
  else if (isPending)
    statusConfig = {
      label: "Perencanaan",
      colorClass:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    };
  else
    statusConfig = {
      label: "Dibatalkan",
      colorClass:
        "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    };

  return (
    <div className="flex flex-col w-full gap-8">
      {/* Breadcrumbs & Title */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2 items-center text-sm">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
          >
            Dashboard
          </button>
          <span className="text-slate-400 dark:text-slate-600">/</span>
          <button
            onClick={() => router.push("/dashboard/activities")}
            className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
          >
            Activities
          </button>
          <span className="text-slate-400 dark:text-slate-600">/</span>
          <span className="text-primary font-medium">Activity Details</span>
        </div>

        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">
              {activity.judul}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-4" />
                Started{" "}
                {format(new Date(activity.tanggal), "MMM dd, yyyy", {
                  locale: idLocale,
                })}
              </span>
              <span className="size-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-4" />
                {activity.lokasi}
              </span>
              <span className="size-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span
                className={`inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-full text-xs uppercase tracking-wide ${statusConfig.colorClass}`}
              >
                {isOngoing && (
                  <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
                )}
                {statusConfig.label}
              </span>
            </div>
          </div>

          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg transition-colors shadow-sm"
          >
            <Pencil className="size-4" />
            <span>Edit Activity</span>
          </button>
        </div>
      </div>

      {/* Activity Overview Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 aspect-video md:aspect-4/3 rounded-lg bg-slate-100 dark:bg-slate-900 bg-cover bg-center shrink-0 flex items-center justify-center relative overflow-hidden">
          {activity.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activity.thumbnail}
              alt={activity.judul}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="size-12 text-slate-300 dark:text-slate-700" />
          )}
        </div>

        <div className="flex flex-col justify-between py-1 grow">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Info className="size-5 text-primary" />
              Activity Overview
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 whitespace-pre-wrap">
              {activity.deskripsi}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mt-auto">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors shadow-md shadow-primary/20">
              <FileText className="size-4" />
              View Proposal
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors">
              <Users className="size-4" />
              View Participants
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Reports & LPJ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Timeline (Left Column) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <ProgressReportList activityId={id} />
        </div>

        {/* Right Column: LPJ Upload */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <LpjViewer activityId={id} />
        </div>
      </div>

      {/* Edit Dialog */}
      <ActivityFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        isEdit={true}
        form={editForm}
        setForm={setEditForm}
        onSubmit={handleEditSave}
      />
    </div>
  );
};
