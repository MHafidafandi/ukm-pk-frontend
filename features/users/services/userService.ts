import { api } from "@/lib/api/client";
import { User } from "@/features/auth/contexts/AuthContext";
import {
  CreateUserInput,
  UpdateUserInput,
} from "@/lib/validations/users-schema";

// ── Types ──────────────────────────────────────────────────────────────────

export type UsersParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  division_id?: string;
  angkatan?: number;
};
export interface PaginationMeta {
  total: number;
  page: number;
  total_pages: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}
export interface UsersResponse {
  data: {
    users: User[];
    pagination: PaginationMeta;
    filters: Record<string, unknown>;
  };
}

export interface UsersStatsResponse {
  data: {
    total_users: number;
    active_users: number;
    inactive_users: number;
    alumni_users: number;
    users_by_division: {
      division_id: string;
      division_name: string;
      user_count: number;
      percentage: string;
    }[];
    users_by_angkatan: Record<string, number>;
    users_by_status: Record<string, number>;
    monthly_growth: unknown;
    recent_registrations: unknown[];
  };
}

// ── API Functions ──────────────────────────────────────────────────────────

export async function getUsers(
  params: UsersParams = {},
): Promise<UsersResponse> {
  const data = await api.get("/users", { params });
  return data;
}

export async function getUserById(id: string): Promise<{ data: User }> {
  const data = await api.get(`/users/${id}`);
  return data;
}

export async function getUsersStats(): Promise<UsersStatsResponse> {
  const data = await api.get("/users/statistics");
  return data;
}

export async function createUser(
  body: CreateUserInput,
): Promise<{ message: string; id?: string }> {
  const { data } = await api.post("/users", body);
  return data;
}

export async function updateUser(
  id: string,
  body: UpdateUserInput,
): Promise<{ message: string; id?: string }> {
  const { data } = await api.put(`/users/${id}`, body);
  return data;
}

export async function deleteUser(id: string): Promise<{ message: string }> {
  const { data } = await api.delete(`/users/${id}`);
  return data;
}

export async function activateUser(id: string): Promise<{ message: string }> {
  const { data } = await api.patch(`/users/${id}/activate`);
  return data;
}

export async function deactivateUser(id: string): Promise<{ message: string }> {
  const { data } = await api.patch(`/users/${id}/deactivate`);
  return data;
}

export async function markAsAlumniUser(
  id: string,
): Promise<{ message: string }> {
  const { data } = await api.patch(`/users/${id}/mark-alumni`);
  return data;
}

export async function bulkUserStatus(body: {
  user_ids: string[];
  status: "active" | "inactive" | "alumni";
}): Promise<{ message: string; updated_count?: number }> {
  const { data } = await api.post("/users/bulk/status", body);
  return data;
}

export async function assignUserRole(
  id: string,
  roleIds: string[],
): Promise<{ message: string }> {
  const { data } = await api.post(`/users/${id}/roles/assign`, {
    role_ids: roleIds,
  });
  return data;
}

export async function removeUserRole(
  id: string,
  roleIds: string[],
): Promise<{ message: string }> {
  const { data } = await api.delete(
    `/users/${id}/roles/remove?role_ids=${roleIds.join(",")}`,
  );
  return data;
}

export async function assignUserDivision(
  id: string,
  divisionId: string,
): Promise<{ message: string }> {
  const { data } = await api.post(`/users/${id}/division/assign`, {
    division_id: divisionId,
  });
  return data;
}
