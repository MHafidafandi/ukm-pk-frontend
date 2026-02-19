/**
 * Inventory Hooks — React Query
 */
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createAsset,
  createLoan,
  deleteAsset,
  getAssets,
  getLoans,
  returnLoan,
  updateAsset,
  uploadAssetImage,
} from "../api";
import { getErrorMessage } from "@/lib/api/client";

// ── Query Keys ─────────────────────────────────────────────────────────────

export const inventoryKeys = {
  all: ["inventory"] as const,
  assets: () => [...inventoryKeys.all, "assets"] as const,
  asset: (id: string) => [...inventoryKeys.assets(), id] as const,
  loans: () => [...inventoryKeys.all, "loans"] as const,
};

// ── Queries ────────────────────────────────────────────────────────────────

export const useAssets = () =>
  useQuery({
    queryKey: inventoryKeys.assets(),
    queryFn: getAssets,
  });

export const useLoans = () =>
  useQuery({
    queryKey: inventoryKeys.loans(),
    queryFn: getLoans,
  });

// ── Mutations (Assets) ─────────────────────────────────────────────────────

export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.assets() });
      toast.success("Aset berhasil ditambahkan");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateAsset(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.assets() });
      toast.success("Aset berhasil diperbarui");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.assets() });
      toast.success("Aset berhasil dihapus");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUploadAssetImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      uploadAssetImage(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.assets() });
      toast.success("Foto aset berhasil diupload");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

// ── Mutations (Loans) ──────────────────────────────────────────────────────

export const useCreateLoan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLoan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.loans() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.assets() }); // Update asset availability
      toast.success("Peminjaman berhasil dicatat");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useReturnLoan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      returnLoan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.loans() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.assets() });
      toast.success("Pengembalian berhasil dicatat");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};
