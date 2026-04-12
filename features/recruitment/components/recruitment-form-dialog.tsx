import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

type FormData = {
  nama_recruitment: string;
  deskripsi: string;
  tanggal_buka: Date;
  tanggal_tutup: Date;
  announcement_link: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit: boolean;
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: () => void;
  isSubmitting?: boolean;
};

const inputClass =
  "w-full bg-surface-container-low border-0 border-b-2 border-outline-variant rounded-none px-0 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:ring-0 focus:border-primary transition-all";
const labelClass =
  "text-xs font-bold uppercase tracking-widest text-on-surface-variant";

export const RecruitmentFormDialog = ({
  open,
  onOpenChange,
  isEdit,
  form,
  setForm,
  onSubmit,
  isSubmitting,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-surface-container-lowest p-0">
        <div className="px-8 pt-8 pb-6 bg-surface-container-low">
          <DialogHeader>
            <DialogTitle className="font-['Manrope'] text-xl font-bold text-primary">
              {isEdit ? "Edit Rekrutmen" : "Buat Rekrutmen Baru"}
            </DialogTitle>
            <DialogDescription className="text-sm text-on-surface-variant">
              {isEdit
                ? "Perbarui informasi rekrutmen."
                : "Buat pendaftaran rekrutmen baru."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Judul */}
          <div className="space-y-2">
            <Label className={labelClass}>Judul Kegiatan *</Label>
            <Input
              value={form.nama_recruitment}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  nama_recruitment: e.target.value,
                }))
              }
              placeholder="Contoh: Open Recruitment Staff 2025"
              className={inputClass}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className={labelClass}>Tanggal Mulai *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "w-full flex items-center gap-2 border-0 border-b-2 border-outline-variant py-2.5 text-sm text-left transition-all hover:border-primary",
                      !form.tanggal_buka && "text-on-surface-variant",
                    )}
                  >
                    <CalendarIcon className="h-4 w-4 text-on-surface-variant flex-shrink-0" />
                    {form.tanggal_buka
                      ? format(form.tanggal_buka, "PPP")
                      : "Pilih tanggal"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.tanggal_buka}
                    onSelect={(date) =>
                      setForm((prev) => ({
                        ...prev,
                        tanggal_buka: date ?? new Date(),
                      }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label className={labelClass}>Tanggal Selesai *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "w-full flex items-center gap-2 border-0 border-b-2 border-outline-variant py-2.5 text-sm text-left transition-all hover:border-primary",
                      !form.tanggal_tutup && "text-on-surface-variant",
                    )}
                  >
                    <CalendarIcon className="h-4 w-4 text-on-surface-variant flex-shrink-0" />
                    {form.tanggal_tutup
                      ? format(form.tanggal_tutup, "PPP")
                      : "Pilih tanggal"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.tanggal_tutup}
                    onSelect={(date) =>
                      setForm((prev) => ({
                        ...prev,
                        tanggal_tutup: date ?? new Date(),
                      }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Announcement Link — only on edit */}
          {isEdit && (
            <div className="space-y-2">
              <Label className={labelClass}>Link Pengumuman</Label>
              <Input
                value={form.announcement_link}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    announcement_link: e.target.value,
                  }))
                }
                placeholder="https://drive.google.com/..."
                className={inputClass}
              />
            </div>
          )}

          {/* Deskripsi */}
          <div className="space-y-2">
            <Label className={labelClass}>Deskripsi *</Label>
            <Textarea
              value={form.deskripsi}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, deskripsi: e.target.value }))
              }
              placeholder="Deskripsi serta persyaratan rekrutmen..."
              className="bg-surface-container-low border-0 border-b-2 border-outline-variant rounded-none px-0 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:ring-0 focus:border-primary transition-all h-28 resize-none"
            />
          </div>
        </div>

        <div className="px-8 py-5 bg-surface-container-low flex justify-end gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="px-5 py-2.5 text-sm font-medium text-primary border border-outline/20 rounded-xl hover:bg-surface-container transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="font-bold px-6 py-2.5 text-sm text-on-primary bg-primary-gradient rounded-xl shadow-ambient hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Menyimpan..." : isEdit ? "Simpan" : "Buat"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
