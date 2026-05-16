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
import {
  FileCheck,
  ExternalLink,
  Trash2,
  Upload,
  Loader2,
  FileText,
} from "lucide-react";
import { format, Locale } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { env } from "@/configs/env";

const MEDIA_BASE_URL = env.MEDIA_URL;

type Props = { activityId: string };

function safeFormatDate(
  value: string | null | undefined,
  fmt: string,
  options?: { locale?: Locale },
): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
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

  const handleClickUpload = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (file.type !== "application/pdf") {
      toast.error("Hanya file PDF yang diperbolehkan");
      return;
    }
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

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 text-on-surface-variant text-sm gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Memuat LPJ...
      </div>
    );
  }

  return (
    <>
      {/* ── Section Title ── */}
      <div className="flex items-center gap-2 mb-5">
        <h2 className="font-['Manrope'] font-bold text-xl text-on-surface flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-primary" />
          Laporan Pertanggungjawaban (LPJ)
        </h2>
      </div>

      {/* Hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* ── Card ── */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6">
          <p className="text-sm text-on-surface-variant mb-5 leading-relaxed">
            Upload LPJ setelah kegiatan selesai dilaksanakan. Hanya file PDF
            yang diterima, maksimal 10MB.
          </p>

          {!lpj?.created_at ? (
            /* ── Belum ada LPJ ── */
            <div>
              <button
                onClick={!isUploading ? handleClickUpload : undefined}
                disabled={isUploading}
                className={`w-full h-36 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 ${
                  isUploading
                    ? "border-primary/40 bg-primary-fixed/10 cursor-wait"
                    : "border-outline-variant hover:border-primary hover:bg-primary-fixed/5 cursor-pointer"
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-7 h-7 text-primary animate-spin" />
                    <p className="text-sm font-bold text-primary">
                      Mengupload LPJ...
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Mohon tunggu sebentar
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-on-surface">
                      Upload LPJ
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Klik untuk memilih file PDF (maks. 10MB)
                    </p>
                  </>
                )}
              </button>

              <div className="mt-4 pt-4 border-t border-outline-variant/10 flex items-center justify-between text-xs">
                <span className="text-on-surface-variant font-medium">
                  Status LPJ
                </span>
                <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-bold">
                  Belum ada LPJ
                </span>
              </div>
            </div>
          ) : (
            /* ── Sudah ada LPJ ── */
            <div className="flex flex-col gap-4">
              {/* Status Card */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary-fixed/30">
                <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0">
                  <FileCheck className="w-6 h-6 text-on-secondary-fixed-variant" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-on-surface">
                    LPJ Telah Diupload
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Tanggal:{" "}
                    <span className="font-semibold text-on-surface">
                      {safeFormatDate(lpj.tanggal, "dd MMMM yyyy", {
                        locale: idLocale,
                      })}
                    </span>
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-[10px] font-bold uppercase tracking-wide">
                  Selesai
                </span>
              </div>

              {/* Meta */}
              <p className="text-xs text-on-surface-variant">
                Dibuat pada{" "}
                {safeFormatDate(lpj.created_at, "dd MMM yyyy, HH:mm", {
                  locale: idLocale,
                })}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {lpj.file_url && (
                  <a
                    href={
                      lpj.file_url.startsWith("http")
                        ? lpj.file_url
                        : `${MEDIA_BASE_URL}${lpj.file_url}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-fixed text-on-primary-fixed-variant text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Lihat File LPJ
                  </a>
                )}
                <button
                  onClick={() => setDeleteOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-error-container text-on-error-container text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus LPJ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Delete Dialog ── */}
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
