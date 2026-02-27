"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getDonations,
  getDonationStats,
  createDonation,
  updateDonation,
  deleteDonation,
  uploadProof,
  Donation,
  DonationStats,
  CreateDonationInput,
} from "@/features/donation/services/donationService";
import { getErrorMessage } from "@/lib/api/client";

interface DonationContextType {
  donations: { data: Donation[] } | undefined;
  stats: { data: DonationStats } | undefined;
  isLoadingDonations: boolean;
  isLoadingStats: boolean;

  createDonation: (data: CreateDonationInput) => Promise<any>;
  updateDonation: (args: {
    id: string;
    data: Partial<CreateDonationInput> & { status?: string };
  }) => Promise<any>;
  deleteDonation: (id: string) => Promise<any>;
  uploadProof: (args: { id: string; file: File }) => Promise<any>;
}

const DonationContext = createContext<DonationContextType | undefined>(
  undefined,
);

export const useDonationContext = () => {
  const context = useContext(DonationContext);
  if (!context) {
    throw new Error("useDonationContext must be used within DonationProvider");
  }
  return context;
};

export const DonationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const queryClient = useQueryClient();

  const { data: donations, isLoading: isLoadingDonations } = useQuery({
    queryKey: ["donations", "list"],
    queryFn: getDonations,
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["donations", "stats"],
    queryFn: getDonationStats,
  });

  const createDonationMutation = useMutation({
    mutationFn: createDonation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      toast.success("Donasi berhasil dicatat");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  const updateDonationMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateDonationInput> & { status?: string };
    }) => updateDonation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      toast.success("Donasi berhasil diperbarui");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  const deleteDonationMutation = useMutation({
    mutationFn: deleteDonation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      toast.success("Donasi berhasil dihapus");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  const uploadProofMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      uploadProof(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      toast.success("Bukti pembayaran berhasil diupload");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  const contextValue = useMemo(
    () => ({
      donations,
      stats,
      isLoadingDonations,
      isLoadingStats,

      createDonation: createDonationMutation.mutateAsync,
      updateDonation: updateDonationMutation.mutateAsync,
      deleteDonation: deleteDonationMutation.mutateAsync,
      uploadProof: uploadProofMutation.mutateAsync,
    }),
    [
      donations,
      stats,
      isLoadingDonations,
      isLoadingStats,
      createDonationMutation,
      updateDonationMutation,
      deleteDonationMutation,
      uploadProofMutation,
    ],
  );

  return (
    <DonationContext.Provider value={contextValue}>
      {children}
    </DonationContext.Provider>
  );
};
