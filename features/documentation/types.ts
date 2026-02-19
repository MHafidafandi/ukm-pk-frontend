/**
 * Documentation Feature Types
 */

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
