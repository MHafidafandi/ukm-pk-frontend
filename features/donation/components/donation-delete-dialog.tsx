"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Donation } from "../types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donation: Donation | null;
  onConfirm: () => void;
};

export const DonationDeleteDialog = ({
  open,
  onOpenChange,
  donation,
  onConfirm,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Donasi</DialogTitle>
          <DialogDescription>
            Apakah yakin ingin menghapus catatan donasi dari{" "}
            <strong>{donation?.nama_donatur}</strong> sebesar Rp{" "}
            {donation?.jumlah.toLocaleString("id-ID")}?
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
