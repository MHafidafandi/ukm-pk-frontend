/**
 * Donation API — pure API calls
 */
import { api } from "@/lib/api/client";
import { CreateDonationInput, Donation, DonationStats } from "../types";

const BASE_URL = "/donations";

export const getDonations = (): Promise<{ data: Donation[] }> => {
  return api.get(BASE_URL);
};

export const getDonation = (id: string): Promise<{ data: Donation }> => {
  return api.get(`${BASE_URL}/${id}`);
};

export const createDonation = (
  data: CreateDonationInput,
): Promise<{ data: Donation }> => {
  return api.post(BASE_URL, data);
};

export const updateDonation = (
  id: string,
  data: Partial<CreateDonationInput> & { status?: string },
): Promise<{ data: Donation }> => {
  return api.put(`${BASE_URL}/${id}`, data);
};

export const deleteDonation = (id: string): Promise<void> => {
  return api.delete(`${BASE_URL}/${id}`);
};

export const uploadProof = (
  id: string,
  file: File,
): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post(`${BASE_URL}/${id}/proof`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getDonationStats = (): Promise<{ data: DonationStats }> => {
  return api.get(`${BASE_URL}/stats`);
};
