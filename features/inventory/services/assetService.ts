import { api } from "@/lib/api/client";
import { User } from "@/features/auth/contexts/AuthContext";
import { objectToFormData } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

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
  user?: Pick<User, "id" | "nama" | "username" | "email">;
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

// ── Assets API ─────────────────────────────────────────────────────────────

export async function getAssets(): Promise<{ data: Asset[] }> {
  const { data } = await api.get("/inventory/assets");
  return data;
}

export async function getAsset(id: string): Promise<{ data: Asset }> {
  const { data } = await api.get(`/inventory/assets/${id}`);
  return data;
}

export async function createAsset(
  body: CreateAssetInput | FormData,
): Promise<{ data: Asset }> {
  const payload = body instanceof FormData ? body : objectToFormData(body);
  const { data } = await api.post("/inventory/assets", payload);
  return data;
}

export async function updateAsset(
  id: string,
  body: Partial<CreateAssetInput> | FormData,
): Promise<{ data: Asset }> {
  const payload = body instanceof FormData ? body : objectToFormData(body);
  const { data } = await api.put(`/inventory/assets/${id}`, payload);
  return data;
}

export async function deleteAsset(id: string): Promise<void> {
  await api.delete(`/inventory/assets/${id}`);
}

export async function uploadAssetImage(
  id: string,
  file: File,
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post(`/inventory/assets/${id}/image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
}

// ── Loans API ──────────────────────────────────────────────────────────────

export async function getLoans(): Promise<{ data: Loan[] }> {
  const { data } = await api.get("/inventory/loans");
  return data;
}

export async function createLoan(
  body: CreateLoanInput,
): Promise<{ data: Loan }> {
  const { data } = await api.post("/inventory/loans", body);
  return data;
}

export async function returnLoan(
  id: string,
  body: { tanggal_kembali: string; kondisi_akhir?: string; catatan?: string },
): Promise<{ data: Loan }> {
  const { data } = await api.post(`/inventory/loans/${id}/return`, body);
  return data;
}
