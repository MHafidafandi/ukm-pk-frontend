import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Recruitment } from "@/features/recruitment/services/recruitmentService";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recruitment: Recruitment | null;
  onConfirm: () => void;
  isDeleting?: boolean;
};

export const RecruitmentDeleteDialog = ({
  open,
  onOpenChange,
  recruitment,
  onConfirm,
  isDeleting,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-surface-container-lowest p-0">
        <div className="px-8 pt-8 pb-6 bg-surface-container-low">
          <DialogHeader>
            <DialogTitle className="font-['Manrope'] text-xl font-bold text-destructive">
              Hapus Rekrutmen
            </DialogTitle>
            <DialogDescription className="text-sm text-on-surface-variant">
              Apakah yakin ingin menghapus rekrutmen{" "}
              <strong className="text-on-surface">
                {recruitment?.nama_recruitment}
              </strong>
              ?
              <br />
              Data pendaftar juga akan terhapus. Tindakan ini tidak bisa
              dibatalkan.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="px-8 py-5 flex justify-end gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="px-5 py-2.5 text-sm font-medium text-primary border border-outline/20 rounded-xl hover:bg-surface-container transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="font-bold px-6 py-2.5 text-sm text-white bg-destructive rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {isDeleting ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
