/**
 * Donation Feature Types
 */

export type DonationStatus = "pending" | "verified" | "rejected" | "canceled";
export type DonationMethod =
  | "bank_transfer"
  | "cash"
  | "e_wallet"
  | "qris"
  | "other";

export interface Donation {
  id: string;
  nama_donatur: string;
  jumlah: number;
  tanggal: string; // ISO 8601 date string
  metode: DonationMethod;
  deskripsi: string;
  status: DonationStatus;
  bukti_pembayaran: string; // URL to image/file
  created_at: string;
  updated_at: string;
}

export interface CreateDonationInput {
  nama_donatur: string;
  jumlah: number;
  metode: DonationMethod;
  deskripsi: string;
  status?: DonationStatus;
  // Bukti pembayaran di-upload terpisah atau via multipart
  // Untuk data input, kita asumsikan file di-handle terpisah
}

export interface DonationStats {
  total_donations: number;
  total_amount: number;
  pending_amount: number;
  verified_amount: number;
}
