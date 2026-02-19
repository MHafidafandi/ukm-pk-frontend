/**
 * React Query hooks untuk Roles feature.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getRoles,
  getRole,
  getRoleStats,
  createRole,
  updateRole,
  deleteRole,
  CreateRoleInput,
  UpdateRoleInput,
} from "../api";

// ── Query Keys ─────────────────────────────────────────────────────────────

export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  detail: (id: string) => [...roleKeys.all, "detail", id] as const,
  stats: () => [...roleKeys.all, "stats"] as const,
};

// ── Queries ────────────────────────────────────────────────────────────────

/** Fetch semua role */
export function useRoles() {
  return useQuery({
    queryKey: roleKeys.lists(),
    queryFn: getRoles,
  });
}

/** Fetch satu role */
export function useRole(id: string) {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => getRole(id),
    enabled: !!id,
  });
}

/** Fetch statistik role */
export function useRoleStats() {
  return useQuery({
    queryKey: roleKeys.stats(),
    queryFn: getRoleStats,
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────

/** Buat role baru */
export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoleInput) => createRole(data),
    onSuccess: (role) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      toast.success(`Role "${role.name}" berhasil dibuat`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal membuat role");
    },
  });
}

/** Update role */
export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleInput }) =>
      updateRole(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
      toast.success("Role berhasil diperbarui");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal memperbarui role");
    },
  });
}

/** Hapus role */
export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      toast.success("Role berhasil dihapus");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menghapus role");
    },
  });
}
