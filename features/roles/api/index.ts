/**
 * Roles API functions — pure API calls, no React Query.
 */
import { api } from "@/lib/api/client";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
  _count?: {
    users: number;
  };
}

export interface RoleListResponse {
  data: Role[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_page: number;
  };
}

export interface CreateRoleInput {
  name: string;
  description?: string;
  permissions?: string[];
}

export type UpdateRoleInput = Partial<CreateRoleInput>;

// ── API Functions ──────────────────────────────────────────────────────────

/** GET /roles */
export async function getRoles(): Promise<RoleListResponse> {
  return api.get("/roles");
}

/** GET /roles/:id */
export async function getRole(id: string): Promise<Role> {
  return api.get(`/roles/${id}`);
}

/** GET /roles/statistics */
export async function getRoleStats(): Promise<unknown> {
  return api.get("/roles/statistics");
}

/** POST /roles */
export async function createRole(data: CreateRoleInput): Promise<Role> {
  return api.post("/roles", data);
}

/** PUT /roles/:id */
export async function updateRole(
  id: string,
  data: UpdateRoleInput,
): Promise<Role> {
  return api.put(`/roles/${id}`, data);
}

/** DELETE /roles/:id */
export async function deleteRole(id: string): Promise<void> {
  return api.delete(`/roles/${id}`);
}
