// @/features/recruitment/components/recruitment-form-dialog.tsx
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Rekrutmen" : "Buat Rekrutmen Baru"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui informasi rekrutmen."
              : "Buat pendaftaran rekrutmen baru."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Judul */}
          <div className="grid gap-2">
            <Label>Judul Kegiatan *</Label>
            <Input
              value={form.nama_recruitment}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  nama_recruitment: e.target.value,
                }))
              }
              placeholder="Contoh: Open Recruitment Staff 2025"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Tanggal Mulai *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.tanggal_buka && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.tanggal_buka
                      ? format(form.tanggal_buka, "PPP")
                      : "Pilih tanggal"}
                  </Button>
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
            <div className="grid gap-2">
              <Label>Tanggal Selesai *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.tanggal_tutup && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.tanggal_tutup
                      ? format(form.tanggal_tutup, "PPP")
                      : "Pilih tanggal"}
                  </Button>
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

          {/* Announcement Link (only on edit) */}
          {isEdit && (
            <div className="grid gap-2">
              <Label>Link Pengumuman</Label>
              <Input
                value={form.announcement_link}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    announcement_link: e.target.value,
                  }))
                }
                placeholder="https://drive.google.com/..."
              />
            </div>
          )}

          {/* Deskripsi */}
          <div className="grid gap-2">
            <Label>Deskripsi *</Label>
            <Textarea
              value={form.deskripsi}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  deskripsi: e.target.value,
                }))
              }
              placeholder="Deskripsi serta persyaratan rekrutmen..."
              className="h-32"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : isEdit ? "Simpan" : "Buat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};