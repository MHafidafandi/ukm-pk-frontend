import { api } from "@/lib/api/client";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Division {
  id: string;
  nama_divisi: string;
  deskripsi?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  _count?: {
    users: number;
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
export async function getDivisions(): Promise<{ data: Division[] }> {
  // Return shape aligns with SRS for non-paginated lists
  const data = await api.get("/divisions");
  return data;
}

/** GET /divisions/:id */
export async function getDivision(id: string): Promise<{ data: Division }> {
  const data = await api.get(`/divisions/${id}`);
  return data;
}

/** GET /divisions/:id/division (users in division) */
export async function getDivisionUsers(id: string): Promise<any> {
  const data = await api.get(`/divisions/${id}/division`);
  return data;
}

/** GET /divisions/:id/member-stats */
export async function getDivisionStats(
  id: string,
): Promise<{ data: DivisionStats }> {
  const { data } = await api.get(`/divisions/${id}/member-stats`);
  return { data };
}

/** GET /divisions/statistics */
export async function getDivisionsStatistics(): Promise<any> {
  const { data } = await api.get("/divisions/statistics");
  return data;
}

/** POST /divisions */
export async function createDivision(
  body: CreateDivisionInput,
): Promise<{ message: string; id?: string }> {
  const { data } = await api.post("/divisions", body);
  return data;
}

/** PUT /divisions/:id */
export async function updateDivision(
  id: string,
  body: UpdateDivisionInput,
): Promise<{ message: string; id?: string }> {
  const { data } = await api.put(`/divisions/${id}`, body);
  return data;
}

/** DELETE /divisions/:id */
export async function deleteDivision(id: string): Promise<{ message: string }> {
  const { data } = await api.delete(`/divisions/${id}`);
  return data;
}
