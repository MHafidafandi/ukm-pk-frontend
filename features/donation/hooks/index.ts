/**
 * Donation Hooks — React Query
 */
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createDonation,
  deleteDonation,
  getDonations,
  getDonationStats,
  updateDonation,
  uploadProof,
} from "../api";
import { CreateDonationInput } from "../types";
import { getErrorMessage } from "@/lib/api/client";

// ── Query Keys ─────────────────────────────────────────────────────────────

export const donationKeys = {
  all: ["donations"] as const,
  lists: () => [...donationKeys.all, "list"] as const,
  detail: (id: string) => [...donationKeys.all, "detail", id] as const,
  stats: () => [...donationKeys.all, "stats"] as const,
};

// ── Queries ────────────────────────────────────────────────────────────────

export const getDonationsQueryOptions = () => {
  return queryOptions({
    queryKey: donationKeys.lists(),
    queryFn: getDonations,
  });
};

export const useDonations = () => useQuery(getDonationsQueryOptions());

export const useDonationStats = () =>
  useQuery({
    queryKey: donationKeys.stats(),
    queryFn: getDonationStats,
  });

// ── Mutations ──────────────────────────────────────────────────────────────

export const useCreateDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDonation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: donationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: donationKeys.stats() });
      toast.success("Donasi berhasil dicatat");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateDonationInput> & { status?: string };
    }) => updateDonation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: donationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: donationKeys.stats() });
      toast.success("Donasi berhasil diperbarui");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDeleteDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDonation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: donationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: donationKeys.stats() });
      toast.success("Donasi berhasil dihapus");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUploadProof = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      uploadProof(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: donationKeys.lists() });
      toast.success("Bukti pembayaran berhasil diupload");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};
