import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Role } from "@/features/roles/services/roleService";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  onConfirm: () => void;
};

export const RoleDeleteDialog = ({
  open,
  onOpenChange,
  role,
  onConfirm,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-surface-container-lowest p-0">
        <div className="px-8 pt-8 pb-6 bg-surface-container-low">
          <DialogHeader>
            <DialogTitle className="font-['Manrope'] text-xl font-bold text-destructive">
              Hapus Role
            </DialogTitle>
            <DialogDescription className="text-sm text-on-surface-variant">
              Apakah yakin ingin menghapus role{" "}
              <strong className="text-on-surface">{role?.name}</strong>?
              <br />
              Tindakan ini tidak bisa dibatalkan.
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
            className="font-bold px-6 py-2.5 text-sm text-white bg-destructive rounded-xl hover:opacity-90 active:scale-95 transition-all"
          >
            Hapus
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
