/**
 * Divisions API functions — pure API calls, no React Query.
 */
import { api } from "@/lib/api/client";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Division {
  id: string;
  nama_divisi: string;
  deskripsi?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  _count?: {
    users: number;
  };
}

export interface DivisionListResponse {
  data: Division[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_page: number;
  };
}

export interface DivisionStats {
  id: string;
  name: string;
  member_count: number;
  active_member_count: number;
  alumni_member_count: number;
}

export interface CreateDivisionInput {
  nama_divisi: string;
  deskripsi?: string;
}

export type UpdateDivisionInput = Partial<CreateDivisionInput>;

// ── API Functions ──────────────────────────────────────────────────────────

/** GET /divisions */
export async function getDivisions(): Promise<DivisionListResponse> {
  return api.get("/divisions");
}

/** GET /divisions/:id */
export async function getDivision(id: string): Promise<Division> {
  return api.get(`/divisions/${id}`);
}

/** GET /divisions/:id/division (users in division) */
export async function getDivisionUsers(id: string): Promise<unknown> {
  return api.get(`/divisions/${id}/division`);
}

/** GET /divisions/:id/member-stats */
export async function getDivisionStats(id: string): Promise<DivisionStats> {
  return api.get(`/divisions/${id}/member-stats`);
}

/** GET /divisions/statistics */
export async function getDivisionsStatistics(): Promise<unknown> {
  return api.get("/divisions/statistics");
}

/** POST /divisions */
export async function createDivision(
  data: CreateDivisionInput,
): Promise<Division> {
  return api.post("/divisions", data);
}

/** PUT /divisions/:id */
export async function updateDivision(
  id: string,
  data: UpdateDivisionInput,
): Promise<Division> {
  return api.put(`/divisions/${id}`, data);
}

/** DELETE /divisions/:id */
export async function deleteDivision(id: string): Promise<void> {
  return api.delete(`/divisions/${id}`);
}
