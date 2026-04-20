"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  CalendarClock,
  Edit,
  Trash2,
  Upload,
  ExternalLink,
  Loader2,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
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
import { ProgressReport, ProgressDocument } from "../services/activityService";
import { ProgressReportFormDialog } from "./progress-report-form-dialog";
import {
  CreateProgressReportInput,
  CreateProgressReportSchema,
} from "@/lib/validations/activity-schema";
import { env } from "@/configs/env";

const MEDIA_BASE_URL = env.MEDIA_URL;

type Props = { activityId: string };

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
    progressReportsPagination,
    progressReportPage,
    setProgressReportPage,
    progressReportSearch,
    setProgressReportSearch,
    progressReportSort,
    setProgressReportSort,
    progressReportOrder,
    setProgressReportOrder,
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

  const totalPages = progressReportsPagination?.total_pages ?? 1;
  const hasPrev = progressReportPage > 1;
  const hasNext = progressReportPage < totalPages;

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

  const handleSave = async () => {
    try {
      const parsed = CreateProgressReportSchema.parse(form);
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
      toast.error("Hanya file PDF yang diperbolehkan");
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
      toast.success("Dokumen berhasil diupload");
    } catch {
      toast.error("Gagal upload dokumen");
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
        [reportId]: (prev[reportId] || []).filter((d) => d.id !== documentId),
      }));
      toast.success("Dokumen dihapus");
    } catch {
      toast.error("Gagal menghapus dokumen");
    } finally {
      setDeletingDocumentId(null);
    }
  };

  return (
    <>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-['Manrope'] font-bold text-xl text-on-surface flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-primary" />
          Laporan Progres
        </h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/20 text-on-surface text-xs font-bold hover:bg-surface-container-high transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Laporan
        </button>
      </div>

      <div className="bg-surface-container-low rounded-2xl px-4 py-3 mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
          <input
            type="text"
            placeholder="Cari judul/deskripsi laporan..."
            value={progressReportSearch}
            onChange={(e) => setProgressReportSearch(e.target.value)}
            className="w-full bg-surface-container-lowest rounded-full py-2 pl-10 pr-4 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={progressReportSort}
            onChange={(e) => setProgressReportSort(e.target.value)}
            className="bg-surface-container-lowest border-0 border-b-2 border-outline-variant rounded-t-lg px-3 py-2 text-xs font-medium text-on-surface-variant outline-none focus:border-primary transition-colors"
          >
            <option value="created_at">Urut: Dibuat</option>
            <option value="tanggal">Urut: Tanggal</option>
            <option value="judul">Urut: Judul</option>
            <option value="updated_at">Urut: Diperbarui</option>
          </select>
          <button
            onClick={() =>
              setProgressReportOrder(
                progressReportOrder === "ASC" ? "DESC" : "ASC",
              )
            }
            className="px-3 py-2 rounded-xl bg-surface-container-lowest text-on-surface-variant text-xs font-bold hover:bg-surface-container-high transition-colors"
          >
            {progressReportOrder === "ASC" ? "Asc" : "Desc"}
          </button>
        </div>
      </div>

      {/* ── List ── */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-on-surface-variant text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Memuat laporan...
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-3 text-on-surface-variant">
            <CalendarClock className="w-7 h-7 opacity-40" />
            <p className="text-sm font-medium">Belum ada laporan progres.</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/10">
            {reports.map((item, idx) => (
              <div key={item.id} className="p-6 group">
                {/* Timeline dot + connector */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className={`w-3 h-3 rounded-full mt-1 shrink-0 ${
                        idx === 0 ? "bg-primary" : "bg-outline-variant"
                      }`}
                    />
                    {idx < reports.length - 1 && (
                      <div className="w-px flex-1 bg-outline-variant/30 mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-2">
                    {/* Title row */}
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-on-surface text-sm flex-1 min-w-0">
                        {item.judul}
                      </h4>
                      <span className="shrink-0 text-[10px] font-bold text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full">
                        {format(new Date(item.tanggal), "dd MMM yyyy", {
                          locale: idLocale,
                        })}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap mb-3">
                      {item.deskripsi}
                    </p>

                    {/* Edit / Delete — fade in on hover */}
                    <div className="flex flex-wrap gap-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container text-on-surface-variant text-xs font-bold hover:bg-surface-container-high transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setDeleting(item);
                          setDeleteOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-error-container text-on-error-container text-xs font-bold hover:opacity-90 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus
                      </button>
                    </div>

                    {/* Documents sub-section */}
                    <div className="rounded-xl bg-surface-container p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                          Dokumen
                        </span>
                        <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 text-on-surface text-xs font-bold cursor-pointer hover:bg-surface-container-high transition-colors">
                          {uploadingReportId === item.id ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Mengupload...
                            </>
                          ) : (
                            <>
                              <Upload className="w-3 h-3" />
                              Upload PDF
                            </>
                          )}
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
                        <p className="text-xs text-on-surface-variant">
                          Belum ada dokumen untuk laporan ini.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {(documentsByReport[item.id] || []).map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between gap-3 bg-surface-container-lowest rounded-xl px-4 py-3"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-4 h-4 text-primary shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-on-surface truncate">
                                    Dokumen{" "}
                                    {format(
                                      new Date(doc.tanggal),
                                      "dd MMM yyyy",
                                      { locale: idLocale },
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <a
                                  href={buildDocumentUrl(doc.file_url)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-7 h-7 flex items-center justify-center rounded-lg text-primary hover:bg-primary-fixed/30 transition-colors"
                                  title="Lihat dokumen"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteDocument(item.id, doc.id)
                                  }
                                  disabled={deletingDocumentId === doc.id}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg text-on-error-container hover:bg-error-container/30 transition-colors disabled:opacity-50"
                                  title="Hapus dokumen"
                                >
                                  {deletingDocumentId === doc.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-xs text-on-surface-variant">
            Halaman {progressReportPage} dari {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setProgressReportPage(progressReportPage - 1)}
              disabled={!hasPrev}
              className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-highest transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setProgressReportPage(progressReportPage + 1)}
              disabled={!hasNext}
              className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-highest transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Dialogs ── */}
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
