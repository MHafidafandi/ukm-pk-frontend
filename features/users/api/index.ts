/**
 * Users API functions — pure API calls, no React Query.
 *
 * Endpoints:
 * - GET    /users                    → list users (paginated)
 * - GET    /users/statistics         → user statistics
 * - POST   /users                    → create user
 * - PUT    /users/:id                → update user
 * - DELETE /users/:id                → delete user
 * - PATCH  /users/:id/activate       → activate user
 * - PATCH  /users/:id/deactivate     → deactivate user
 * - PATCH  /users/:id/mark-alumni    → mark as alumni
 * - POST   /users/bulk/status        → bulk update status
 * - GET    /users/:id/roles          → get user roles
 * - POST   /users/:id/roles/assign   → assign roles
 * - DELETE /users/:id/roles/remove   → remove roles
 * - PUT    /users/:id/roles          → update roles
 * - POST   /users/:id/division/assign → assign division
 */
import { api } from "@/lib/api/client";
import {
  CreateUserInput,
  UpdateUserInput,
} from "@/lib/validations/users-schema";
import { User } from "@/contexts/AuthContext";

// ── Types ──────────────────────────────────────────────────────────────────

export type UsersParams = {
  page?: number;
  limit?: number;
  order?: string;
  sort?: string;
  search?: string;
  status?: string;
  division_id?: string;
  angkatan?: number;
  role_id?: string;
};

export interface UsersResponse {
  data: {
    users: User[];
    pagination: {
      total: number;
      page: number;
      total_pages: number;
      page_size: number;
      has_next: boolean;
      has_previous: boolean;
    };
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

/** GET /users */
export async function getUsers(
  params: UsersParams = {},
): Promise<UsersResponse> {
  return api.get("/users", { params });
}

/** GET /users/statistics */
export async function getUsersStats(): Promise<UsersStatsResponse> {
  return api.get("/users/statistics");
}

/** POST /users */
export async function createUser(data: CreateUserInput): Promise<User> {
  return api.post("/users", data);
}

/** PUT /users/:id */
export async function updateUser(
  id: string,
  data: UpdateUserInput,
): Promise<User> {
  return api.put(`/users/${id}`, data);
}

/** DELETE /users/:id */
export async function deleteUser(id: string): Promise<void> {
  return api.delete(`/users/${id}`);
}

/** PATCH /users/:id/activate */
export async function activateUser(id: string): Promise<void> {
  return api.patch(`/users/${id}/activate`);
}

/** PATCH /users/:id/deactivate */
export async function deactivateUser(id: string): Promise<void> {
  return api.patch(`/users/${id}/deactivate`);
}

/** PATCH /users/:id/mark-alumni */
export async function markAsAlumniUser(id: string): Promise<void> {
  return api.patch(`/users/${id}/mark-alumni`);
}

/** POST /users/bulk/status */
export async function bulkUserStatus(data: {
  user_ids: string[];
  status: "aktif" | "nonaktif" | "alumni";
}): Promise<void> {
  return api.post("/users/bulk/status", data);
}

/** GET /users/:id/roles */
export async function getUserRoles(id: string): Promise<unknown> {
  return api.get(`/users/${id}/roles`);
}

/** POST /users/:id/roles/assign */
export async function assignUserRole(
  id: string,
  roleIds: string[],
): Promise<void> {
  return api.post(`/users/${id}/roles/assign`, { role_ids: roleIds });
}

/** DELETE /users/:id/roles/remove */
export async function removeUserRole(
  id: string,
  roleIds: string[],
): Promise<void> {
  return api.delete(`/users/${id}/roles/remove?role_ids=${roleIds.join(",")}`);
}

/** PUT /users/:id/roles */
export async function updateUserRoles(
  id: string,
  roleIds: string[],
): Promise<void> {
  return api.put(`/users/${id}/roles`, { role_ids: roleIds });
}

/** POST /users/:id/division/assign */
export async function assignUserDivision(
  id: string,
  divisionId: string,
): Promise<void> {
  return api.post(`/users/${id}/division/assign`, { division_id: divisionId });
}
