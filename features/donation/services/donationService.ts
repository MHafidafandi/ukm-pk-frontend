import { api } from "@/lib/api/client";
import { objectToFormData } from "@/lib/utils";
import axios from "axios";
import { env } from "@/configs/env";
import { UpdateDonationInput } from "@/lib/validations/donation-schema";
import { CreateDonationInput } from "@/lib/validations/donation-schema";

// ── Types ──────────────────────────────────────────────────────────────────

export type DonationStatus = "pending" | "verified" | "rejected" | "canceled";
export type DonationMethod =
  | "bank_transfer"
  | "cash"
  | "e_wallet"
  | "qris"
  | "other"
  | "Transfer Bank"
  | "Tunai"
  | "E-Wallet"
  | "QRIS"
  | "Other";

export interface Donation {
  id: string;
  nama_donatur: string;
  jumlah: number;
  tanggal: string; // ISO 8601 date string
  metode: DonationMethod;
  deskripsi?: string;
  status: DonationStatus;
  bukti_pembayaran?: string; // URL to image/file
  catatan?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export type CreateDonationPayload = CreateDonationInput;
export type { CreateDonationInput };

export interface DonationStats {
  total_donations: number;
  total_amount: number;
  verified_amount: number;
  pending_amount: number;
  rejected_amount: number;
  monthly_breakdown: Array<{
    month: string;
    year: number;
    amount: number;
    count: number;
  }>;
  status_summary: Array<{
    status: string;
    count: number;
    amount: number;
  }>;
  method_summary: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
}

export type DonationParams = {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "ASC" | "DESC";
  status?: string;
  metode?: string;
  start_date?: string;
  end_date?: string;
};

export interface PaginationMeta {
  total: number;
  page: number;
  total_pages: number;
  page_size: number;
  has_next?: boolean;
  has_previous?: boolean;
}

// ── API Functions ──────────────────────────────────────────────────────────

const BASE_URL = "/donations";
const publicApi = axios.create({
  baseURL: env.API_URL,
  withCredentials: false,
});

export async function getDonations(
  params?: DonationParams,
): Promise<{ data: { donations: Donation[]; pagination: PaginationMeta } }> {
  return api.get(BASE_URL, { params });
}

export async function getDonation(id: string): Promise<{ data: Donation }> {
  return api.get(`${BASE_URL}/${id}`);
}

export async function createDonation(
  body: CreateDonationPayload | FormData,
): Promise<{ message: string }> {
  const payload = body instanceof FormData ? body : objectToFormData(body);
  const response = await publicApi.post(BASE_URL, payload, {
    headers: {
      "Content-Type": undefined,
      Authorization: undefined,
    },
  });
  return response.data;
}

export async function deleteDonation(id: string): Promise<{ message: string }> {
  return api.delete(`${BASE_URL}/${id}`);
}

export async function updateDonation(
  id: string,
  body: UpdateDonationInput | FormData,
): Promise<{ message: string }> {
  const payload = body instanceof FormData ? body : objectToFormData(body);
  return api.put(`${BASE_URL}/${id}`, payload, {
    headers: {
      "Content-Type": undefined,
    },
  });
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
  return response.data;
}

export async function getDonationStats(): Promise<{ data: DonationStats }> {
  return api.get(`${BASE_URL}/statistics/summary`);
}

export async function verifyDonation(
  id: string,
  payload: { catatan?: string },
): Promise<{ message: string }> {
  return api.patch(`${BASE_URL}/${id}/verify`, payload);
}

export async function rejectDonation(
  id: string,
  payload: { catatan: string },
): Promise<{ message: string }> {
  return api.patch(`${BASE_URL}/${id}/reject`, payload);
}

export async function cancelDonation(id: string): Promise<{ message: string }> {
  return api.patch(`${BASE_URL}/${id}/cancel`);
}

export async function bulkVerifyDonations(payload: {
  donation_ids: string[];
  catatan?: string;
}): Promise<{ message: string }> {
  return api.post(`${BASE_URL}/bulk/verify`, payload);
}

export async function bulkRejectDonations(payload: {
  donation_ids: string[];
  catatan: string;
}): Promise<{ message: string }> {
  return api.post(`${BASE_URL}/bulk/reject`, payload);
}

export async function getDonationReport(params: {
  start_date: string;
  end_date: string;
}): Promise<{ data: DonationStats }> {
  return api.get(`${BASE_URL}/statistics/report`, { params });
}

export async function getDonationMonthly(params: { year: number }): Promise<{
  data: Array<{ month: string; year: number; amount: number; count: number }>;
}> {
  return api.get(`${BASE_URL}/statistics/monthly`, { params });
}
