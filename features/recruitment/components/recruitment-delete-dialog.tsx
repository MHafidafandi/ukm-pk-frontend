// @/features/recruitment/components/recruitment-delete-dialog.tsx
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Recruitment } from "@/features/recruitment/services/recruitmentService";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recruitment: Recruitment | null;
  onConfirm: () => void;
  isDeleting?: boolean;
};

export const RecruitmentDeleteDialog = ({
  open, onOpenChange, recruitment, onConfirm, isDeleting,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hapus Rekrutmen</DialogTitle>
          <DialogDescription>
            Apakah yakin ingin menghapus rekrutmen{" "}
            <strong>{recruitment?.nama_recruitment}</strong>?
            <br />
            Data pendaftar juga akan terhapus. Tindakan ini tidak bisa
            dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Menghapus..." : "Hapus"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};