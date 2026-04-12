"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAssetContext } from "@/features/inventory/contexts/AssetContext";
import { Asset } from "@/features/inventory/services/assetService";
import { env } from "@/configs/env";
import { ImagePlus, X, Loader2 } from "lucide-react";

const MEDIA_BASE_URL = env.MEDIA_URL;

// ── Schema ────────────────────────────────────────────────────────────────────
const assetSchema = z.object({
  nama: z.string().min(1, "Nama aset wajib diisi"),
  kode: z.string().min(1, "Kode aset wajib diisi"),
  judul: z.string().optional(),
  deskripsi: z.string().optional(),
  lokasi: z.string().min(1, "Lokasi wajib diisi"),
  jumlah: z.coerce.number().min(1, "Jumlah minimal 1"),
  kondisi: z.enum([
    "baik",
    "rusak_ringan",
    "rusak_berat",
    "hilang",
    "dipinjam",
    "dalam_perbaikan",
  ]),
});

type AssetSchema = z.infer<typeof assetSchema>;

interface AssetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: Asset | null;
  onSuccess?: () => void;
}

const EMPTY_DEFAULTS: AssetSchema = {
  nama: "",
  kode: "",
  judul: "",
  deskripsi: "",
  lokasi: "",
  jumlah: 1,
  kondisi: "baik",
};

const KONDISI_OPTIONS = [
  { value: "baik", label: "Baik" },
  { value: "rusak_ringan", label: "Rusak Ringan" },
  { value: "rusak_berat", label: "Rusak Berat" },
  { value: "hilang", label: "Hilang" },
  { value: "dipinjam", label: "Dipinjam" },
  { value: "dalam_perbaikan", label: "Dalam Perbaikan" },
];

// ── Sub-components ────────────────────────────────────────────────────────────
const FieldWrapper = ({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
      {label}
    </label>
    {children}
    {error && <p className="text-xs text-error mt-0.5">{error}</p>}
  </div>
);

const inputClass =
  "w-full bg-surface-container-low border-0 border-b-2 border-outline-variant rounded-t-lg px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary transition-colors placeholder:text-outline";

// ── Component ─────────────────────────────────────────────────────────────────
export const AssetFormDialog = ({
  open,
  onOpenChange,
  asset,
  onSuccess,
}: AssetFormDialogProps) => {
  const { createAsset, updateAsset } = useAssetContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = Boolean(asset);

  const form = useForm<AssetSchema>({
    resolver: zodResolver(assetSchema as any),
    defaultValues: EMPTY_DEFAULTS,
  });

  const {
    formState: { errors },
  } = form;

  const resetAll = useCallback(() => {
    form.reset(EMPTY_DEFAULTS);
    setFotoFile(null);
    setFotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [form]);

  useEffect(() => {
    if (!open) return;
    if (asset) {
      form.reset({
        nama: asset.nama ?? "",
        kode: asset.kode ?? "",
        judul: asset.judul ?? "",
        deskripsi: asset.deskripsi ?? "",
        lokasi: asset.lokasi ?? "",
        jumlah: asset.jumlah ?? 1,
        kondisi: asset.kondisi ?? "baik",
      });
      setFotoPreview(asset.foto_url ?? null);
    } else {
      form.reset(EMPTY_DEFAULTS);
      setFotoPreview(null);
    }
    setFotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [open, asset, form]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) resetAll();
      onOpenChange(nextOpen);
    },
    [onOpenChange, resetAll],
  );

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearFoto = () => {
    setFotoFile(null);
    setFotoPreview(isEditMode && asset?.foto_url ? asset.foto_url : null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const buildFormData = (data: AssetSchema): FormData => {
    const fd = new FormData();
    fd.append("nama", data.nama);
    fd.append("kode", data.kode);
    if (data.judul) fd.append("judul", data.judul);
    if (data.deskripsi) fd.append("deskripsi", data.deskripsi);
    fd.append("lokasi", data.lokasi);
    fd.append("jumlah", String(data.jumlah));
    fd.append("kondisi", data.kondisi);
    if (fotoFile) fd.append("foto", fotoFile);
    return fd;
  };

  const onSubmit: SubmitHandler<AssetSchema> = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = buildFormData(data);
      if (isEditMode && asset) {
        await updateAsset({ id: asset.id, data: formData as any });
      } else {
        await createAsset(formData as any);
      }
      resetAll();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("[AssetFormDialog] submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto bg-surface p-0">
        {/* ── Header ── */}
        <DialogHeader className="px-8 pt-8 pb-6 border-b border-outline-variant/10">
          <DialogTitle className="font-['Manrope'] font-bold text-xl text-on-surface">
            {isEditMode ? "Edit Aset" : "Tambah Aset Baru"}
          </DialogTitle>
          <p className="text-sm text-on-surface-variant mt-1">
            {isEditMode
              ? "Perbarui informasi aset organisasi."
              : "Daftarkan aset baru ke sistem inventaris."}
          </p>
        </DialogHeader>

        {/* ── Form Body ── */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-8 py-6 space-y-6"
          >
            {/* Nama */}
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FieldWrapper label="Nama Aset" error={errors.nama?.message}>
                  <input
                    {...field}
                    className={inputClass}
                    placeholder="Laptop Dell XPS 13"
                  />
                </FieldWrapper>
              )}
            />

            {/* Kode + Judul */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="kode"
                render={({ field }) => (
                  <FieldWrapper label="Kode Aset" error={errors.kode?.message}>
                    <input
                      {...field}
                      className={inputClass}
                      placeholder="LP-DELL-001"
                    />
                  </FieldWrapper>
                )}
              />
              <FormField
                control={form.control}
                name="judul"
                render={({ field }) => (
                  <FieldWrapper label="Judul (opsional)">
                    <input
                      {...field}
                      className={inputClass}
                      placeholder="Laptop Dell XPS 2023"
                    />
                  </FieldWrapper>
                )}
              />
            </div>

            {/* Jumlah + Kondisi */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="jumlah"
                render={({ field }) => (
                  <FieldWrapper label="Jumlah" error={errors.jumlah?.message}>
                    <input
                      {...field}
                      type="number"
                      min={1}
                      className={inputClass}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FieldWrapper>
                )}
              />
              <FormField
                control={form.control}
                name="kondisi"
                render={({ field }) => (
                  <FieldWrapper label="Kondisi" error={errors.kondisi?.message}>
                    <select {...field} className={inputClass}>
                      {KONDISI_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </FieldWrapper>
                )}
              />
            </div>

            {/* Lokasi */}
            <FormField
              control={form.control}
              name="lokasi"
              render={({ field }) => (
                <FieldWrapper label="Lokasi" error={errors.lokasi?.message}>
                  <input
                    {...field}
                    className={inputClass}
                    placeholder="Lab Komputer Gedung A"
                  />
                </FieldWrapper>
              )}
            />

            {/* Deskripsi */}
            <FormField
              control={form.control}
              name="deskripsi"
              render={({ field }) => (
                <FieldWrapper label="Deskripsi (opsional)">
                  <textarea
                    {...field}
                    rows={3}
                    className={`${inputClass} resize-none`}
                    placeholder="Deskripsi singkat tentang aset ini..."
                  />
                </FieldWrapper>
              )}
            />

            {/* Foto */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Foto Aset (opsional)
              </label>

              {fotoPreview ? (
                <div className="relative w-full h-40 rounded-xl overflow-hidden bg-surface-container">
                  <img
                    src={
                      fotoFile ? fotoPreview : `${MEDIA_BASE_URL}${fotoPreview}`
                    }
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearFoto}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-error-container text-on-error-container flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 rounded-xl border-2 border-dashed border-outline-variant hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 text-on-surface-variant hover:text-primary"
                >
                  <ImagePlus className="w-6 h-6" />
                  <span className="text-xs font-medium">
                    Klik untuk unggah foto
                  </span>
                  <span className="text-[10px] text-outline">
                    PNG, JPG hingga 5MB
                  </span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFotoChange}
                className="hidden"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface text-sm font-medium hover:bg-surface-container-high transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white text-sm font-bold shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting
                  ? "Menyimpan..."
                  : isEditMode
                    ? "Perbarui"
                    : "Simpan Aset"}
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
