import { api } from "@/lib/api/client";
import { objectToFormData } from "@/lib/utils";
import {
  CreateActivityInput,
  UpdateActivityInput,
  UpdateActivityStatusInput,
  UpdateActivityFeaturedInput,
  CreateProgressReportInput,
  UpdateProgressReportInput,
  CreateLpjInput,
  ActivityStatus,
} from "@/lib/validations/activity-schema";

export type {
  CreateActivityInput,
  UpdateActivityInput,
  UpdateActivityStatusInput,
  UpdateActivityFeaturedInput,
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
  is_featured: boolean;
  thumbnail: string;
  created_at: string;
  updated_at: string;
}

type ActivityApiItem = Omit<Activity, "status" | "is_featured"> & {
  status?: string;
  is_featured?: boolean | number | string;
};

const normalizeBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string")
    return value.toLowerCase() === "true" || value === "1";
  return false;
};

const normalizeActivity = (activity: ActivityApiItem): Activity => {
  const status = String(
    activity.status ?? "pending",
  ).toLowerCase() as ActivityStatus;
  return {
    ...activity,
    status,
    is_featured: normalizeBoolean(activity.is_featured),
  };
};

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
  sort?: string;
  order?: "ASC" | "DESC";
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
  const activities =
    data?.data?.activities?.map((activity: ActivityApiItem) =>
      normalizeActivity(activity),
    ) ?? [];
  return {
    ...data,
    data: {
      ...data.data,
      activities,
    },
  };
}

/** GET /activities/:id */
export async function getActivity(id: string): Promise<{ data: Activity }> {
  const data = await api.get(`/activities/${id}`);
  return {
    ...data,
    data: normalizeActivity(data.data as ActivityApiItem),
  };
}

/** POST /activities */
export async function createActivity(
  body: CreateActivityInput | FormData,
): Promise<{ message: string; id?: string }> {
  const payload = body instanceof FormData ? body : objectToFormData(body);
  return await api.post("/activities", payload, {
    headers: {
      "Content-Type": undefined,
    },
  });
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
  const statusMap: Record<string, string> = {
    pending: "perencanaan",
    ongoing: "berjalan",
    completed: "selesai",
    cancelled: "dibatalkan",
    perencanaan: "pending",
    berjalan: "ongoing",
    selesai: "completed",
    dibatalkan: "cancelled",
  };

  try {
    return await api.patch(`/activities/${id}/status`, body);
  } catch {
    const fallbackStatus =
      statusMap[String(body.status)] ?? String(body.status);
    return await api.patch(`/activities/${id}/status`, {
      status: fallbackStatus,
    });
  }
}

/** PATCH /activities/:id/featured */
export async function updateActivityFeatured(
  id: string,
  body: UpdateActivityFeaturedInput,
): Promise<{ message: string }> {
  try {
    return await api.patch(`/activities/${id}/featured`, body);
  } catch {
    try {
      return await api.patch(`/activities/${id}/featured`, {
        featured: body.is_featured,
      });
    } catch {
      return await api.patch(`/activities/${id}/featured`);
    }
  }
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
  search?: string;
  sort?: string;
  order?: "ASC" | "DESC";
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
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response
      ?.status;
    if (status === 404) return { data: null };
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
