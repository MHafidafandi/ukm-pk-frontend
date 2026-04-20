"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import {
  getDonations,
  getDonationStats,
  createDonation,
  updateDonation,
  deleteDonation,
  uploadProof,
  verifyDonation,
  rejectDonation,
  cancelDonation,
  bulkVerifyDonations,
  bulkRejectDonations,
  Donation,
  DonationStats,
  CreateDonationPayload,
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
  setPage: (p: number) => void;
  sort: string;
  setSort: (s: string) => void;
  order: "ASC" | "DESC";
  setOrder: (o: "ASC" | "DESC") => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  activeFilter: string;
  setActiveFilter: (val: string) => void;
  methodFilter: string;
  setMethodFilter: (val: string) => void;
  startDateFilter: string;
  setStartDateFilter: (val: string) => void;
  endDateFilter: string;
  setEndDateFilter: (val: string) => void;

  createDonation: (data: CreateDonationPayload | FormData) => Promise<unknown>;
  updateDonation: (args: { id: string; data: FormData }) => Promise<unknown>;
  deleteDonation: (id: string) => Promise<unknown>;
  uploadProof: (args: { id: string; file: File }) => Promise<unknown>;
  verifyDonation: (args: { id: string; catatan?: string }) => Promise<unknown>;
  rejectDonation: (args: { id: string; catatan: string }) => Promise<unknown>;
  cancelDonation: (id: string) => Promise<unknown>;
  bulkVerifyDonations: (args: {
    donation_ids: string[];
    catatan?: string;
  }) => Promise<unknown>;
  bulkRejectDonations: (args: {
    donation_ids: string[];
    catatan: string;
  }) => Promise<unknown>;
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
  const [methodFilter, setMethodFilter] = useState("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sort, setSortRaw] = useState("created_at");
  const [order, setOrderRaw] = useState<"ASC" | "DESC">("DESC");
  const [debounceSearch] = useDebounce(searchQuery, 500);

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleActiveFilterChange = (value: string) => {
    setActiveFilter(value);
    setPage(1);
  };

  const handleMethodFilterChange = (value: string) => {
    setMethodFilter(value);
    setPage(1);
  };

  const handleStartDateFilterChange = (value: string) => {
    setStartDateFilter(value);
    setPage(1);
  };

  const handleEndDateFilterChange = (value: string) => {
    setEndDateFilter(value);
    setPage(1);
  };
  const handleSortChange = (value: string) => {
    setSortRaw(value);
    setPage(1);
  };
  const handleOrderChange = (value: "ASC" | "DESC") => {
    setOrderRaw(value);
    setPage(1);
  };

  const { data: donationsData, isLoading: isLoadingDonations } = useQuery({
    queryKey: [
      "donations",
      "list",
      page,
      limit,
      debounceSearch,
      sort,
      order,
      activeFilter,
      methodFilter,
      startDateFilter,
      endDateFilter,
    ],
    queryFn: () =>
      getDonations({
        page,
        limit,
        search: debounceSearch || undefined,
        sort: sort || undefined,
        order,
        status: activeFilter !== "all" ? activeFilter : undefined,
        metode: methodFilter !== "all" ? methodFilter : undefined,
        start_date: startDateFilter || undefined,
        end_date: endDateFilter || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["donations", "stats"],
    queryFn: getDonationStats,
  });

  const donations = useMemo(
    () => donationsData?.data?.donations || [],
    [donationsData],
  );
  const pagination = useMemo(
    () => donationsData?.data?.pagination || null,
    [donationsData],
  );

  const createDonationMutation = useMutation({
    mutationFn: createDonation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });

  const updateDonationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      updateDonation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });

  const deleteDonationMutation = useMutation({
    mutationFn: deleteDonation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
    },
    onError: (error: unknown) => {
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
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });

  const verifyDonationMutation = useMutation({
    mutationFn: ({ id, catatan }: { id: string; catatan?: string }) =>
      verifyDonation(id, { catatan }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });

  const rejectDonationMutation = useMutation({
    mutationFn: ({ id, catatan }: { id: string; catatan: string }) =>
      rejectDonation(id, { catatan }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });

  const cancelDonationMutation = useMutation({
    mutationFn: (id: string) => cancelDonation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });

  const bulkVerifyMutation = useMutation({
    mutationFn: (data: { donation_ids: string[]; catatan?: string }) =>
      bulkVerifyDonations(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });

  const bulkRejectMutation = useMutation({
    mutationFn: (data: { donation_ids: string[]; catatan: string }) =>
      bulkRejectDonations(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
    },
    onError: (error: unknown) => {
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
      sort,
      setSort: handleSortChange,
      order,
      setOrder: handleOrderChange,
      searchQuery,
      setSearchQuery: handleSearchQueryChange,
      activeFilter,
      setActiveFilter: handleActiveFilterChange,
      methodFilter,
      setMethodFilter: handleMethodFilterChange,
      startDateFilter,
      setStartDateFilter: handleStartDateFilterChange,
      endDateFilter,
      setEndDateFilter: handleEndDateFilterChange,

      createDonation: createDonationMutation.mutateAsync,
      updateDonation: updateDonationMutation.mutateAsync,
      deleteDonation: deleteDonationMutation.mutateAsync,
      uploadProof: uploadProofMutation.mutateAsync,
      verifyDonation: verifyDonationMutation.mutateAsync,
      rejectDonation: rejectDonationMutation.mutateAsync,
      cancelDonation: cancelDonationMutation.mutateAsync,
      bulkVerifyDonations: bulkVerifyMutation.mutateAsync,
      bulkRejectDonations: bulkRejectMutation.mutateAsync,
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
      sort,
      searchQuery,
      order,
      activeFilter,
      methodFilter,
      startDateFilter,
      endDateFilter,
      createDonationMutation,
      updateDonationMutation,
      deleteDonationMutation,
      uploadProofMutation,
      verifyDonationMutation,
      rejectDonationMutation,
      cancelDonationMutation,
      bulkVerifyMutation,
      bulkRejectMutation,
    ],
  );

  return (
    <DonationContext.Provider value={contextValue}>
      {children}
    </DonationContext.Provider>
  );
};
