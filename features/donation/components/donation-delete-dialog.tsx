"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Donation } from "../services/donationService";
import { Trash2 } from "lucide-react";

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
  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border-0 shadow-2xl bg-surface">

        {/* Body */}
        <div className="px-8 pt-8 pb-6 text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-error-container flex items-center justify-center mb-5">
            <Trash2 className="w-7 h-7 text-on-error-container" strokeWidth={1.5} />
          </div>

          {/* Title */}
          <h2 className="font-['Manrope'] font-bold text-xl text-on-surface mb-2">
            Hapus Catatan Donasi?
          </h2>

          {/* Description */}
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Kamu akan menghapus donasi dari{" "}
            <span className="font-semibold text-on-surface">{donation?.nama_donatur}</span>{" "}
            senilai{" "}
            <span className="font-['Manrope'] font-bold text-on-surface">
              {donation ? formatRupiah(donation.jumlah) : "—"}
            </span>
            .
          </p>
          <p className="text-xs text-on-surface-variant mt-2">
            Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
          </p>
        </div>

        {/* Footer */}
        <DialogFooter className="px-8 py-6 bg-surface-container-low grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="rounded-xl border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            className="rounded-xl bg-error text-on-error font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
            onClick={onConfirm}
          >
            <Trash2 className="w-4 h-4" />
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};