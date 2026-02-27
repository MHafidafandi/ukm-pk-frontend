import { api } from "@/lib/api/client";
import { objectToFormData } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

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

// ── API Functions ──────────────────────────────────────────────────────────

const BASE_URL = "/donations";

export async function getDonations(): Promise<{ data: Donation[] }> {
  const { data } = await api.get(BASE_URL);
  return data;
}

export async function getDonation(id: string): Promise<{ data: Donation }> {
  const { data } = await api.get(`${BASE_URL}/${id}`);
  return data;
}

export async function createDonation(
  body: CreateDonationInput | FormData,
): Promise<{ data: Donation }> {
  const payload = body instanceof FormData ? body : objectToFormData(body);
  const { data } = await api.post(BASE_URL, payload);
  return data;
}

export async function updateDonation(
  id: string,
  body: (Partial<CreateDonationInput> & { status?: string }) | FormData,
): Promise<{ data: Donation }> {
  const payload = body instanceof FormData ? body : objectToFormData(body);
  const { data } = await api.put(`${BASE_URL}/${id}`, payload);
  return data;
}

export async function deleteDonation(id: string): Promise<void> {
  await api.delete(`${BASE_URL}/${id}`);
}

export async function uploadProof(
  id: string,
  file: File,
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post(`${BASE_URL}/${id}/proof`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
}

export async function getDonationStats(): Promise<{ data: DonationStats }> {
  const { data } = await api.get(`${BASE_URL}/stats`);
  return data;
}
