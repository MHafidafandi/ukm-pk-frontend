import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { Activity } from "../services/activityService";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: Activity | null;
  onConfirm: () => void;
};

export const ActivityDeleteDialog = ({
  open,
  onOpenChange,
  activity,
  onConfirm,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-surface p-0">
        <div className="px-8 pt-8 pb-6">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center mb-5">
            <AlertTriangle className="w-5 h-5 text-on-error-container" />
          </div>

          <DialogHeader className="text-left mb-4">
            <DialogTitle className="font-['Manrope'] font-bold text-xl text-on-surface mb-2">
              Hapus Kegiatan
            </DialogTitle>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Apakah kamu yakin ingin menghapus kegiatan{" "}
              <span className="font-bold text-on-surface">
                &ldquo;{activity?.judul}&rdquo;
              </span>
              ? Data progres, dokumen, dan LPJ terkait mungkin juga akan
              terhapus. Tindakan ini tidak dapat dibatalkan.
            </p>
          </DialogHeader>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => onOpenChange(false)}
              className="px-5 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface text-sm font-medium hover:bg-surface-container-high transition-colors"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="px-5 py-2.5 rounded-xl bg-error text-on-error text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Hapus Kegiatan
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
