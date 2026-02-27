import { api } from "@/lib/api/client";
import { User } from "@/features/auth/contexts/AuthContext";

// ── Types ──────────────────────────────────────────────────────────────────

export type RecruitmentStatus = "draft" | "open" | "closed";
export type RegistrantStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "interview";

export interface Recruitment {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: RecruitmentStatus;
  requirements?: string[];
  created_at: string;
  updated_at: string;
  _count?: {
    registrants: number;
  };
}

export interface Registrant {
  id: string;
  recruitment_id: string;
  user_id: string;
  status: RegistrantStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  user: User;
}

export interface CreateRecruitmentInput {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: RecruitmentStatus;
  requirements?: string[];
}
export type UpdateRecruitmentInput = Partial<CreateRecruitmentInput>;

export interface RegisterRecruitmentInput {
  recruitment_id: string;
}

export type RecruitmentParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

export type RegistrantParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

interface PaginationMeta {
  total: number;
  page: number;
  total_pages: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

// ── API Functions ──────────────────────────────────────────────────────────

/** GET /recruitments */
export async function getRecruitments(params?: RecruitmentParams): Promise<{
  data: { recruitments: Recruitment[]; pagination: PaginationMeta };
}> {
  const { data } = await api.get("/recruitments", { params });
  return data;
}

/** GET /recruitments/:id */
export async function getRecruitment(
  id: string,
): Promise<{ data: Recruitment }> {
  const { data } = await api.get(`/recruitments/${id}`);
  return { data };
}

/** POST /recruitments */
export async function createRecruitment(
  body: CreateRecruitmentInput,
): Promise<{ message: string; id?: string }> {
  const { data } = await api.post("/recruitments", body);
  return data;
}

/** PUT /recruitments/:id */
export async function updateRecruitment(
  id: string,
  body: UpdateRecruitmentInput,
): Promise<{ message: string; id?: string }> {
  const { data } = await api.put(`/recruitments/${id}`, body);
  return data;
}

/** DELETE /recruitments/:id */
export async function deleteRecruitment(
  id: string,
): Promise<{ message: string }> {
  const { data } = await api.delete(`/recruitments/${id}`);
  return data;
}

/** POST /recruitments/register */
export async function registerRecruitment(
  body: RegisterRecruitmentInput,
): Promise<{ message: string }> {
  const { data } = await api.post("/recruitments/register", body);
  return data;
}

/** GET /recruitments/:id/registrants */
export async function getRegistrants(
  recruitmentId: string,
  params?: RegistrantParams,
): Promise<{
  data: { registrants: Registrant[]; pagination: PaginationMeta };
}> {
  const { data } = await api.get(`/recruitments/${recruitmentId}/registrants`, {
    params,
  });
  return data;
}

/** PATCH /recruitments/:recruitmentId/registrants/:registrantId/status */
export async function updateRegistrantStatus(
  recruitmentId: string,
  registrantId: string,
  status: RegistrantStatus,
): Promise<{ message: string }> {
  const { data } = await api.patch(
    `/recruitments/${recruitmentId}/registrants/${registrantId}/status`,
    { status },
  );
  return data;
}

/** DELETE /recruitments/:recruitmentId/registrants/:registrantId */
export async function deleteRegistrant(
  recruitmentId: string,
  registrantId: string,
): Promise<{ message: string }> {
  const { data } = await api.delete(
    `/recruitments/${recruitmentId}/registrants/${registrantId}`,
  );
  return data;
}
