"use client";

import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
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
  PaginationMeta,
} from "@/features/donation/services/donationService";
import { getErrorMessage } from "@/lib/api/client";

interface DonationContextType {
  donations: Donation[];
  stats: { data: DonationStats } | undefined;
  isLoadingDonations: boolean;
  isLoadingStats: boolean;
  pagination: PaginationMeta | null;
  page: number;
  setPage: (p: number) => void; searchQuery: string;
  setSearchQuery: (val: string) => void;
  activeFilter: string;
  setActiveFilter: (val: string) => void;

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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [debounceSearch] = useDebounce(searchQuery, 500);

  const { data: donationsData, isLoading: isLoadingDonations } = useQuery({
    queryKey: ["donations", "list", page, limit, debounceSearch, activeFilter],
    queryFn: () => getDonations({
      page,
      limit,
      search: debounceSearch || undefined,
      status: activeFilter !== "all" ? activeFilter : undefined,
    }),
    placeholderData: keepPreviousData,
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["donations", "stats"],
    queryFn: getDonationStats,
  });

  const donations = donationsData?.data?.donations || [];
  const pagination = donationsData?.data?.pagination || null;

  const createDonationMutation = useMutation({
    mutationFn: createDonation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
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
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  const deleteDonationMutation = useMutation({
    mutationFn: deleteDonation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
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
      pagination,
      page,
      setPage,
      limit,
      searchQuery,
      setSearchQuery,
      activeFilter,
      setActiveFilter,

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
      pagination,
      page,
      setPage,
      limit,
      searchQuery,
      activeFilter,
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
