import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Role } from "../api/get-roles";

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hapus Role</DialogTitle>
          <DialogDescription>
            Apakah yakin ingin menghapus role <strong>{role?.name}</strong>?
            <br />
            Tindakan ini tidak bisa dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
