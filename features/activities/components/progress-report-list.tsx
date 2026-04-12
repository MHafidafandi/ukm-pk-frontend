"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  CalendarClock,
  Edit,
  Trash2,
  FileText,
  Upload,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
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
import { ProgressDocument } from "../services/activityService";
import { env } from "@/configs/env";

const MEDIA_BASE_URL = env.MEDIA_URL;

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
  const [documentsByReport, setDocumentsByReport] = useState<
    Record<string, ProgressDocument[]>
  >({});
  const [uploadingReportId, setUploadingReportId] = useState<string | null>(
    null,
  );
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(
    null,
  );
  const [form, setForm] = useState<CreateProgressReportInput>(
    emptyForm(activityId),
  );

  const {
    progressReports: reports,
    isFetchingProgressReports: isLoading,
    createProgressReport: createReport,
    updateProgressReport: updateReport,
    deleteProgressReport: deleteReport,
    getDocumentsByReport,
    createDocument,
    deleteDocument,
  } = useActivityContext();

  const reportIdsKey = useMemo(
    () =>
      reports
        .map((r) => r.id)
        .sort()
        .join("|"),
    [reports],
  );

  useEffect(() => {
    let mounted = true;

    const loadDocuments = async () => {
      if (!reports.length) {
        if (mounted) setDocumentsByReport({});
        return;
      }

      try {
        const entries = await Promise.all(
          reports.map(async (report) => {
            const res = await getDocumentsByReport(report.id);
            return [report.id, res.data.documents || []] as const;
          }),
        );

        if (!mounted) return;
        setDocumentsByReport(Object.fromEntries(entries));
      } catch {
        if (!mounted) return;
        toast.error("Gagal memuat dokumen progress report");
      }
    };

    void loadDocuments();
    return () => {
      mounted = false;
    };
  }, [reportIdsKey, getDocumentsByReport, reports]);

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

      // ✅ Format tanggal ke YYYY-MM-DD sesuai yang diminta API
      const payload = {
        ...parsed,
        tanggal: format(new Date(parsed.tanggal), "yyyy-MM-dd"),
      };

      if (editing) {
        await updateReport({ id: editing.id, data: payload });
        toast.success("Laporan progres diperbarui");
      } else {
        await createReport(payload);
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
      setDeleting(null);
    } catch {
      toast.error("Gagal menghapus laporan");
    }
  };

  const buildDocumentUrl = (fileUrl: string) =>
    fileUrl.startsWith("http") ? fileUrl : `${MEDIA_BASE_URL}${fileUrl}`;

  const handleUploadDocument = async (reportId: string, file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Dokumen progress hanya menerima PDF");
      return;
    }

    try {
      setUploadingReportId(reportId);

      const formData = new FormData();
      formData.append("report_id", reportId);
      formData.append("file", file);
      formData.append("tanggal", format(new Date(), "yyyy-MM-dd"));

      await createDocument(formData);

      const refreshed = await getDocumentsByReport(reportId);
      setDocumentsByReport((prev) => ({
        ...prev,
        [reportId]: refreshed.data.documents || [],
      }));

      toast.success("Dokumen progress berhasil diupload");
    } catch {
      toast.error("Gagal upload dokumen progress");
    } finally {
      setUploadingReportId(null);
    }
  };

  const handleDeleteDocument = async (reportId: string, documentId: string) => {
    try {
      setDeletingDocumentId(documentId);
      await deleteDocument(documentId);

      setDocumentsByReport((prev) => ({
        ...prev,
        [reportId]: (prev[reportId] || []).filter(
          (doc) => doc.id !== documentId,
        ),
      }));

      toast.success("Dokumen progress dihapus");
    } catch {
      toast.error("Gagal menghapus dokumen progress");
    } finally {
      setDeletingDocumentId(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CalendarClock className="text-primary" />
          Progress Reports
        </h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="size-4" />
          Add Progress
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
        {isLoading ? (
          <div className="text-center py-8 text-sm text-slate-400">
            Memuat laporan...
          </div>
        ) : (
          <div className="relative timeline-line space-y-8 pl-2">
            {reports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada laporan progres.
              </div>
            ) : (
              reports.map((item) => (
                <div key={item.id} className="relative pl-8 group">
                  <div className="absolute left-2.75 top-1.5 size-4 rounded-full border-[3px] border-white dark:border-slate-800 bg-primary ring-2 ring-primary/20" />
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white flex-1 min-w-50 text-wrap">
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
                    <div className="flex flex-wrap gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors text-xs font-medium text-slate-600 dark:text-slate-300"
                      >
                        <Edit className="size-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => openDelete(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 dark:border-red-900/50 rounded-lg bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-xs font-medium text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="size-4" />
                        Remove
                      </button>
                    </div>

                    <div className="mt-3 rounded-lg border border-slate-200/80 dark:border-slate-700/70 bg-slate-50/70 dark:bg-slate-900/40 p-3 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Document
                        </h5>
                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                          <Upload className="size-3.5" />
                          {uploadingReportId === item.id
                            ? "Uploading..."
                            : "Upload PDF"}
                          <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            disabled={uploadingReportId === item.id}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              e.target.value = "";
                              if (!file) return;
                              void handleUploadDocument(item.id, file);
                            }}
                          />
                        </label>
                      </div>

                      {(documentsByReport[item.id] || []).length === 0 ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Belum ada dokumen untuk progress ini.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {(documentsByReport[item.id] || []).map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between gap-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2"
                            >
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                                  Document{" "}
                                  {format(
                                    new Date(doc.tanggal),
                                    "dd MMM yyyy",
                                    { locale: idLocale },
                                  )}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                  {doc.file_url}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <a
                                  href={buildDocumentUrl(doc.file_url)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center rounded-md p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                                  title="Lihat dokumen"
                                >
                                  <ExternalLink className="size-3.5" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteDocument(item.id, doc.id)
                                  }
                                  disabled={deletingDocumentId === doc.id}
                                  className="inline-flex items-center justify-center rounded-md p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 disabled:opacity-50"
                                  title="Hapus dokumen"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
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
