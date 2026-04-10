import { api } from "@/lib/api/client";
import { objectToFormData } from "@/lib/utils";
import {
  CreateActivityInput,
  UpdateActivityInput,
  UpdateActivityStatusInput,
  CreateProgressReportInput,
  UpdateProgressReportInput,
  CreateLpjInput,
  ActivityStatus,
} from "@/lib/validations/activity-schema";

export type {
  CreateActivityInput,
  UpdateActivityInput,
  UpdateActivityStatusInput,
  CreateProgressReportInput,
  UpdateProgressReportInput,
  CreateLpjInput,
  ActivityStatus,
};

// ── Types ──────────────────────────────────────────────────────────────────

export interface Activity {
  id: string;
  judul: string;
  deskripsi: string;
  tanggal: string;
  lokasi: string;
  status: ActivityStatus;
  thumbnail: string;
  created_at: string;
  updated_at: string;
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
  file_url: string;
  tanggal: string;
  created_at: string;
  updated_at: string;
}

export interface ProgressDocument {
  id: string;
  report_id: string;
  file_url: string;
  tanggal: string;
  created_at: string;
  updated_at: string;
}

export type ActivityParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

export interface PaginationMeta {
  total: number;
  page: number;
  total_pages: number;
  page_size: number;
}

// ── Activity API ──────────────────────────────────────────────────────────

/** GET /activities */
export async function getActivities(
  params?: ActivityParams,
): Promise<{ data: { activities: Activity[]; pagination: PaginationMeta } }> {
  const data = await api.get("/activities", { params });
  return data;
}

/** GET /activities/:id */
export async function getActivity(id: string): Promise<{ data: Activity }> {
  const data = await api.get(`/activities/${id}`);
  return data;
}

/** POST /activities */
export async function createActivity(
  body: CreateActivityInput | FormData,
): Promise<{ message: string; id?: string }> {
  const payload = body instanceof FormData ? body : objectToFormData(body);
<<<<<<< HEAD
  const { data } = await api.post("/activities", payload, {
=======
  return await api.post("/activities", payload, {
>>>>>>> d1006d5a3f81168775557fa0498b538d3dcbbd83
    headers: {
      "Content-Type": undefined,
    },
  });
<<<<<<< HEAD
  return data;
=======
>>>>>>> d1006d5a3f81168775557fa0498b538d3dcbbd83
}

/** PUT /activities/:id */
export async function updateActivity(
  id: string,
  body: UpdateActivityInput | FormData,
): Promise<{ message: string; id?: string }> {
  const payload = body instanceof FormData ? body : objectToFormData(body);
  return await api.put(`/activities/${id}`, payload, {
    headers: {
      "Content-Type": undefined,
    },
  });
}

/** PATCH /activities/:id/status */
export async function updateActivityStatus(
  id: string,
  body: UpdateActivityStatusInput,
): Promise<{ message: string }> {
  return await api.patch(`/activities/${id}/status`, body);
}

/** DELETE /activities/:id */
export async function deleteActivity(id: string): Promise<{ message: string }> {
  return await api.delete(`/activities/${id}`);
}

// ── Progress Report API ───────────────────────────────────────────────────
/** GET /progress-reports */
export async function getProgressReports(params?: {
  activity_id?: string;
  page?: number;
  limit?: number;
}): Promise<{
  data: { reports: ProgressReport[]; pagination: PaginationMeta };
}> {
  const data = await api.get("/progress-reports", { params }); // ✅ TANPA destructure
  return data;
}

/** GET /progress-reports/:id */
export async function getProgressReport(
  id: string,
): Promise<{ data: ProgressReport }> {
  return await api.get(`/progress-reports/${id}`);
}

/** POST /progress-reports */
export async function createProgressReport(
  body: CreateProgressReportInput,
): Promise<{ message: string; id?: string }> {
  return await api.post("/progress-reports", body);
}
/** PUT /progress-reports/:id */
export async function updateProgressReport(
  id: string,
  body: UpdateProgressReportInput,
): Promise<{ message: string; id?: string }> {
  return await api.put(`/progress-reports/${id}`, body);
}
/** DELETE /progress-reports/:id */
export async function deleteProgressReport(
  id: string,
): Promise<{ message: string }> {
  return await api.delete(`/progress-reports/${id}`);
}

// ── LPJ API ───────────────────────────────────────────────────────────────

/** GET /lpj/activity/:activity_id */
export async function getLpjByActivity(
  activityId: string,
): Promise<{ data: LPJ | null }> {
  try {
    const data = await api.get(`/lpj/activity/${activityId}`);
    return data;
  } catch (err: any) {
    if (err?.response?.status === 404) return { data: null };
    throw err;
  }
}
/** POST /lpj */
export async function createLpj(
  formData: FormData,
): Promise<{ message: string; id?: string }> {
  return await api.post("/lpj", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

/** PUT /lpj/:id */
export async function updateLpj(
  id: string,
  formData: FormData,
): Promise<{ message: string; id?: string }> {
  return await api.put(`/lpj/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

/** DELETE /lpj/:id */
export async function deleteLpj(id: string): Promise<{ message: string }> {
  return await api.delete(`/lpj/${id}`);
}

// ── Progress Report Document API (/documents/*) ───────────────────────────

/** GET /documents/report/:report_id */
export async function getDocumentsByReport(
  reportId: string,
): Promise<{ data: { count: number; documents: ProgressDocument[] } }> {
  return await api.get(`/documents/report/${reportId}`);
}

/** GET /documents/:id */
export async function getDocument(
  id: string,
): Promise<{ data: ProgressDocument }> {
  return await api.get(`/documents/${id}`);
}

/** POST /documents */
export async function createDocument(
  formData: FormData,
): Promise<{ message: string; id?: string }> {
  return await api.post("/documents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

/** PUT /documents/:id */
export async function updateDocument(
  id: string,
  formData: FormData,
): Promise<{ message: string; id?: string }> {
  return await api.put(`/documents/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

/** DELETE /documents/:id */
export async function deleteDocument(id: string): Promise<{ message: string }> {
  return await api.delete(`/documents/${id}`);
}
