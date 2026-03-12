import { api } from "@/lib/api/client";
import { objectToFormData } from "@/lib/utils";
import {
  CreateActivityInput,
  UpdateActivityInput,
  CreateProgressReportInput,
  UpdateProgressReportInput,
  CreateLpjInput,
  CreateDocumentationInput,
  ActivityStatus,
  DocumentationType,
} from "@/lib/validations/activity-schema";

export type {
  CreateActivityInput,
  UpdateActivityInput,
  CreateProgressReportInput,
  UpdateProgressReportInput,
  CreateLpjInput,
  CreateDocumentationInput,
  ActivityStatus,
  DocumentationType,
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
  console.log("data", data);
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
  const { data } = await api.post("/activities", payload, {
    headers: {
      "Content-Type": undefined,
    },
  });
  return data;
}

/** PUT /activities/:id */
export async function updateActivity(
  id: string,
  body: UpdateActivityInput | FormData,
): Promise<{ message: string; id?: string }> {
  const payload = body instanceof FormData ? body : objectToFormData(body);
  const { data } = await api.put(`/activities/${id}`, payload, {
    headers: {
      "Content-Type": undefined,
    },
  });
  return data;
}

/** DELETE /activities/:id */
export async function deleteActivity(id: string): Promise<{ message: string }> {
  const { data } = await api.delete(`/activities/${id}`);
  return data;
}

// ── Progress Report API ───────────────────────────────────────────────────
/** GET /progress-reports */
export async function getProgressReports(params?: {
  activity_id?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: { reports: ProgressReport[]; pagination: PaginationMeta } }> {
  const data = await api.get("/progress-reports", { params }); // ✅ TANPA destructure
  return data;
}
/** POST /progress-reports */
export async function createProgressReport(
  body: CreateProgressReportInput,
): Promise<{ message: string; id?: string }> {
  const { data } = await api.post("/progress-reports", body);
  return data;
}
/** PUT /progress-reports/:id */
export async function updateProgressReport(
  id: string,
  body: UpdateProgressReportInput,
): Promise<{ message: string; id?: string }> {
  const { data } = await api.put(`/progress-reports/${id}`, body);
  return data;
}
/** DELETE /progress-reports/:id */
export async function deleteProgressReport(
  id: string,
): Promise<{ message: string }> {
  const { data } = await api.delete(`/progress-reports/${id}`);
  return data;
}


// ── LPJ API ───────────────────────────────────────────────────────────────

export interface LPJ {
  id: string;
  activity_id: string;
  file_url: string;       // ← field baru dari API
  tanggal: string;
  created_at: string;
  updated_at: string;
}

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
  const { data } = await api.post("/lpj", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}


/** DELETE /lpj/:id */
export async function deleteLpj(id: string): Promise<{ message: string }> {
  const { data } = await api.delete(`/lpj/${id}`);
  return data;
}

// ── Documentation API ─────────────────────────────────────────────────────

/** GET /documentations/activity/:activity_id */
export async function getDocumentations(
  activityId: string,
): Promise<{ data: Documentation[] }> {
  const data = await api.get(`/documentations/activity/${activityId}`); // ✅ TANPA destructure
  return data;
}
/** POST /documentations */
export async function createDocumentation(
  body: CreateDocumentationInput | FormData,
): Promise<{ message: string; id?: string }> {
  const payload = body instanceof FormData ? body : objectToFormData(body);
  const { data } = await api.post("/documentations", payload);
  return data;
}
/** DELETE /documentations/:id */
export async function deleteDocumentation(
  id: string,
): Promise<{ message: string }> {
  const { data } = await api.delete(`/documentations/${id}`);
  return data;
}

