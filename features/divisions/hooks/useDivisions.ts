/**
 * React Query hooks untuk Divisions feature.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getDivisions,
  getDivision,
  getDivisionUsers,
  getDivisionStats,
  getDivisionsStatistics,
  createDivision,
  updateDivision,
  deleteDivision,
  CreateDivisionInput,
  UpdateDivisionInput,
} from "../api";

// ── Query Keys ─────────────────────────────────────────────────────────────

export const divisionKeys = {
  all: ["divisions"] as const,
  lists: () => [...divisionKeys.all, "list"] as const,
  detail: (id: string) => [...divisionKeys.all, "detail", id] as const,
  users: (id: string) => [...divisionKeys.all, "users", id] as const,
  stats: (id: string) => [...divisionKeys.all, "stats", id] as const,
  statistics: () => [...divisionKeys.all, "statistics"] as const,
};

// ── Queries ────────────────────────────────────────────────────────────────

/** Fetch semua divisi */
export function useDivisions() {
  return useQuery({
    queryKey: divisionKeys.lists(),
    queryFn: getDivisions,
  });
}

/** Fetch satu divisi */
export function useDivision(id: string) {
  return useQuery({
    queryKey: divisionKeys.detail(id),
    queryFn: () => getDivision(id),
    enabled: !!id,
  });
}

/** Fetch anggota divisi */
export function useDivisionUsers(id: string) {
  return useQuery({
    queryKey: divisionKeys.users(id),
    queryFn: () => getDivisionUsers(id),
    enabled: !!id,
  });
}

/** Fetch statistik satu divisi */
export function useDivisionStats(id: string) {
  return useQuery({
    queryKey: divisionKeys.stats(id),
    queryFn: () => getDivisionStats(id),
    enabled: !!id,
  });
}

/** Fetch statistik semua divisi */
export function useDivisionsStatistics() {
  return useQuery({
    queryKey: divisionKeys.statistics(),
    queryFn: getDivisionsStatistics,
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────

/** Buat divisi baru */
export function useCreateDivision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDivisionInput) => createDivision(data),
    onSuccess: (division) => {
      queryClient.invalidateQueries({ queryKey: divisionKeys.lists() });
      toast.success(`Divisi "${division.nama_divisi}" berhasil dibuat`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal membuat divisi");
    },
  });
}

/** Update divisi */
export function useUpdateDivision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDivisionInput }) =>
      updateDivision(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: divisionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: divisionKeys.detail(id) });
      toast.success("Divisi berhasil diperbarui");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal memperbarui divisi");
    },
  });
}

/** Hapus divisi */
export function useDeleteDivision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDivision(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: divisionKeys.lists() });
      toast.success("Divisi berhasil dihapus");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menghapus divisi");
    },
  });
}
