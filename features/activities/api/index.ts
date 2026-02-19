/**
 * Activities API functions — pure API calls, no React Query.
 * Covers: Activities, Progress Reports, LPJ, Documentation.
 */
import { api } from "@/lib/api/client";
import {
  CreateActivityInput,
  UpdateActivityInput,
  CreateProgressReportInput,
  UpdateProgressReportInput,
  CreateLpjInput,
  CreateDocumentationInput,
  UpdateDocumentationInput,
  ActivityStatus,
  DocumentationType,
} from "@/lib/validations/activity-schema";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Activity {
  id: string;
  judul: string;
  deskripsi: string;
  tanggal: string;
  lokasi: string;
  status: ActivityStatus;
  created_at: string;
  updated_at: string;
}

export interface ActivityListResponse {
  data: Activity[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_page: number;
  };
}

export interface ProgressReport {
  id: string;
  activity_id: string;
  judul: string;
  deskripsi: string;
  tanggal: string;
  created_at: string;
  updated_at: string;
}

export interface LPJ {
  id: string;
  activity_id: string;
  tanggal: string;
  created_at: string;
  updated_at: string;
}

export interface Documentation {
  id: string;
  activity_id: string;
  judul: string;
  deskripsi?: string;
  tipe_dokumen: DocumentationType;
  link_gdrive?: string;
  nama_file?: string;
  ukuran_file?: number;
  tipe_file?: string;
  created_at: string;
  updated_at: string;
}

export type ActivityParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

// ── Activity API ──────────────────────────────────────────────────────────

/** GET /activities */
export async function getActivities(
  params?: ActivityParams,
): Promise<ActivityListResponse> {
  return api.get("/activities", { params });
}

/** GET /activities/:id */
export async function getActivity(id: string): Promise<Activity> {
  return api.get(`/activities/${id}`);
}

/** POST /activities */
export async function createActivity(
  data: CreateActivityInput,
): Promise<Activity> {
  return api.post("/activities", data);
}

/** PUT /activities/:id */
export async function updateActivity(
  id: string,
  data: UpdateActivityInput,
): Promise<Activity> {
  return api.put(`/activities/${id}`, data);
}

/** DELETE /activities/:id */
export async function deleteActivity(id: string): Promise<void> {
  return api.delete(`/activities/${id}`);
}

// ── Progress Report API ───────────────────────────────────────────────────

/** GET /progress-reports */
export async function getProgressReports(params?: {
  activity_id?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: ProgressReport[]; meta: unknown }> {
  return api.get("/progress-reports", { params });
}

/** POST /progress-reports */
export async function createProgressReport(
  data: CreateProgressReportInput,
): Promise<ProgressReport> {
  return api.post("/progress-reports", data);
}

/** PUT /progress-reports/:id */
export async function updateProgressReport(
  id: string,
  data: UpdateProgressReportInput,
): Promise<ProgressReport> {
  return api.put(`/progress-reports/${id}`, data);
}

/** DELETE /progress-reports/:id */
export async function deleteProgressReport(id: string): Promise<void> {
  return api.delete(`/progress-reports/${id}`);
}

// ── LPJ API ───────────────────────────────────────────────────────────────

/** GET /lpj/activity/:activity_id */
export async function getLpjByActivity(
  activityId: string,
): Promise<{ message: string; lpj: LPJ[] }> {
  return api.get(`/lpj/activity/${activityId}`);
}

/** POST /lpj */
export async function createLpj(data: CreateLpjInput): Promise<LPJ> {
  return api.post("/lpj", data);
}

/** DELETE /lpj/:id */
export async function deleteLpj(id: string): Promise<void> {
  return api.delete(`/lpj/${id}`);
}

// ── Documentation API ─────────────────────────────────────────────────────

/** GET /documentations/activity/:activity_id */
export async function getDocumentations(
  activityId: string,
): Promise<{ data: Documentation[]; meta: unknown }> {
  return api.get(`/documentations/activity/${activityId}`);
}

/** POST /documentations */
export async function createDocumentation(
  data: CreateDocumentationInput,
): Promise<Documentation> {
  return api.post("/documentations", data);
}

/** DELETE /documentations/:id */
export async function deleteDocumentation(id: string): Promise<void> {
  return api.delete(`/documentations/${id}`);
}
