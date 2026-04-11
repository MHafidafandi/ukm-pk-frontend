import { z } from "zod";

export const createDonationSchema = z.object({
  nama_donatur: z.string().min(1, "Nama donatur wajib diisi"),
  jumlah: z.coerce.number().min(1000, "Jumlah minimal Rp 1.000"),
  metode: z.enum(["bank_transfer", "cash", "e_wallet", "qris", "other"]),
  deskripsi: z.string().optional(),
  tanggal: z.string().min(1, "Tanggal donasi wajib diisi"),
  bukti_pembayaran: z.any().optional(),
});

export type CreateDonationInput = z.infer<typeof createDonationSchema>;

export const UpdateDonationSchema = createDonationSchema.partial();
export type UpdateDonationInput = z.infer<typeof UpdateDonationSchema>;

export type DonationSchema = z.infer<typeof createDonationSchema>;
