import { api } from "@/lib/api/client";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  created_at?: string;
  updated_at?: string;
  user_count: number;
}

export interface CreateRoleInput {
  name: string;
  permissions?: string[];
}

export type UpdateRoleInput = Partial<CreateRoleInput>;

// ── API Functions ──────────────────────────────────────────────────────────

/** GET /roles */
export async function getRoles(): Promise<{ data: Role[] }> {
  const data = await api.get("/roles");
  return data;
}

/** GET /roles/:id */
export async function getRole(id: string): Promise<{ data: Role }> {
  const data = await api.get(`/roles/${id}`);
  return data;
}

/** GET /roles/statistics */
export async function getRoleStats(): Promise<any> {
  const data = await api.get("/roles/statistics");
  return data;
}

/** POST /roles */
export async function createRole(
  body: CreateRoleInput,
): Promise<{ message: string; id?: string }> {
  const { data } = await api.post("/roles", body);
  return data;
}

/** PUT /roles/:id */
export async function updateRole(
  id: string,
  body: UpdateRoleInput,
): Promise<{ message: string; id?: string }> {
  const { data } = await api.put(`/roles/${id}`, body);
  return data;
}

/** DELETE /roles/:id */
export async function deleteRole(id: string): Promise<{ message: string }> {
  const { data } = await api.delete(`/roles/${id}`);
  return data;
}
