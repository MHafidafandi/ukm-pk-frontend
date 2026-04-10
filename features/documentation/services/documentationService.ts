import { api } from "@/lib/api/client";

// ── Types ──────────────────────────────────────────────────────────────────

export type DocumentCategory =
  | "laporan_kegiatan"
  | "surat_keluar"
  | "surat_masuk"
  | "proposal"
  | "sop"
  | "template"
  | "panduan"
  | "laporan"
  | "lainnya";

export type DocumentationStatus = "aktif" | "arsip";

export interface Documentation {
  id: string;
  judul: string;
  deskripsi: string;
  tipe_dokumen: DocumentCategory;
  link_gdrive?: string;
  nama_file?: string;
  ukuran_file?: number;
  tipe_file?: string;
  activity_id?: string;
  dibuat_oleh?: string;
  status: DocumentationStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentationInput {
  judul: string;
  deskripsi: string;
  tipe_dokumen: DocumentCategory;
  link_gdrive?: string;
  nama_file?: string;
  ukuran_file?: number;
  tipe_file?: string;
  activity_id?: string;
  status?: DocumentationStatus;
}

export type UpdateDocumentationInput = Partial<CreateDocumentationInput>;

export interface DocumentationPagination {
  total: number;
  page: number;
  total_pages: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface DocumentationListResponse {
  documents: Documentation[];
  pagination?: DocumentationPagination;
}

export interface DocumentationStatistics {
  total_documents: number;
  by_type: Partial<Record<DocumentCategory, number>>;
  by_status: Partial<Record<DocumentationStatus, number>>;
  recent_added: Documentation[];
}

export interface DocumentationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  tipe_dokumen?: DocumentCategory;
  status?: DocumentationStatus;
  activity_id?: string;
  dibuat_oleh?: string;
  order?: string;
  sort?: string;
}

// ── API Functions ──────────────────────────────────────────────────────────

const DOC_URL = "/documentations";

export async function getDocumentations(
  params?: DocumentationQueryParams,
): Promise<{ data: DocumentationListResponse }> {
  const { data } = await api.get(DOC_URL, { params });
  return data;
}

export async function getAdminDocumentations(
  params?: DocumentationQueryParams,
): Promise<{ data: DocumentationListResponse }> {
  const { data } = await api.get(`${DOC_URL}/admin`, { params });
  return data;
}

export async function getDocumentation(
  id: string,
): Promise<{ data: Documentation }> {
  const { data } = await api.get(`${DOC_URL}/${id}`);
  return data;
}

export async function createDocumentation(
  body: CreateDocumentationInput,
): Promise<{ message: string; id?: string }> {
  const { data } = await api.post(DOC_URL, body);
  return data;
}

export async function updateDocumentation(
  id: string,
  body: UpdateDocumentationInput,
): Promise<{ message: string; id?: string }> {
  const { data } = await api.put(`${DOC_URL}/${id}`, body);
  return data;
}

export async function deleteDocumentation(
  id: string,
): Promise<{ message: string }> {
  const { data } = await api.delete(`${DOC_URL}/${id}`);
  return data;
}

export async function archiveDocumentation(
  id: string,
): Promise<{ message: string }> {
  const { data } = await api.patch(`${DOC_URL}/${id}/archive`);
  return data;
}

export async function activateDocumentation(
  id: string,
): Promise<{ message: string }> {
  const { data } = await api.patch(`${DOC_URL}/${id}/activate`);
  return data;
}

export async function bulkArchiveDocumentations(
  documentationIds: string[],
): Promise<{ message: string }> {
  const { data } = await api.post(`${DOC_URL}/bulk/archive`, {
    documentation_ids: documentationIds,
  });
  return data;
}

export async function bulkDeleteDocumentations(
  documentationIds: string[],
): Promise<{ message: string }> {
  const { data } = await api.post(`${DOC_URL}/bulk/delete`, {
    documentation_ids: documentationIds,
  });
  return data;
}

export async function getDocumentationStatistics(): Promise<{
  data: DocumentationStatistics;
}> {
  const { data } = await api.get(`${DOC_URL}/statistics`);
  return data;
}
