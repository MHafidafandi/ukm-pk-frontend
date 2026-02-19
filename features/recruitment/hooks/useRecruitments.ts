/**
 * React Query hooks untuk Recruitment feature.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getRecruitments,
  getRecruitment,
  createRecruitment,
  updateRecruitment,
  deleteRecruitment,
  registerRecruitment,
  getRegistrants,
  updateRegistrantStatus,
  deleteRegistrant,
  RecruitmentParams,
  RegistrantParams,
  CreateRecruitmentInput,
  UpdateRecruitmentInput,
  RegisterRecruitmentInput,
} from "../api";
import { RegistrantStatus } from "@/lib/validations/recruitment-schema";

// ── Query Keys ─────────────────────────────────────────────────────────────

export const recruitmentKeys = {
  all: ["recruitments"] as const,
  lists: () => [...recruitmentKeys.all, "list"] as const,
  list: (params?: RecruitmentParams) =>
    [...recruitmentKeys.lists(), params] as const,
  detail: (id: string) => [...recruitmentKeys.all, "detail", id] as const,
  registrants: (id: string) =>
    [...recruitmentKeys.all, "registrants", id] as const,
};

// ── Queries ────────────────────────────────────────────────────────────────

/** Fetch daftar recruitment */
export function useRecruitments(params?: RecruitmentParams) {
  return useQuery({
    queryKey: recruitmentKeys.list(params),
    queryFn: () => getRecruitments(params),
  });
}

/** Fetch satu recruitment */
export function useRecruitment(id: string) {
  return useQuery({
    queryKey: recruitmentKeys.detail(id),
    queryFn: () => getRecruitment(id),
    enabled: !!id,
  });
}

/** Fetch pendaftar recruitment */
export function useRegistrants(
  recruitmentId: string,
  params?: RegistrantParams,
) {
  return useQuery({
    queryKey: recruitmentKeys.registrants(recruitmentId),
    queryFn: () => getRegistrants(recruitmentId, params),
    enabled: !!recruitmentId,
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────

/** Buat recruitment baru */
export function useCreateRecruitment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRecruitmentInput) => createRecruitment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.lists() });
      toast.success("Rekrutmen berhasil dibuat");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal membuat rekrutmen");
    },
  });
}

/** Update recruitment */
export function useUpdateRecruitment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecruitmentInput }) =>
      updateRecruitment(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.detail(id) });
      toast.success("Rekrutmen berhasil diperbarui");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal memperbarui rekrutmen");
    },
  });
}

/** Hapus recruitment */
export function useDeleteRecruitment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRecruitment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.lists() });
      toast.success("Rekrutmen berhasil dihapus");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menghapus rekrutmen");
    },
  });
}

/** Daftar ke recruitment */
export function useRegisterRecruitment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterRecruitmentInput) => registerRecruitment(data),
    onSuccess: (_data, { recruitment_id }) => {
      queryClient.invalidateQueries({
        queryKey: recruitmentKeys.registrants(recruitment_id),
      });
      toast.success("Berhasil mendaftar ke rekrutmen");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal mendaftar");
    },
  });
}

/** Update status pendaftar */
export function useUpdateRegistrantStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      recruitmentId,
      registrantId,
      status,
    }: {
      recruitmentId: string;
      registrantId: string;
      status: RegistrantStatus;
    }) => updateRegistrantStatus(recruitmentId, registrantId, status),
    onSuccess: (_data, { recruitmentId }) => {
      queryClient.invalidateQueries({
        queryKey: recruitmentKeys.registrants(recruitmentId),
      });
      toast.success("Status pendaftar berhasil diperbarui");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal memperbarui status");
    },
  });
}

/** Hapus pendaftar */
export function useDeleteRegistrant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      recruitmentId,
      registrantId,
    }: {
      recruitmentId: string;
      registrantId: string;
    }) => deleteRegistrant(recruitmentId, registrantId),
    onSuccess: (_data, { recruitmentId }) => {
      queryClient.invalidateQueries({
        queryKey: recruitmentKeys.registrants(recruitmentId),
      });
      toast.success("Pendaftar berhasil dihapus");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menghapus pendaftar");
    },
  });
}
