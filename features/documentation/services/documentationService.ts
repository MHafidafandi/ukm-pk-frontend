import { api } from "@/lib/api/client";

// ── Types ──────────────────────────────────────────────────────────────────

export type DocumentCategory =
  | "laporan_kegiatan"
  | "surat_keluar"
  | "surat_masuk"
  | "proposal"
  | "lainnya";

export interface Document {
  id: string;
  judul: string;
  nomor_dokumen?: string;
  kategori: DocumentCategory;
  deskripsi: string;
  file_url: string;
  file_type: string; // pdf, docx, etc.
  uploaded_by: string; // User ID or Name
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentInput {
  judul: string;
  nomor_dokumen?: string;
  kategori: DocumentCategory;
  deskripsi: string;
  // file uploaded separately or as part of multipart
}

// ── API Functions ──────────────────────────────────────────────────────────

const DOC_URL = "/documents";

export async function getDocuments(params?: {
  kategori?: string;
  search?: string;
}): Promise<{ data: Document[] }> {
  const { data } = await api.get(DOC_URL, { params });
  return data;
}

export async function getDocument(id: string): Promise<{ data: Document }> {
  const { data } = await api.get(`${DOC_URL}/${id}`);
  return data;
}

export async function createDocument(
  body: CreateDocumentInput,
  file: File,
): Promise<{ data: Document }> {
  const formData = new FormData();
  formData.append("judul", body.judul);
  if (body.nomor_dokumen) formData.append("nomor_dokumen", body.nomor_dokumen);
  formData.append("kategori", body.kategori);
  formData.append("deskripsi", body.deskripsi);
  formData.append("file", file);

  const { data } = await api.post(DOC_URL, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
}

export async function updateDocument(
  id: string,
  body: Partial<CreateDocumentInput>,
): Promise<{ data: Document }> {
  const { data } = await api.put(`${DOC_URL}/${id}`, body);
  return data;
}

export async function deleteDocument(id: string): Promise<void> {
  await api.delete(`${DOC_URL}/${id}`);
}
