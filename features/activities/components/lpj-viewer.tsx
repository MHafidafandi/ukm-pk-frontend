"use client";
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
import { useRef, useState } from "react";
import { FileCheck, ExternalLink, Trash2, Upload, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type Props = {
  activityId: string;
};

function safeFormatDate(
  value: string | null | undefined,
  fmt: string,
  options?: { locale?: Locale }
): string {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  return format(d, fmt, options);
}

export const LpjViewer = ({ activityId }: Props) => {
  const {
    lpj,
    createLpj,
    deleteLpj,
    isFetchingLpj: isLoading,
  } = useActivityContext();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Klik area "Buat LPJ" → buka file picker
  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  // User sudah pilih file → langsung upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input supaya bisa pilih file yang sama lagi kalau perlu
    e.target.value = "";

    // Validasi: hanya PDF
    if (file.type !== "application/pdf") {
      toast.error("Hanya file PDF yang diperbolehkan");
      return;
    }

    // Validasi: max 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 10MB");
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("activity_id", activityId);
      formData.append("tanggal", format(new Date(), "yyyy-MM-dd"));

      await createLpj(formData);
      toast.success("LPJ berhasil diupload");
    } catch {
      toast.error("Gagal mengupload LPJ");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!lpj) return;
    try {
      await deleteLpj(lpj.id);
      toast.success("LPJ dihapus");
      setDeleteOpen(false);
    } catch {
      toast.error("Gagal menghapus LPJ");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        Loading LPJ...
      </div>
    );
  }

  return (
    <>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
        <FileCheck className="size-5 text-primary" />
        Final Report (LPJ)
      </h2>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 h-full flex flex-col">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Laporan Pertanggungjawaban (LPJ) kegiatan. Upload setelah kegiatan
          selesai dilaksanakan.
        </p>

        {!lpj?.created_at ? (
          /* ── Belum ada LPJ ── */
          <>
            <div
              onClick={!isUploading ? handleClickUpload : undefined}
              className={`flex-1 min-h-[200px] border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center p-6 text-center group
                ${isUploading
                  ? "border-primary/50 bg-primary/5 dark:bg-primary/10 cursor-wait"
                  : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/50 cursor-pointer"
                }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="size-8 text-primary animate-spin mb-3" />
                  <h4 className="text-sm font-bold text-primary mb-1">
                    Mengupload LPJ...
                  </h4>
                  <p className="text-xs text-slate-400">
                    Mohon tunggu sebentar
                  </p>
                </>
              ) : (
                <>
                  <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all flex items-center justify-center mb-3">
                    <Upload className="size-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary mb-1">
                    Upload LPJ
                  </h4>
                  <p className="text-xs text-slate-400">
                    Klik untuk memilih file PDF (maks. 10MB)
                  </p>
                </>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Status</span>
                <span className="text-amber-500 font-medium">
                  Belum ada LPJ
                </span>
              </div>
            </div>
          </>
        ) : (
          /* ── Sudah ada LPJ ── */
          <div className="flex-1 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-xl p-6 flex flex-col items-center text-center">
            <div className="size-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 flex items-center justify-center mb-4">
              <FileCheck className="size-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              LPJ Telah Dibuat
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              Tanggal:{" "}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {safeFormatDate(lpj.tanggal, "dd MMMM yyyy", {
                  locale: idLocale,
                })}
              </span>
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
              Dibuat pada{" "}
              {safeFormatDate(lpj.created_at, "dd MMM yyyy, HH:mm", {
                locale: idLocale,
              })}
            </p>

            {lpj.file_url && (
              <a
                href={lpj.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 transition-colors text-sm font-medium rounded-lg"
              >
                <ExternalLink className="size-4" />
                Lihat File LPJ
              </a>
            )}

            <button
              onClick={() => setDeleteOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 transition-colors text-sm font-medium rounded-lg"
            >
              <Trash2 className="size-4" />
              Hapus LPJ
            </button>
          </div>
        )}
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus LPJ?</AlertDialogTitle>
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