"use client";
import React, { createContext, useContext, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAssets,
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset,
  getLoans,
  createLoan,
  returnLoan,
  markLoanAsLost,
  Asset,
  Loan,
  CreateAssetInput,
  CreateLoanInput,
  getAssetStats,
  AssetsResponse,
  AssetsStatsResponse,
  AssetFilters,
  getAvailableAssets,
  getLoanStats,
  getActiveLoans,
  getOverdueLoans,
} from "@/features/inventory/services/assetService";
import { getErrorMessage } from "@/lib/api/client";
import { getUserById } from "@/features/users/services/userService";

interface AssetContextType {
  isFetchingAssets: boolean;
  assets: AssetsResponse["data"]["assets"];
  pagination: AssetsResponse["data"]["pagination"] | null;
  filters: AssetsResponse["data"]["filters"] | null;
  stats: AssetsStatsResponse["data"] | null;
  setFilters: (filters: AssetFilters) => void;
  createAsset: (data: CreateAssetInput) => Promise<any>;
  updateAsset: (args: {
    id: string;
    data: Partial<CreateAssetInput>;
  }) => Promise<any>;
  deleteAsset: (id: string) => Promise<any>;
  loans: Loan[];
  loanStatsData: any;
  isFetchingLoanStats: boolean;
  availableAssets: Asset[];
  isFetchingLoans: boolean;
  activeLoans: Loan[];
  overdueLoans: Loan[];
  createLoan: (data: CreateLoanInput) => Promise<any>;
  returnLoan: (args: { id: string; data: any }) => Promise<any>;
  markLoanAsLost: (args: { id: string; catatan: string }) => Promise<any>;
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export const useAssetContext = () => {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error("useAssetContext must be used within AssetProvider");
  }
  return context;
};

export const AssetProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<AssetFilters>({
    page: 1,
    limit: 10,
  });
  const { data: assetsData, isLoading: isFetchingAssets } = useQuery({
    queryKey: ["inventory", "assets", filters],
    queryFn: () => getAssets(filters),
  });

  const { data: availableAssetsData, isLoading: isFetchingAvailableAssets } = useQuery({
    queryKey: ["inventory", "assets"],
    queryFn: () => getAvailableAssets(),
  });

  const { data: statsData, isLoading: isFetchingStats } = useQuery({
    queryKey: ["inventory", "assets", "stats"],
    queryFn: () => getAssetStats(),
  });

  const { data: loanStatsData, isLoading: isFetchingLoanStats } = useQuery({
    queryKey: ["inventory", "loans", "stats"],
    queryFn: () => getLoanStats(),
  });

  const { data: activeLoans } = useQuery({
    queryKey: ["loans", "active"],
    queryFn: async () => {
      const res = await getActiveLoans();
      return await Promise.all(
        res.data.loans.map(async (loan) => {
          const [user, asset] = await Promise.all([
            getUserById(loan.user_id),
            getAsset(loan.asset_id)
          ]);
          return { ...loan, user: user.data, asset: asset.data };
        })
      );
    },
  });
  const { data: overdueLoans } = useQuery({
    queryKey: ["loans", "overdue"],
    queryFn: async () => {
      const res = await getOverdueLoans();
      return await Promise.all(
        res.data.loans.map(async (loan) => {
          const [user, asset] = await Promise.all([
            getUserById(loan.user_id),
            getAsset(loan.asset_id)
          ]);
          return { ...loan, user: user.data, asset: asset.data };
        })
      );
    },
  });



  // ── Loans Query + map user & asset
  const { data: loans, isLoading: isFetchingLoans } = useQuery({
    queryKey: ["inventory", "loans"],
<<<<<<< HEAD
    queryFn: async () => {
      const loansResponse = await getLoans();
      return await Promise.all(
        loansResponse.data.loans.map(async (loan) => {
          const [user, asset] = await Promise.all([
            getUserById(loan.user_id),
            getAsset(loan.asset_id)
          ]);
          return { ...loan, user: user.data, asset: asset.data };
        })
      );
    },
=======
    queryFn: () => getLoans(),
>>>>>>> d1006d5a3f81168775557fa0498b538d3dcbbd83
  });

  const assets = assetsData?.data?.assets || [];
  const pagination = assetsData?.data?.pagination || null;
<<<<<<< HEAD
  const availableAssets = availableAssetsData?.data?.assets || [];
=======
  const loans = loansData?.data?.loans || [];
>>>>>>> d1006d5a3f81168775557fa0498b538d3dcbbd83

  const createAssetMutation = useMutation({
    mutationFn: createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "assets"] });
      toast.success("Asset successfully added");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  const updateAssetMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: any;
    }) => updateAsset(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "assets"] });
      toast.success("Asset successfully updated");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: deleteAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "assets"] });
      toast.success("Asset successfully deleted");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

<<<<<<< HEAD
=======
  const uploadAssetImageMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      uploadAssetImage(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "assets"] });
      toast.success("Photo asset successfully uploaded");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

>>>>>>> d1006d5a3f81168775557fa0498b538d3dcbbd83
  const createLoanMutation = useMutation({
    mutationFn: (data: CreateLoanInput) => createLoan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "loans"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "assets"] });
      toast.success("Loan successfully created");
    },
    onError: (err: any) => toast.error(getErrorMessage(err)),
  });

  const returnLoanMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      returnLoan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "loans"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "assets"] });
      toast.success("Loan successfully returned ");
    },
    onError: (err: any) => toast.error(getErrorMessage(err)),
  });

  const markLoanAsLostMutation = useMutation({
    mutationFn: ({ id, catatan }: { id: string; catatan: string }) => markLoanAsLost(id, { catatan }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "loans"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "assets"] });
      toast.success("Loan marked as lost");
    },
    onError: (err: any) => toast.error(getErrorMessage(err)),
  });

  const contextValue = useMemo(
    () => ({
      assets: assetsData?.data?.assets ?? [],
      pagination: assetsData?.data?.pagination ?? null,
      filters: assetsData?.data?.filters ?? null,
      stats: statsData?.data ?? null,
      loanStatsData: loanStatsData?.data ?? null,
      isFetchingLoanStats,
      activeLoans: activeLoans ?? [],
      overdueLoans: overdueLoans ?? [],
      isFetchingAssets,
      isFetchingAvailableAssets,
      availableAssets: availableAssetsData?.data?.assets ?? [],
      isFetchingStats,
      setFilters,
      createAsset: createAssetMutation.mutateAsync,
      updateAsset: updateAssetMutation.mutateAsync,
      deleteAsset: deleteAssetMutation.mutateAsync,
      loans: loans ?? [],
      isFetchingLoans,
      createLoan: createLoanMutation.mutateAsync,
      returnLoan: returnLoanMutation.mutateAsync,
      markLoanAsLost: markLoanAsLostMutation.mutateAsync,
    }),
    [
      assets,
      availableAssets,
      loanStatsData,
      isFetchingLoanStats,
      isFetchingAssets,
      isFetchingAvailableAssets,
      statsData,
      isFetchingStats,
      pagination,
      filters,
      activeLoans,
      overdueLoans,
      createAssetMutation,
      updateAssetMutation,
      deleteAssetMutation,
      loans,
      isFetchingLoans,
      createLoanMutation,
      returnLoanMutation,
      markLoanAsLostMutation,
    ],
  );

  return (
    <AssetContext.Provider value={contextValue}>
      {children}
    </AssetContext.Provider>
  );
};