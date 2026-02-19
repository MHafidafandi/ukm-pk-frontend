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
import { useState } from "react";
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
  form: CreateActivityInput;
  setForm: React.Dispatch<React.SetStateAction<CreateActivityInput>>;
  onSubmit: () => void;
};

export const ActivityFormDialog = ({
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
            {isEdit ? "Edit Kegiatan" : "Buat Kegiatan Baru"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui informasi kegiatan."
              : "Tambahkan kegiatan baru ke dalam sistem."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Judul */}
          <div className="grid gap-2">
            <Label>Judul Kegiatan *</Label>
            <Input
              value={form.judul}
              onChange={(e) =>
                setForm({
                  ...form,
                  judul: e.target.value,
                })
              }
              placeholder="Contoh: Bakti Sosial 2024"
            />
          </div>

          {/* Lokasi */}
          <div className="grid gap-2">
            <Label>Lokasi *</Label>
            <Input
              value={form.lokasi}
              onChange={(e) =>
                setForm({
                  ...form,
                  lokasi: e.target.value,
                })
              }
              placeholder="Contoh: Desa Sukamaju"
            />
          </div>

          {/* Tanggal */}
          <div className="grid gap-2">
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
          <div className="grid gap-2">
            <Label>Deskripsi</Label>
            <Textarea
              value={form.deskripsi}
              onChange={(e) =>
                setForm({
                  ...form,
                  deskripsi: e.target.value,
                })
              }
              placeholder="Deskripsi lengkap kegiatan..."
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
