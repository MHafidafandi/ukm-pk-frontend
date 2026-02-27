"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAssets,
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset,
  uploadAssetImage,
  getLoans,
  createLoan,
  returnLoan,
  Asset,
  Loan,
  CreateAssetInput,
  CreateLoanInput,
} from "@/features/inventory/services/assetService";
import { getErrorMessage } from "@/lib/api/client";

interface AssetContextType {
  assets: Asset[];
  isFetchingAssets: boolean;
  createAsset: (data: CreateAssetInput) => Promise<any>;
  updateAsset: (args: {
    id: string;
    data: Partial<CreateAssetInput>;
  }) => Promise<any>;
  deleteAsset: (id: string) => Promise<any>;
  uploadAssetImage: (args: { id: string; file: File }) => Promise<any>;

  loans: Loan[];
  isFetchingLoans: boolean;
  createLoan: (data: CreateLoanInput) => Promise<any>;
  returnLoan: (args: { id: string; data: any }) => Promise<any>;
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

  // -- Queries --
  const { data: assetsData, isLoading: isFetchingAssets } = useQuery({
    queryKey: ["inventory", "assets"],
    queryFn: getAssets,
  });

  const { data: loansData, isLoading: isFetchingLoans } = useQuery({
    queryKey: ["inventory", "loans"],
    queryFn: getLoans,
  });

  const assets = assetsData?.data || [];
  const loans = loansData?.data || [];

  // -- Mutations (Assets) --
  const createAssetMutation = useMutation({
    mutationFn: createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "assets"] });
      toast.success("Aset berhasil ditambahkan");
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
      data: Partial<CreateAssetInput>;
    }) => updateAsset(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "assets"] });
      toast.success("Aset berhasil diperbarui");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: deleteAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "assets"] });
      toast.success("Aset berhasil dihapus");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  const uploadAssetImageMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      uploadAssetImage(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "assets"] });
      toast.success("Foto aset berhasil diupload");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  // -- Mutations (Loans) --
  const createLoanMutation = useMutation({
    mutationFn: createLoan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "loans"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "assets"] }); // Update asset availability
      toast.success("Peminjaman berhasil dicatat");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  const returnLoanMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      returnLoan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "loans"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "assets"] });
      toast.success("Pengembalian berhasil dicatat");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  const contextValue = useMemo(
    () => ({
      assets,
      isFetchingAssets,
      createAsset: createAssetMutation.mutateAsync,
      updateAsset: updateAssetMutation.mutateAsync,
      deleteAsset: deleteAssetMutation.mutateAsync,
      uploadAssetImage: uploadAssetImageMutation.mutateAsync,

      loans,
      isFetchingLoans,
      createLoan: createLoanMutation.mutateAsync,
      returnLoan: returnLoanMutation.mutateAsync,
    }),
    [
      assets,
      isFetchingAssets,
      createAssetMutation,
      updateAssetMutation,
      deleteAssetMutation,
      uploadAssetImageMutation,
      loans,
      isFetchingLoans,
      createLoanMutation,
      returnLoanMutation,
    ],
  );

  return (
    <AssetContext.Provider value={contextValue}>
      {children}
    </AssetContext.Provider>
  );
};
