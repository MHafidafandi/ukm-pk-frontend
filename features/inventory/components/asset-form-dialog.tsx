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
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAssetContext } from "@/features/inventory/contexts/AssetContext";
import { Asset } from "@/features/inventory/services/assetService";

// ── Schema ─────────────────────────────────────────────────────────────────
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

// ── Props (dibersihkan — hanya yang benar-benar dipakai) ───────────────────
interface AssetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: Asset | null;
  onSuccess?: () => void;
}

// ── Defaults ───────────────────────────────────────────────────────────────
const EMPTY_DEFAULTS: AssetSchema = {
  nama: "",
  kode: "",
  judul: "",
  deskripsi: "",
  lokasi: "",
  jumlah: 1,
  kondisi: "baik",
};

const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_URL ?? "";

// ── Component ──────────────────────────────────────────────────────────────
export const AssetFormDialog = ({
  open,
  onOpenChange,
  asset,
  onSuccess,
}: AssetFormDialogProps) => {
  const { createAsset, updateAsset } = useAssetContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Foto state (dihandle terpisah dari react-hook-form karena File object)
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mode ditentukan dari ada/tidaknya asset — satu sumber kebenaran
  const isEditMode = Boolean(asset);

  const form = useForm<AssetSchema>({
    resolver: zodResolver(assetSchema as any),
    defaultValues: EMPTY_DEFAULTS,
  });

  // ── Reset semua state internal ──────────────────────────────────────────
  const resetAll = useCallback(() => {
    form.reset(EMPTY_DEFAULTS);
    setFotoFile(null);
    setFotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [form]);

  // ── Populate / reset saat dialog dibuka ─────────────────────────────────
  useEffect(() => {
    if (!open) return; // hanya proses saat dialog terbuka

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

  // ── Handle dialog close (Batal / klik backdrop) ─────────────────────────
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        resetAll();
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange, resetAll]
  );

  // ── Handle foto change ─────────────────────────────────────────────────
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

  // ── Build FormData helper ──────────────────────────────────────────────
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

  // ── Submit ─────────────────────────────────────────────────────────────
  const onSubmit: SubmitHandler<AssetSchema> = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = buildFormData(data);

      if (isEditMode && asset) {
        await updateAsset({ id: asset.id, data: formData as any });
      } else {
        await createAsset(formData as any);
      }

      // Sukses → tutup dialog, reset, notify parent
      resetAll();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("[AssetFormDialog] submit error:", error);
      // Dialog tetap terbuka agar user bisa coba lagi
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render (TIDAK ADA PERUBAHAN TAMPILAN) ──────────────────────────────
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Aset" : "Tambah Aset Baru"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nama */}
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Aset</FormLabel>
                  <FormControl>
                    <Input placeholder="Laptop Dell XPS 13" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Kode + Judul */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="kode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Aset</FormLabel>
                    <FormControl>
                      <Input placeholder="LP-DELL-XPS13-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="judul"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul</FormLabel>
                    <FormControl>
                      <Input placeholder="Laptop Dell XPS 13 2023" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Jumlah + Kondisi */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="jumlah"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kondisi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kondisi</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kondisi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="baik">Baik</SelectItem>
                        <SelectItem value="rusak_ringan">Rusak Ringan</SelectItem>
                        <SelectItem value="rusak_berat">Rusak Berat</SelectItem>
                        <SelectItem value="hilang">Hilang</SelectItem>
                        <SelectItem value="dipinjam">Dipinjam</SelectItem>
                        <SelectItem value="dalam_perbaikan">Dalam Perbaikan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Lokasi */}
            <FormField
              control={form.control}
              name="lokasi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lokasi</FormLabel>
                  <FormControl>
                    <Input placeholder="Lab Komputer Gedung A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Deskripsi */}
            <FormField
              control={form.control}
              name="deskripsi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Deskripsi aset (opsional)"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Foto Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Foto</label>
              <div className="flex items-center gap-3">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFotoChange}
                  className="flex-1"
                />
                {fotoFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearFoto}
                  >
                    Hapus
                  </Button>
                )}
              </div>
              {fotoPreview && (
                <div className="mt-2 rounded-md border overflow-hidden w-fit">

                  <img
                    src={`${MEDIA_BASE_URL}${fotoPreview}`}
                    alt="Preview foto aset"
                    className="h-32 w-auto object-cover"
                  />
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Menyimpan..."
                  : isEditMode
                    ? "Perbarui"
                    : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};