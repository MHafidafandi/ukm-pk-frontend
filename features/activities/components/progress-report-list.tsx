"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useActivityContext } from "../contexts/ActivityContext";
import { ProgressReport } from "../services/activityService";
import { ProgressReportFormDialog } from "./progress-report-form-dialog";
import {
  CreateProgressReportInput,
  CreateProgressReportSchema,
} from "@/lib/validations/activity-schema";

type Props = {
  activityId: string;
};

const emptyForm = (activityId: string): CreateProgressReportInput => ({
  activity_id: activityId,
  judul: "",
  deskripsi: "",
  tanggal: new Date(),
});

export const ProgressReportList = ({ activityId }: Props) => {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<ProgressReport | null>(null);
  const [deleting, setDeleting] = useState<ProgressReport | null>(null);
  const [form, setForm] = useState<CreateProgressReportInput>(
    emptyForm(activityId),
  );

  const {
    progressReports: reports,
    createProgressReport: createReport,
    updateProgressReport: updateReport,
    deleteProgressReport: deleteReport,
  } = useActivityContext();

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm(activityId));
    setFormOpen(true);
  };

  const openEdit = (item: ProgressReport) => {
    setEditing(item);
    setForm({
      activity_id: item.activity_id,
      judul: item.judul,
      deskripsi: item.deskripsi,
      tanggal: new Date(item.tanggal),
    });
    setFormOpen(true);
  };

  const openDelete = (item: ProgressReport) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const handleSave = async () => {
    try {
      const parsed = CreateProgressReportSchema.parse(form);

      if (editing) {
        await updateReport({
          id: editing.id,
          data: parsed,
        });
        toast.success("Laporan progres diperbarui");
      } else {
        await createReport(parsed);
        toast.success("Laporan progres dibuat");
      }
      setFormOpen(false);
    } catch (err: any) {
      if (err.name === "ZodError") {
        toast.error(err.errors[0].message);
        return;
      }
      toast.error("Gagal menyimpan laporan");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteReport(deleting.id);
      toast.success("Laporan dihapus");
      setDeleteOpen(false);
    } catch {
      toast.error("Gagal menghapus laporan");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            timeline
          </span>
          Progress Reports
        </h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          Add Progress
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
        <div className="relative timeline-line space-y-8 pl-2">
          {reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada laporan progres.
            </div>
          ) : (
            reports.map((item) => (
              <div key={item.id} className="relative pl-8 group">
                <div className="absolute left-[11px] top-1.5 size-4 rounded-full border-[3px] border-white dark:border-slate-800 bg-primary ring-2 ring-primary/20"></div>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white flex-1 min-w-[200px] text-wrap">
                      {item.judul}
                    </h4>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded">
                      {format(new Date(item.tanggal), "MMM dd, yyyy", {
                        locale: idLocale,
                      })}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {item.deskripsi}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors text-xs font-medium text-slate-600 dark:text-slate-300"
                    >
                      <span className="material-symbols-outlined text-base">
                        edit
                      </span>
                      Edit
                    </button>
                    <button
                      onClick={() => openDelete(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 dark:border-red-900/50 rounded-lg bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-xs font-medium text-red-600 dark:text-red-400"
                    >
                      <span className="material-symbols-outlined text-base">
                        delete
                      </span>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ProgressReportFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        isEdit={!!editing}
        form={form}
        setForm={setForm}
        onSubmit={handleSave}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Laporan?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
