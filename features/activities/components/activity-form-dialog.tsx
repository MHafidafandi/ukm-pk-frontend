import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreateActivityInput } from "@/lib/validations/activity-schema";
import { useRef, useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, ImagePlus, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

// ✅ Base URL untuk media/thumbnail dari backend
const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_URL ?? "";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit: boolean;
  form: CreateActivityInput;
  setForm: React.Dispatch<React.SetStateAction<CreateActivityInput>>;
  onSubmit: () => void;
  existingThumbnailUrl?: string;
};

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (form.thumbnail instanceof File) {
        setPreviewUrl(URL.createObjectURL(form.thumbnail));
      } else if (existingThumbnailUrl) {
        // ✅ Kalau sudah full URL biarkan, kalau relatif prefix dengan base URL
        const fullUrl = existingThumbnailUrl.startsWith("http")
          ? existingThumbnailUrl
          : `${MEDIA_BASE_URL}${existingThumbnailUrl}`;
        setPreviewUrl(fullUrl);
      } else {
        setPreviewUrl(null);
      }
    } else {
      setPreviewUrl(null);
    }
  }, [open, existingThumbnailUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, thumbnail: file });
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeThumbnail = () => {
    setForm({ ...form, thumbnail: null as any });
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Kegiatan" : "Buat Kegiatan Baru"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui informasi kegiatan."
              : "Tambahkan kegiatan baru ke dalam sistem."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 overflow-y-auto pr-1 -mr-1">
          {/* Thumbnail Upload */}
          <div className="grid gap-2">
            <Label>Thumbnail</Label>
            {previewUrl ? (
              <div className="relative h-36 w-full overflow-hidden rounded-lg border border-border bg-muted">
                <img
                  src={previewUrl}
                  alt="Thumbnail preview"
                  className="h-full w-full object-cover"
                  // ✅ Fallback kalau gambar gagal load
                  onError={() => setPreviewUrl(null)}
                />
                <button
                  type="button"
                  onClick={removeThumbnail}
                  className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
                >
                  <X className="size-3.5" />
                </button>
                <span className="absolute left-2 bottom-2 rounded-md bg-black/50 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
                  {form.thumbnail instanceof File ? "Foto baru" : "Foto saat ini"}
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-28 w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-border bg-muted/50 text-muted-foreground transition-colors hover:border-primary hover:bg-muted"
              >
                <ImagePlus className="size-6" />
                <span className="text-xs font-medium">Upload thumbnail</span>
                <span className="text-[10px]">PNG, JPG, WEBP (max 5MB)</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Judul */}
          <div className="grid gap-1.5">
            <Label>Judul Kegiatan *</Label>
            <Input
              value={form.judul}
              onChange={(e) => setForm({ ...form, judul: e.target.value })}
              placeholder="Contoh: Bakti Sosial 2024"
            />
          </div>

          {/* Lokasi */}
          <div className="grid gap-1.5">
            <Label>Lokasi *</Label>
            <Input
              value={form.lokasi}
              onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
              placeholder="Contoh: Desa Sukamaju"
            />
          </div>

          {/* Tanggal */}
          <div className="grid gap-1.5">
            <Label>Tanggal Pelaksanaan</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.tanggal && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.tanggal ? (
                    format(new Date(form.tanggal), "PPP")
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
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
          </div>

          {/* Deskripsi */}
          <div className="grid gap-1.5">
            <Label>Deskripsi</Label>
            <Textarea
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              placeholder="Deskripsi lengkap kegiatan..."
              className="h-24 resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={onSubmit}>{isEdit ? "Simpan" : "Buat"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};