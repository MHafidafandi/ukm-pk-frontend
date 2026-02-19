/**
 * Inventory API — pure API calls
 */
import { api } from "@/lib/api/client";
import { Asset, CreateAssetInput, CreateLoanInput, Loan } from "../types";

const ASSET_URL = "/inventory/assets";
const LOAN_URL = "/inventory/loans";

// ── Assets ─────────────────────────────────────────────────────────────────

export const getAssets = (): Promise<{ data: Asset[] }> => {
  return api.get(ASSET_URL);
};

export const getAsset = (id: string): Promise<{ data: Asset }> => {
  return api.get(`${ASSET_URL}/${id}`);
};

export const createAsset = (
  data: CreateAssetInput,
): Promise<{ data: Asset }> => {
  return api.post(ASSET_URL, data);
};

export const updateAsset = (
  id: string,
  data: Partial<CreateAssetInput>,
): Promise<{ data: Asset }> => {
  return api.put(`${ASSET_URL}/${id}`, data);
};

export const deleteAsset = (id: string): Promise<void> => {
  return api.delete(`${ASSET_URL}/${id}`);
};

export const uploadAssetImage = (
  id: string,
  file: File,
): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post(`${ASSET_URL}/${id}/image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// ── Loans ──────────────────────────────────────────────────────────────────

export const getLoans = (): Promise<{ data: Loan[] }> => {
  return api.get(LOAN_URL);
};

export const createLoan = (data: CreateLoanInput): Promise<{ data: Loan }> => {
  return api.post(LOAN_URL, data);
};

export const returnLoan = (
  id: string,
  data: { tanggal_kembali: string; kondisi_akhir?: string; catatan?: string },
): Promise<{ data: Loan }> => {
  return api.post(`${LOAN_URL}/${id}/return`, data);
};
