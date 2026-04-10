"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import {
  createDonationSchema,
  DonationSchema,
} from "@/lib/validations/donation-schema";
import { Donation } from "../services/donationService";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit?: boolean;
  baseData?: Donation | null; // Data untuk edit
  onSubmit: (data: FormData) => void;
};

export const DonationFormDialog = ({
  open,
  onOpenChange,
  isEdit = false,
  baseData,
  onSubmit,
}: Props) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<DonationSchema>({
    resolver: zodResolver(createDonationSchema as any),
    defaultValues: {
      nama_donatur: "",
      jumlah: 0,
      metode: "cash",
      deskripsi: "",
      status: "pending",
      tanggal: new Date().toISOString().split("T")[0],
    },
  });

  // Reset form when dialog opens/closes or baseData changes
  useEffect(() => {
    if (open) {
      setSelectedFile(null);
      if (isEdit && baseData) {
        form.reset({
          nama_donatur: baseData.nama_donatur,
          jumlah: baseData.jumlah,
          metode: baseData.metode,
          deskripsi: baseData.deskripsi ?? "",
          status: baseData.status,
          tanggal: baseData.tanggal
            ? new Date(baseData.tanggal).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        });
      } else {
        form.reset({
          nama_donatur: "",
          jumlah: 0,
          metode: "cash",
          deskripsi: "",
          status: "pending",
          tanggal: new Date().toISOString().split("T")[0],
        });
      }
    }
  }, [open, isEdit, baseData, form]);

  const handleSubmit: SubmitHandler<DonationSchema> = (values) => {
    const formData = new FormData();
    formData.append("nama_donatur", values.nama_donatur);
    formData.append("jumlah", values.jumlah.toString());
    formData.append("metode", values.metode);
    if (values.deskripsi) formData.append("deskripsi", values.deskripsi);
    formData.append("status", values.status);
    if (values.tanggal) formData.append("tanggal", values.tanggal);
    if (selectedFile) formData.append("bukti_pembayaran", selectedFile);

    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Donasi" : "Catat Donasi Baru"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="nama_donatur"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Donatur</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama donatur..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="jumlah"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah (Rp)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tanggal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="metode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metode Donasi</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih metode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Tunai (Cash)</SelectItem>
                        <SelectItem value="bank_transfer">
                          Transfer Bank
                        </SelectItem>
                        <SelectItem value="e_wallet">E-Wallet</SelectItem>
                        <SelectItem value="qris">QRIS</SelectItem>
                        <SelectItem value="other">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Menunggu</SelectItem>
                        <SelectItem value="verified">Terverifikasi</SelectItem>
                        <SelectItem value="rejected">Ditolak</SelectItem>
                        <SelectItem value="canceled">Dibatalkan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="deskripsi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan / Pesan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Pesan dari donatur atau catatan pengurus..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Bukti Pembayaran (Opsional)</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSelectedFile(file);
                  }}
                />
              </FormControl>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                Upload bukti pembayaran donasi jika ada (PNG, JPG, PDF)
              </p>
            </FormItem>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
