import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateActivityInput } from "@/lib/validations/activity-schema";
import { useRef, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { ImagePlus, X, Loader2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { env } from "@/configs/env";

const MEDIA_BASE_URL = env.MEDIA_URL;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit: boolean;
  form: CreateActivityInput;
  setForm: React.Dispatch<React.SetStateAction<CreateActivityInput>>;
  onSubmit: () => void;
  existingThumbnailUrl?: string;
};

// ── Sub-components ────────────────────────────────────────────────────────────
const FieldWrapper = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
      {label}
    </label>
    {children}
  </div>
);

const inputClass =
  "w-full bg-surface-container-low border-0 border-b-2 border-outline-variant rounded-t-lg px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary transition-colors placeholder:text-outline";

// ── Component ─────────────────────────────────────────────────────────────────
export const ActivityFormDialog = ({
  open,
  onOpenChange,
  isEdit,
  form,
  setForm,
  onSubmit,
  existingThumbnailUrl,
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filePreviewUrl = useMemo(() => {
    if (!(form.thumbnail instanceof File)) return null;
    return URL.createObjectURL(form.thumbnail);
  }, [form.thumbnail]);

  useEffect(() => {
    return () => {
      if (filePreviewUrl?.startsWith("blob:"))
        URL.revokeObjectURL(filePreviewUrl);
    };
  }, [filePreviewUrl]);

  const previewUrl = !open
    ? null
    : form.thumbnail === null
      ? null
      : filePreviewUrl ||
        (existingThumbnailUrl
          ? existingThumbnailUrl.startsWith("http")
            ? existingThumbnailUrl
            : `${MEDIA_BASE_URL}${existingThumbnailUrl}`
          : null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran file gambar maksimal 2MB");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setForm({ ...form, thumbnail: file });
    }
  };

  const removeThumbnail = () => {
    setForm({ ...form, thumbnail: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto bg-surface p-0">
        {/* ── Header ── */}
        <DialogHeader className="px-8 pt-8 pb-6 border-b border-outline-variant/10">
          <DialogTitle className="font-['Manrope'] font-bold text-xl text-on-surface">
            {isEdit ? "Edit Kegiatan" : "Buat Kegiatan Baru"}
          </DialogTitle>
          <p className="text-sm text-on-surface-variant mt-1">
            {isEdit
              ? "Perbarui informasi kegiatan."
              : "Tambahkan kegiatan baru ke dalam sistem."}
          </p>
        </DialogHeader>

        {/* ── Form ── */}
        <div className="px-8 py-6 space-y-6">
          {/* Thumbnail */}
          <FieldWrapper label="Thumbnail">
            {previewUrl ? (
              <div className="relative h-40 w-full rounded-2xl overflow-hidden bg-surface-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeThumbnail}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-error-container text-on-error-container bg-white border border-outline-variant flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <span className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-on-surface/50 backdrop-blur-sm text-[10px] text-white font-medium">
                  {form.thumbnail instanceof File
                    ? "Foto baru"
                    : "Foto saat ini"}
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 rounded-2xl border-2 border-dashed border-outline-variant hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 text-on-surface-variant hover:text-primary"
              >
                <ImagePlus className="w-6 h-6" />
                <span className="text-xs font-medium">
                  Klik untuk unggah thumbnail
                </span>
                <span className="text-[10px] text-outline">
                  PNG, JPG, WEBP (maks. 2MB)
                </span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </FieldWrapper>

          {/* Judul */}
          <FieldWrapper label="Judul Kegiatan *">
            <input
              value={form.judul}
              onChange={(e) => setForm({ ...form, judul: e.target.value })}
              className={inputClass}
              placeholder="Contoh: Bakti Sosial 2024"
            />
          </FieldWrapper>

          {/* Lokasi */}
          <FieldWrapper label="Lokasi *">
            <input
              value={form.lokasi}
              onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
              className={inputClass}
              placeholder="Contoh: Desa Sukamaju"
            />
          </FieldWrapper>

          {/* Tanggal */}
          <FieldWrapper label="Tanggal Pelaksanaan">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    inputClass,
                    "flex items-center gap-2 text-left",
                    !form.tanggal && "text-outline",
                  )}
                >
                  <CalendarIcon className="w-4 h-4 shrink-0" />
                  {form.tanggal
                    ? format(new Date(form.tanggal), "PPP")
                    : "Pilih tanggal"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.tanggal ? new Date(form.tanggal) : undefined}
                  onSelect={(date) =>
                    setForm({ ...form, tanggal: date ?? new Date() })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </FieldWrapper>

          {/* Deskripsi */}
          <FieldWrapper label="Deskripsi">
            <textarea
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              rows={4}
              className={`${inputClass} resize-none`}
              placeholder="Deskripsi lengkap kegiatan..."
            />
          </FieldWrapper>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-5 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface text-sm font-medium hover:bg-surface-container-high transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white text-sm font-bold shadow-lg hover:opacity-90 transition-opacity"
            >
              {isEdit ? "Simpan Perubahan" : "Buat Kegiatan"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
