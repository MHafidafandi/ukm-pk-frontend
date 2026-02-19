/**
 * Inventory Feature Types
 */
import { User } from "@/contexts/AuthContext";

export type AssetCondition =
  | "baik"
  | "rusak_ringan"
  | "rusak_berat"
  | "hilang"
  | "dipinjam"
  | "dalam_perbaikan";

export type LoanStatus =
  | "dipinjam"
  | "dikembalikan"
  | "hilang"
  | "rusak"
  | "terlambat";

export interface Asset {
  id: string;
  nama: string;
  judul?: string; // bazcamp compatibility
  kode: string;
  deskripsi: string;
  lokasi: string;
  jumlah: number;
  available: number;
  tanggal: string; // Tanggal perolehan
  kondisi: AssetCondition;
  foto_url: string;
  loans?: Loan[];
  created_at: string;
  updated_at: string;
}

export interface Loan {
  id: string;
  asset_id: string;
  user_id: string;
  tanggal_pinjam: string;
  tanggal_kembali?: string;
  status: LoanStatus;
  catatan?: string;
  asset?: Pick<Asset, "id" | "nama" | "kode">;
  user?: Pick<User, "id" | "name" | "username" | "email">;
  created_at: string;
  updated_at: string;
}

export interface CreateAssetInput {
  nama: string;
  kode: string;
  deskripsi?: string;
  lokasi: string;
  jumlah: number;
  tanggal: string;
  kondisi: AssetCondition;
  // foto di-upload terpisah
}

export interface CreateLoanInput {
  asset_id: string;
  user_id: string;
  tanggal_pinjam: string;
  catatan?: string;
}
