import { api } from "@/lib/api/client";
import { objectToFormData } from "@/lib/utils";
import { UpdateDonationInput } from "@/lib/validations/donation-schema";

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

export type DonationParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

export interface PaginationMeta {
  total: number;
  page: number;
  total_pages: number;
  page_size: number;
}

// ── API Functions ──────────────────────────────────────────────────────────

const BASE_URL = "/donations";

export async function getDonations(
  params?: DonationParams,
): Promise<{ data: { donations: Donation[]; pagination: PaginationMeta } }> {
  const data = await api.get("/donations", { params });
  return data;
}

export async function getDonation(id: string): Promise<{ data: Donation }> {
  const data = await api.get(`/donations/${id}`);
  return data;
}

// export async function uploadProof(
//   id: string,
//   file: File,
// ): Promise<{ url: string }> {
//   const formData = new FormData();
//   formData.append("file", file);
//   const response = (await api.post(`${BASE_URL}/${id}/proof`, formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   })) as any;
//   return response.data; // assuming API returns { data: { url: "..." } } => response.data has { url }
// }

export async function createDonation(
  body: CreateDonationInput | FormData,
): Promise<{ message: string; id?: string }> {
  const payload = body instanceof FormData ? body : objectToFormData(body);
  const { data } = await api.post("/donations", payload, {
    headers: {
      "Content-Type": undefined,
    },
  });
  return data;
}

export async function deleteDonation(id: string): Promise<{ message: string }> {
  const { data } = await api.delete(`/donations/${id}`);
  return data;
}

export async function updateDonation(
  id: string,
  body: UpdateDonationInput | FormData,
): Promise<{ message: string; id?: string }> {
  const payload = body instanceof FormData ? body : objectToFormData(body);
  const { data } = await api.put(`/donations/${id}`, payload, {
    headers: {
      "Content-Type": undefined,
    },
  });
  return data;
}


export async function uploadProof(
  id: string,
  file: File,
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const response = (await api.post(`${BASE_URL}/${id}/proof`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })) as any;
  return response.data; // assuming API returns { data: { url: "..." } } => response.data has { url }
}

export async function getDonationStats(): Promise<{ data: DonationStats }> {
  const response = (await api.get(`${BASE_URL}/statistics/summary`)) as any;
  return { data: response.data };
}
