/**
 * React Query hooks untuk Activities feature.
 * Mencakup: Activities, Progress Reports, LPJ, Documentation.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  getProgressReports,
  createProgressReport,
  updateProgressReport,
  deleteProgressReport,
  getLpjByActivity,
  createLpj,
  deleteLpj,
  getDocumentations,
  createDocumentation,
  deleteDocumentation,
  ActivityParams,
} from "../api";
import {
  CreateActivityInput,
  UpdateActivityInput,
  CreateProgressReportInput,
  UpdateProgressReportInput,
  CreateLpjInput,
  CreateDocumentationInput,
} from "@/lib/validations/activity-schema";

// ── Query Keys ─────────────────────────────────────────────────────────────

export const activityKeys = {
  all: ["activities"] as const,
  lists: () => [...activityKeys.all, "list"] as const,
  list: (params?: ActivityParams) => [...activityKeys.lists(), params] as const,
  detail: (id: string) => [...activityKeys.all, "detail", id] as const,
  progress: (activityId: string) =>
    [...activityKeys.all, "progress", activityId] as const,
  lpj: (activityId: string) =>
    [...activityKeys.all, "lpj", activityId] as const,
  docs: (activityId: string) =>
    [...activityKeys.all, "docs", activityId] as const,
};

// ── Activity Queries ───────────────────────────────────────────────────────

/** Fetch daftar kegiatan */
export function useActivities(params?: ActivityParams) {
  return useQuery({
    queryKey: activityKeys.list(params),
    queryFn: () => getActivities(params),
  });
}

/** Fetch satu kegiatan */
export function useActivity(id: string) {
  return useQuery({
    queryKey: activityKeys.detail(id),
    queryFn: () => getActivity(id),
    enabled: !!id,
  });
}

/** Fetch laporan progres kegiatan */
export function useProgressReports(activityId: string) {
  return useQuery({
    queryKey: activityKeys.progress(activityId),
    queryFn: () => getProgressReports({ activity_id: activityId }),
    enabled: !!activityId,
  });
}

/** Fetch LPJ kegiatan */
export function useLpjByActivity(activityId: string) {
  return useQuery({
    queryKey: activityKeys.lpj(activityId),
    queryFn: () => getLpjByActivity(activityId),
    enabled: !!activityId,
  });
}

/** Fetch dokumentasi kegiatan */
export function useDocumentations(activityId: string) {
  return useQuery({
    queryKey: activityKeys.docs(activityId),
    queryFn: () => getDocumentations(activityId),
    enabled: !!activityId,
  });
}

// ── Activity Mutations ─────────────────────────────────────────────────────

/** Buat kegiatan baru */
export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateActivityInput) => createActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      toast.success("Kegiatan berhasil dibuat");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal membuat kegiatan");
    },
  });
}

/** Update kegiatan */
export function useUpdateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateActivityInput }) =>
      updateActivity(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityKeys.detail(id) });
      toast.success("Kegiatan berhasil diperbarui");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal memperbarui kegiatan");
    },
  });
}

/** Hapus kegiatan */
export function useDeleteActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      toast.success("Kegiatan berhasil dihapus");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menghapus kegiatan");
    },
  });
}

// ── Progress Report Mutations ──────────────────────────────────────────────

/** Buat laporan progres */
export function useCreateProgressReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProgressReportInput) => createProgressReport(data),
    onSuccess: (_data, { activity_id }) => {
      queryClient.invalidateQueries({
        queryKey: activityKeys.progress(activity_id),
      });
      toast.success("Laporan progres berhasil dibuat");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal membuat laporan");
    },
  });
}

/** Update laporan progres */
export function useUpdateProgressReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      activityId,
      data,
    }: {
      id: string;
      activityId: string;
      data: UpdateProgressReportInput;
    }) => updateProgressReport(id, data),
    onSuccess: (_data, { activityId }) => {
      queryClient.invalidateQueries({
        queryKey: activityKeys.progress(activityId),
      });
      toast.success("Laporan progres berhasil diperbarui");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal memperbarui laporan");
    },
  });
}

/** Hapus laporan progres */
export function useDeleteProgressReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activityId }: { id: string; activityId: string }) =>
      deleteProgressReport(id),
    onSuccess: (_data, { activityId }) => {
      queryClient.invalidateQueries({
        queryKey: activityKeys.progress(activityId),
      });
      toast.success("Laporan progres berhasil dihapus");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menghapus laporan");
    },
  });
}

// ── LPJ Mutations ──────────────────────────────────────────────────────────

/** Buat LPJ */
export function useCreateLpj() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLpjInput) => createLpj(data),
    onSuccess: (_data, { activity_id }) => {
      queryClient.invalidateQueries({
        queryKey: activityKeys.lpj(activity_id),
      });
      toast.success("LPJ berhasil dibuat");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal membuat LPJ");
    },
  });
}

/** Hapus LPJ */
export function useDeleteLpj() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activityId }: { id: string; activityId: string }) =>
      deleteLpj(id),
    onSuccess: (_data, { activityId }) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.lpj(activityId) });
      toast.success("LPJ berhasil dihapus");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menghapus LPJ");
    },
  });
}

// ── Documentation Mutations ────────────────────────────────────────────────

/** Tambah dokumentasi */
export function useCreateDocumentation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDocumentationInput) => createDocumentation(data),
    onSuccess: (_data, { activity_id }) => {
      queryClient.invalidateQueries({
        queryKey: activityKeys.docs(activity_id),
      });
      toast.success("Dokumentasi berhasil ditambahkan");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menambahkan dokumentasi");
    },
  });
}

/** Hapus dokumentasi */
export function useDeleteDocumentation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activityId }: { id: string; activityId: string }) =>
      deleteDocumentation(id),
    onSuccess: (_data, { activityId }) => {
      queryClient.invalidateQueries({
        queryKey: activityKeys.docs(activityId),
      });
      toast.success("Dokumentasi berhasil dihapus");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menghapus dokumentasi");
    },
  });
}
