import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateProgressReportInput } from "@/lib/validations/activity-schema";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit: boolean;
  form: CreateProgressReportInput;
  setForm: React.Dispatch<React.SetStateAction<CreateProgressReportInput>>;
  onSubmit: () => void;
};

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
      <DialogContent className="sm:max-w-[500px] bg-surface p-0">
        {/* ── Header ── */}
        <DialogHeader className="px-8 pt-8 pb-6 border-b border-outline-variant/10">
          <DialogTitle className="font-['Manrope'] font-bold text-xl text-on-surface">
            {isEdit ? "Edit Laporan Progres" : "Buat Laporan Progres"}
          </DialogTitle>
          <p className="text-sm text-on-surface-variant mt-1">
            {isEdit
              ? "Perbarui laporan progres kegiatan."
              : "Catat perkembangan terbaru kegiatan."}
          </p>
        </DialogHeader>

        {/* ── Form ── */}
        <div className="px-8 py-6 space-y-6">
          {/* Judul */}
          <FieldWrapper label="Judul Laporan *">
            <input
              value={form.judul}
              onChange={(e) => setForm({ ...form, judul: e.target.value })}
              className={inputClass}
              placeholder="Contoh: Laporan Minggu 1"
            />
          </FieldWrapper>

          {/* Tanggal */}
          <FieldWrapper label="Tanggal Laporan">
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
          <FieldWrapper label="Isi Laporan">
            <textarea
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              rows={5}
              className={`${inputClass} resize-none`}
              placeholder="Jelaskan progres yang telah dicapai..."
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
              {isEdit ? "Simpan" : "Buat Laporan"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
