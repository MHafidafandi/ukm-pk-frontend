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
import { toast } from "sonner";
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
import {
  HeartHandshake,
  Pencil,
  Loader2,
  UploadCloud,
  Landmark,
  Banknote,
  Wallet,
  QrCode,
  HelpCircle,
} from "lucide-react";

const normalizeDonationMethod = (
  method: Donation["metode"],
): DonationSchema["metode"] => {
  if (
    ["bank_transfer", "cash", "e_wallet", "qris", "other"].includes(
      method as string,
    )
  )
    return method as DonationSchema["metode"];
  const normalized = method.toLowerCase().replace(/\s+/g, "_");
  if (
    ["bank_transfer", "cash", "e_wallet", "qris", "other"].includes(normalized)
  )
    return normalized as DonationSchema["metode"];
  return "other";
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit?: boolean;
  baseData?: Donation | null;
  onSubmit: (data: FormData) => void;
};

const METHOD_OPTIONS = [
  { value: "cash", label: "Tunai (Cash)", Icon: Banknote },
  { value: "bank_transfer", label: "Transfer Bank", Icon: Landmark },
  { value: "e_wallet", label: "E-Wallet", Icon: Wallet },
  { value: "qris", label: "QRIS", Icon: QrCode },
  { value: "other", label: "Lainnya", Icon: HelpCircle },
];

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
      tanggal: new Date().toISOString().split("T")[0],
      bukti_pembayaran: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      setSelectedFile(null);
      if (isEdit && baseData) {
        form.reset({
          nama_donatur: baseData.nama_donatur,
          jumlah: baseData.jumlah,
          metode: normalizeDonationMethod(baseData.metode),
          deskripsi: baseData.deskripsi ?? "",
          tanggal: baseData.tanggal
            ? new Date(baseData.tanggal).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          bukti_pembayaran: undefined,
        });
      } else {
        form.reset({
          nama_donatur: "",
          jumlah: 0,
          metode: "cash",
          deskripsi: "",
          tanggal: new Date().toISOString().split("T")[0],
          bukti_pembayaran: undefined,
        });
      }
    }
  }, [open, isEdit, baseData, form]);

  const handleSubmit: SubmitHandler<DonationSchema> = (values) => {
    if (!isEdit && !selectedFile) {
      form.setError("bukti_pembayaran", {
        type: "manual",
        message: "Bukti pembayaran wajib diunggah untuk donasi baru",
      });
      return;
    }

    const formData = new FormData();
    formData.append("nama_donatur", values.nama_donatur);
    formData.append("jumlah", values.jumlah.toString());
    formData.append("metode", values.metode);
    if (values.deskripsi) formData.append("deskripsi", values.deskripsi);
    if (values.tanggal) formData.append("tanggal", values.tanggal);
    if (selectedFile) formData.append("bukti_pembayaran", selectedFile);

    onSubmit(formData);
  };

  const TitleIcon = isEdit ? Pencil : HeartHandshake;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl border-0 shadow-2xl bg-surface">
        {/* Header */}
        <DialogHeader className="px-8 pt-8 pb-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
              <TitleIcon
                className="w-5 h-5 text-on-secondary-container"
                strokeWidth={2}
              />
            </div>
            <div>
              <DialogTitle className="font-['Manrope'] font-bold text-lg text-on-surface">
                {isEdit ? "Edit Donasi" : "Catat Donasi Baru"}
              </DialogTitle>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {isEdit
                  ? "Perbarui informasi catatan donasi"
                  : "Tambahkan catatan donasi baru ke sistem"}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="px-8 py-6 space-y-5">
              {/* Nama Donatur */}
              <FormField
                control={form.control}
                name="nama_donatur"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Nama Donatur
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nama lengkap donatur..."
                        className="bg-surface-container-low border-0 border-b-2 border-outline-variant rounded-t-lg rounded-b-none focus-visible:ring-0 focus-visible:border-primary transition-colors placeholder:text-outline"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-error text-xs" />
                  </FormItem>
                )}
              />

              {/* Jumlah + Tanggal */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="jumlah"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                        Jumlah (Rp)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          className="bg-surface-container-low border-0 border-b-2 border-outline-variant rounded-t-lg rounded-b-none focus-visible:ring-0 focus-visible:border-primary transition-colors"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-error text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tanggal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                        Tanggal
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="bg-surface-container-low border-0 border-b-2 border-outline-variant rounded-t-lg rounded-b-none focus-visible:ring-0 focus-visible:border-primary transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-error text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Metode */}
              <FormField
                control={form.control}
                name="metode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Metode Pembayaran
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-surface-container-low border-0 border-b-2 border-outline-variant rounded-t-lg rounded-b-none focus:ring-0 focus:border-primary transition-colors">
                          <SelectValue placeholder="Pilih metode pembayaran" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-surface-container-lowest border-0 shadow-2xl rounded-xl">
                        {METHOD_OPTIONS.map(({ value, label, Icon }) => (
                          <SelectItem
                            key={value}
                            value={value}
                            className="focus:bg-surface-container-low"
                          >
                            <div className="flex items-center gap-2">
                              <Icon
                                className="w-4 h-4 text-on-surface-variant"
                                strokeWidth={1.5}
                              />
                              {label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-error text-xs" />
                  </FormItem>
                )}
              />

              {/* Deskripsi */}
              <FormField
                control={form.control}
                name="deskripsi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Catatan / Pesan{" "}
                      <span className="normal-case text-outline font-normal tracking-normal">
                        (Opsional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Pesan dari donatur atau catatan pengurus..."
                        rows={3}
                        className="bg-surface-container-low border-0 border-b-2 border-outline-variant rounded-t-lg rounded-b-none focus-visible:ring-0 focus-visible:border-primary transition-colors placeholder:text-outline resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-error text-xs" />
                  </FormItem>
                )}
              />

              {/* Bukti Pembayaran */}
              <FormItem>
                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Bukti Pembayaran{" "}
                  <span className="normal-case text-outline font-normal tracking-normal">
                    {isEdit ? "(Opsional)" : "(Wajib)"}
                  </span>
                </FormLabel>
                <FormControl>
                  <label className="flex items-center gap-3 w-full bg-surface-container-low border-b-2 border-outline-variant rounded-t-lg px-4 py-3 cursor-pointer hover:border-primary transition-colors group">
                    <UploadCloud
                      className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors shrink-0"
                      strokeWidth={1.5}
                    />
                    <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors truncate">
                      {selectedFile
                        ? selectedFile.name
                        : "Klik untuk upload bukti pembayaran..."}
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            toast.error("Ukuran file bukti pembayaran maksimal 2MB");
                            e.target.value = "";
                            return;
                          }
                          setSelectedFile(file);
                        }
                      }}
                    />
                  </label>
                </FormControl>
                <p className="text-xs text-on-surface-variant mt-1.5">
                  Format PNG, JPG, atau PDF — maks. 2 MB
                </p>
                {form.formState.errors.bukti_pembayaran && (
                  <p className="text-xs text-error mt-1">
                    {form.formState.errors.bukti_pembayaran.message as string}
                  </p>
                )}
              </FormItem>
            </div>

            {/* Footer */}
            <DialogFooter className="px-8 py-6 bg-surface-container-low grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="rounded-xl bg-gradient-to-br from-primary to-primary-container text-white font-bold shadow-lg hover:opacity-90 transition-opacity"
              >
                {form.formState.isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </span>
                ) : (
                  "Simpan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
