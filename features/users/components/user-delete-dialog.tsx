import { User } from "@/contexts/AuthContext";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

/* ================= TYPES ================= */

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  user: User | null;

  onConfirm: () => void;
};

/* ================= COMPONENT ================= */

export const UserDeleteDialog = ({
  open,
  onOpenChange,
  user,
  onConfirm,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hapus Anggota</DialogTitle>

          <DialogDescription>
            Apakah yakin ingin menghapus <strong>{user?.nama}</strong>?
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
