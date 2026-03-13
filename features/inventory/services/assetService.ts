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
  judul?: string;
  kode: string;
  deskripsi: string;
  lokasi: string;
  jumlah: number;
  available: number;
  tanggal: string;
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
  judul?: string;
  deskripsi?: string;
  lokasi: string;
  jumlah: number;
  kondisi: AssetCondition;
  foto?: File;
}

export interface CreateLoanInput {
  asset_id: string;
  user_id: string;
  tanggal_pinjam: string;
  catatan?: string;
}

export interface AssetFilters {
  page?: number;
  limit?: number;
  kondisi?: string;
  lokasi?: string;
  search?: string;
  sort?: string;
  order?: string;
}

export interface LoanFilters {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  total_pages: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface AssetsResponse {
  data: {
    assets: Asset[];
    pagination: PaginationMeta;
    filters: Record<string, any>;
  };
}

export interface LoansResponse {
  data: {
    loans: Loan[];
    pagination: PaginationMeta;
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** NOTE: Kalau base URL di api client kamu sudah include "/api/v1",
 *  ganti PREFIX jadi "" (string kosong). */
const PREFIX = "/api/v1";

function buildParams(filters?: Record<string, any>): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// ── Assets API ─────────────────────────────────────────────────────────────

/** GET /assets?page=1&limit=10&kondisi=...&search=... */
export async function getAssets(filters?: AssetFilters): Promise<AssetsResponse> {
  const data = await api.get(`/assets${buildParams(filters)}`);
  return data as any;
}

/** GET /assets/:id */
export async function getAsset(id: string): Promise<{ data: Asset }> {
  const data = await api.get(`/assets/${id}`);
  return data as any;
}

/** GET /assets/code/:code */
export async function getAssetByCode(code: string): Promise<{ data: Asset }> {
  const data = await api.get(`/assets/code/${code}`);
  return data as any;
}

/** GET /assets/available */
export async function getAvailableAssets(): Promise<AssetsResponse> {
  const data = await api.get(`/assets/available`);
  return data as any;
}

/** GET /assets/condition/:condition */
export async function getAssetsByCondition(
  condition: AssetCondition,
): Promise<AssetsResponse> {
  const data = await api.get(`/assets/condition/${condition}`);
  return data as any;
}

/** POST /assets  (form-data) */
export async function createAsset(
  body: CreateAssetInput | FormData,
): Promise<{ data: Asset }> {
  const payload = body instanceof FormData ? body : objectToFormData(body);
  const { data } = await api.post("/assets", payload, {
    headers: {
      "Content-Type": undefined,
    },
  });
  return data;
}

/** PUT /assets/:id  (form-data) */
export async function updateAsset(
  id: string,
  body: Partial<CreateAssetInput> | FormData,
): Promise<{ data: Asset }> {
  const payload = body instanceof FormData ? body : objectToFormData(body);
  const data = await api.put(`/assets/${id}`, payload, {
    headers: {
      "Content-Type": undefined,
    },
  });
  return data as any;
}

/** PUT /assets/:id/condition */
export async function updateAssetCondition(
  id: string,
  body: { kondisi: AssetCondition; catatan?: string },
): Promise<{ data: Asset }> {
  const data = await api.put(`/assets/${id}/condition`, body);
  return data as any;
}

/** DELETE /assets/:id */
export async function deleteAsset(id: string): Promise<void> {
  await api.delete(`/assets/${id}`);
}

/** POST /assets/:id/image  (file upload) */
export async function uploadAssetImage(
  id: string,
  file: File,
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const data = await api.post(`/assets/${id}/image`, formData, {
    headers: { "Content-Type": undefined },
  });
  return data as any;
}

// ── Loans API ──────────────────────────────────────────────────────────────

/** GET /loans?page=1&limit=10 */
export async function getLoans(filters?: LoanFilters): Promise<LoansResponse> {
  const data = await api.get(`/loans${buildParams(filters)}`);
  return data as any;
}

/** GET /loans/:id */
export async function getLoan(id: string): Promise<{ data: Loan }> {
  const data = await api.get(`/loans/${id}`);
  return data as any;
}

/** POST /loans */
export async function createLoan(
  body: CreateLoanInput,
): Promise<{ data: Loan }> {
  const data = await api.post(`/loans`, body);
  return data as any;
}

/** POST /loans/:id/return */
export async function returnLoan(
  id: string,
  body: { tanggal_kembali: string; kondisi?: AssetCondition; catatan?: string },
): Promise<{ data: Loan }> {
  const data = await api.post(`/loans/${id}/return`, body);
  return data as any;
}

/** POST /loans/:id/mark-lost */
export async function markLoanAsLost(
  id: string,
  body: { catatan: string }
): Promise<{ data: Loan }> {
  const data = await api.post(`/loans/${id}/mark-lost`, body);
  return data as any;
}

/** GET /loans/user/:userId */
export async function getUserLoans(userId: string): Promise<LoansResponse> {
  const data = await api.get(`/loans/user/${userId}`);
  return data as any;
}

/** GET /loans/asset/:assetId */
export async function getAssetLoans(assetId: string): Promise<LoansResponse> {
  const data = await api.get(`/loans/asset/${assetId}`);
  return data as any;
}

/** GET /loans/active */
export async function getActiveLoans(): Promise<LoansResponse> {
  const data = await api.get(`/loans/active`);
  return data as any;
}

/** GET /loans/overdue */
export async function getOverdueLoans(): Promise<LoansResponse> {
  const data = await api.get(`/loans/overdue`);
  return data as any;
}

/** GET /loans/statistics/summary */
export async function getLoanStatistics(): Promise<{ data: any }> {
  const data = await api.get(`/loans/statistics/summary`);
  return data as any;
}