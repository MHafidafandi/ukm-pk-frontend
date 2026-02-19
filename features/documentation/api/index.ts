/**
 * Documentation API
 */
import { api } from "@/lib/api/client";
import { CreateDocumentInput, Document } from "../types";

const DOC_URL = "/documents";

export const getDocuments = (params?: {
  kategori?: string;
  search?: string;
}): Promise<{ data: Document[] }> => {
  return api.get(DOC_URL, { params });
};

export const getDocument = (id: string): Promise<{ data: Document }> => {
  return api.get(`${DOC_URL}/${id}`);
};

export const createDocument = (
  data: CreateDocumentInput,
  file: File,
): Promise<{ data: Document }> => {
  const formData = new FormData();
  formData.append("judul", data.judul);
  if (data.nomor_dokumen) formData.append("nomor_dokumen", data.nomor_dokumen);
  formData.append("kategori", data.kategori);
  formData.append("deskripsi", data.deskripsi);
  formData.append("file", file);

  return api.post(DOC_URL, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateDocument = (
  id: string,
  data: Partial<CreateDocumentInput>,
): Promise<{ data: Document }> => {
  return api.put(`${DOC_URL}/${id}`, data);
};

export const deleteDocument = (id: string): Promise<void> => {
  return api.delete(`${DOC_URL}/${id}`);
};
