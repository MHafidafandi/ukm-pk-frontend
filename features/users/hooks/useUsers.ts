/**
 * React Query hooks untuk Users feature.
 * Semua query keys terstruktur dan toast feedback ada di sini.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getUsers,
  getUsersStats,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  markAsAlumniUser,
  bulkUserStatus,
  getUserRoles,
  assignUserRole,
  removeUserRole,
  updateUserRoles,
  assignUserDivision,
  UsersParams,
} from "../api";
import { getErrorMessage } from "@/lib/api/client";
import {
  CreateUserInput,
  UpdateUserInput,
} from "@/lib/validations/users-schema";

// ── Query Keys ─────────────────────────────────────────────────────────────

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params?: UsersParams) => [...userKeys.lists(), params] as const,
  stats: () => [...userKeys.all, "stats"] as const,
  roles: (id: string) => [...userKeys.all, "roles", id] as const,
};

// ── Queries ────────────────────────────────────────────────────────────────

/** Fetch daftar user dengan filter dan pagination */
export function useUsers(params?: UsersParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => getUsers(params),
  });
}

/** Fetch statistik user */
export function useUsersStats() {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: getUsersStats,
  });
}

/** Fetch roles milik satu user */
export function useUserRoles(id: string) {
  return useQuery({
    queryKey: userKeys.roles(id),
    queryFn: () => getUserRoles(id),
    enabled: !!id,
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────

/** Buat user baru */
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserInput) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      toast.success("Anggota berhasil ditambahkan");
    },
    onError: (err: Error) => {
      toast.error(getErrorMessage(err));
    },
  });
}

/** Update data user */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      toast.success("Data anggota berhasil diperbarui");
    },
    onError: (err: Error) => {
      toast.error(getErrorMessage(err));
    },
  });
}

/** Hapus user */
export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      toast.success("Anggota berhasil dihapus");
    },
    onError: (err: Error) => {
      toast.error(getErrorMessage(err));
    },
  });
}

/** Aktifkan user */
export function useActivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      toast.success("Anggota berhasil diaktifkan");
    },
    onError: (err: Error) => {
      toast.error(getErrorMessage(err));
    },
  });
}

/** Nonaktifkan user */
export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      toast.success("Anggota berhasil dinonaktifkan");
    },
    onError: (err: Error) => {
      toast.error(getErrorMessage(err));
    },
  });
}

/** Tandai sebagai alumni */
export function useMarkAsAlumniUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markAsAlumniUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      toast.success("Anggota ditandai sebagai alumni");
    },
    onError: (err: Error) => {
      toast.error(getErrorMessage(err));
    },
  });
}

/** Bulk update status */
export function useBulkUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      user_ids: string[];
      status: "aktif" | "nonaktif" | "alumni";
    }) => bulkUserStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      toast.success("Status anggota berhasil diperbarui");
    },
    onError: (err: Error) => {
      toast.error(getErrorMessage(err));
    },
  });
}

/** Assign role ke user */
export function useAssignUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roleIds }: { id: string; roleIds: string[] }) =>
      assignUserRole(id, roleIds),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.roles(id) });
      toast.success("Role berhasil ditambahkan");
    },
    onError: (err: Error) => {
      toast.error(getErrorMessage(err));
    },
  });
}

/** Hapus role dari user */
export function useRemoveUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roleIds }: { id: string; roleIds: string[] }) =>
      removeUserRole(id, roleIds),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.roles(id) });
      toast.success("Role berhasil dihapus");
    },
    onError: (err: Error) => {
      toast.error(getErrorMessage(err));
    },
  });
}

/** Update semua roles user */
export function useUpdateUserRoles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roleIds }: { id: string; roleIds: string[] }) =>
      updateUserRoles(id, roleIds),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.roles(id) });
      toast.success("Role user berhasil diperbarui");
    },
    onError: (err: Error) => {
      toast.error(getErrorMessage(err));
    },
  });
}

/** Pindah divisi user */
export function useAssignUserDivision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, divisionId }: { id: string; divisionId: string }) =>
      assignUserDivision(id, divisionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success("Divisi anggota berhasil diperbarui");
    },
    onError: (err: Error) => {
      toast.error(getErrorMessage(err));
    },
  });
}
