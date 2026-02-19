/**
 * Recruitment API functions — pure API calls, no React Query.
 */
import { api } from "@/lib/api/client";
import {
  CreateRecruitmentInput,
  UpdateRecruitmentInput,
  RecruitmentStatus,
  RegistrantStatus,
} from "@/lib/validations/recruitment-schema";
import { User } from "@/contexts/AuthContext";

// Re-export for convenience
export type { CreateRecruitmentInput, UpdateRecruitmentInput };

// ── Types ──────────────────────────────────────────────────────────────────

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

export interface RecruitmentListResponse {
  data: Recruitment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_page: number;
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

export interface RegistrantListResponse {
  data: Registrant[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_page: number;
  };
}

export interface RegisterRecruitmentInput {
  recruitment_id: string;
}

export type RegistrantParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

export type RecruitmentParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

// ── API Functions ──────────────────────────────────────────────────────────

/** GET /recruitments */
export async function getRecruitments(
  params?: RecruitmentParams,
): Promise<RecruitmentListResponse> {
  return api.get("/recruitments", { params });
}

/** GET /recruitments/:id */
export async function getRecruitment(id: string): Promise<Recruitment> {
  return api.get(`/recruitments/${id}`);
}

/** POST /recruitments */
export async function createRecruitment(
  data: CreateRecruitmentInput,
): Promise<Recruitment> {
  return api.post("/recruitments", data);
}

/** PUT /recruitments/:id */
export async function updateRecruitment(
  id: string,
  data: UpdateRecruitmentInput,
): Promise<Recruitment> {
  return api.put(`/recruitments/${id}`, data);
}

/** DELETE /recruitments/:id */
export async function deleteRecruitment(id: string): Promise<void> {
  return api.delete(`/recruitments/${id}`);
}

/** POST /recruitments/register */
export async function registerRecruitment(
  data: RegisterRecruitmentInput,
): Promise<void> {
  return api.post("/recruitments/register", data);
}

/** GET /recruitments/:id/registrants */
export async function getRegistrants(
  recruitmentId: string,
  params?: RegistrantParams,
): Promise<RegistrantListResponse> {
  return api.get(`/recruitments/${recruitmentId}/registrants`, { params });
}

/** PATCH /recruitments/:recruitmentId/registrants/:registrantId/status */
export async function updateRegistrantStatus(
  recruitmentId: string,
  registrantId: string,
  status: RegistrantStatus,
): Promise<void> {
  return api.patch(
    `/recruitments/${recruitmentId}/registrants/${registrantId}/status`,
    { status },
  );
}

/** DELETE /recruitments/:recruitmentId/registrants/:registrantId */
export async function deleteRegistrant(
  recruitmentId: string,
  registrantId: string,
): Promise<void> {
  return api.delete(
    `/recruitments/${recruitmentId}/registrants/${registrantId}`,
  );
}
