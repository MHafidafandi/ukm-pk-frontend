import { api } from "@/lib/api/client";

// ── Types ──────────────────────────────────────────────────────────────────

export type RecruitmentStatus = "draft" | "open" | "closed";
export type RegistrantStatus = "pending" | "accepted" | "rejected" | "interview";

export interface Recruitment {
  id: string;
  nama_recruitment: string;
  deskripsi: string;
  tanggal_buka: string;
  tanggal_tutup: string;
  status: RecruitmentStatus;
  announcement_link?: string;
  created_at: string;
  updated_at: string;
}

export interface Registrant {
  id: string;
  recruit_id: string;
  nama: string;
  email: string;
  nim?: string;
  jurusan?: string;
  angkatan: number;
  nomor_telepon?: string;
  first_choice?: string;
  second_choice?: string;
  third_choice?: string;
  status: RegistrantStatus;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  total: number;
  page: number;
  total_pages: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

export type RecruitmentFilters = {
  page?: number;
  limit?: number;
  order?: string;
  sort?: string;
  search?: string;
  status?: string;
};

export type RegistrantFilters = {
  page?: number;
  limit?: number;
  order?: string;
  sort?: string;
  search?: string;
  recuruit_id?: string; // typo di API, ikutin aja
  status?: string;
};

// DTOs
export type CreateRecruitmentDTO = {
  nama_recruitment: string;
  deskripsi?: string;
  tanggal_buka: string; // "2025-01-01"
  tanggal_tutup: string;
};

export type UpdateRecruitmentDTO = {
  nama_recruitment?: string;
  deskripsi?: string;
  tanggal_buka?: string;
  tanggal_tutup?: string;
  announcement_link?: string;
};

// ── API Functions ──────────────────────────────────────────────────────────
//
// PENTING: Interceptor di client.ts sudah melakukan `return response.data`,
// jadi `api.get(url)` langsung mengembalikan body JSON (bukan AxiosResponse).
// Contoh: api.get("/recruitments") → { data: { recruitments: [...], pagination: {...} } }
//
// ========================

const BASE = "/admin/recruitments";

// --- Recruitments (List) ---

export async function getRecruitments(
  filters?: RecruitmentFilters
): Promise<{ data: { recruitments: Recruitment[]; pagination: Pagination } }> {
  const params: Record<string, string> = {};
  if (filters?.page) params.page = String(filters.page);
  if (filters?.limit) params.limit = String(filters.limit);
  if (filters?.search) params.search = filters.search;
  if (filters?.status) params.status = filters.status;
  if (filters?.sort) params.sort = filters.sort;
  if (filters?.order) params.order = filters.order;

  // api.get sudah return response.data (body JSON)
  const result = await api.get(BASE, { params });
  return result as any;
}

// --- Recruitment (single) ---

export async function getRecruitmentById(id: string): Promise<Recruitment> {
  const result: any = await api.get(`${BASE}/${id}`);
  return result.data; // body = { data: Recruitment }
}

// --- Create ---

export async function createRecruitment(
  data: CreateRecruitmentDTO
): Promise<any> {
  const result = await api.post(BASE, data);
  return result;
}

// --- Update ---

export async function updateRecruitment(
  id: string,
  data: UpdateRecruitmentDTO
): Promise<any> {
  const result = await api.put(`${BASE}/${id}`, data);
  return result;
}

// --- Delete ---

export async function deleteRecruitment(id: string): Promise<any> {
  const result = await api.delete(`${BASE}/${id}`);
  return result;
}

// --- Status changes ---

export async function openRecruitment(id: string): Promise<any> {
  const result = await api.patch(`${BASE}/${id}/open`);
  return result;
}

export async function closeRecruitment(id: string): Promise<any> {
  const result = await api.patch(`${BASE}/${id}/close`);
  return result;
}

export async function archiveRecruitment(id: string): Promise<any> {
  const result = await api.patch(`${BASE}/${id}/archive`);
  return result;
}

// --- Registrants ---

export async function getRegistrants(
  filters?: RegistrantFilters
): Promise<{ data: { registrants: Registrant[]; pagination: Pagination } }> {
  const params: Record<string, string> = {};
  if (filters?.page) params.page = String(filters.page);
  if (filters?.limit) params.limit = String(filters.limit);
  if (filters?.search) params.search = filters.search;
  if (filters?.recuruit_id) params.recuruit_id = filters.recuruit_id;
  if (filters?.status) params.status = filters.status;

  const result = await api.get(`${BASE}/registrants`, { params });
  return result as any;
}

export async function acceptRegistrant(registrantId: string): Promise<any> {
  const result = await api.patch(
    `${BASE}/registrants/${registrantId}/accept`
  );
  return result;
}

export async function rejectRegistrant(registrantId: string): Promise<any> {
  const result = await api.post(
    `${BASE}/registrants/${registrantId}/reject`
  );
  return result;
}
