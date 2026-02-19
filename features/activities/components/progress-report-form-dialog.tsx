import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreateProgressReportInput } from "@/lib/validations/activity-schema";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit: boolean;
  form: CreateProgressReportInput;
  setForm: React.Dispatch<React.SetStateAction<CreateProgressReportInput>>;
  onSubmit: () => void;
};

export const ProgressReportFormDialog = ({
  open,
  onOpenChange,
  isEdit,
  form,
  setForm,
  onSubmit,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Laporan Progres" : "Buat Laporan Progres"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Judul */}
          <div className="grid gap-2">
            <Label>Judul Laporan *</Label>
            <Input
              value={form.judul}
              onChange={(e) =>
                setForm({
                  ...form,
                  judul: e.target.value,
                })
              }
              placeholder="Contoh: Laporan Minggu 1"
            />
          </div>

          {/* Tanggal */}
          <div className="grid gap-2">
            <Label>Tanggal Laporan</Label>
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
          <div className="grid gap-2">
            <Label>Deskripsi / Isi Laporan</Label>
            <Textarea
              value={form.deskripsi}
              onChange={(e) =>
                setForm({
                  ...form,
                  deskripsi: e.target.value,
                })
              }
              placeholder="Jelaskan progres yang telah dicapai..."
              className="h-32"
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
