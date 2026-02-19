import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Division } from "../api";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  division: Division | null;
  onConfirm: () => void;
};

export const DivisionDeleteDialog = ({
  open,
  onOpenChange,
  division,
  onConfirm,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hapus Divisi</DialogTitle>
          <DialogDescription>
            Apakah yakin ingin menghapus divisi{" "}
            <strong>{division?.nama_divisi}</strong>?
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
