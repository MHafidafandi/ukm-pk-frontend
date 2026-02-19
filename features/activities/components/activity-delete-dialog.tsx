import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Activity } from "../api/get-activities";

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hapus Kegiatan</DialogTitle>
          <DialogDescription>
            Apakah yakin ingin menghapus kegiatan{" "}
            <strong>{activity?.judul}</strong>?
            <br />
            Data progres, dokumen, dan LPJ terkait mungkin juga akan terhapus.
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
