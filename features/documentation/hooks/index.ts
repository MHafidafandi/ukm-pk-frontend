/**
 * Documentation Hooks
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createDocument,
  deleteDocument,
  getDocuments,
  updateDocument,
} from "../api";
import { CreateDocumentInput } from "../types";
import { getErrorMessage } from "@/lib/api/client";

export const documentKeys = {
  all: ["documents"] as const,
  list: (params?: any) => [...documentKeys.all, "list", params] as const,
  detail: (id: string) => [...documentKeys.all, "detail", id] as const,
};

export const useDocuments = (params?: { kategori?: string; search?: string }) =>
  useQuery({
    queryKey: documentKeys.list(params),
    queryFn: () => getDocuments(params),
  });

export const useCreateDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, file }: { data: CreateDocumentInput; file: File }) =>
      createDocument(data, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
      toast.success("Dokumen berhasil diunggah");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateDocumentInput>;
    }) => updateDocument(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
      toast.success("Dokumen berhasil diperbarui");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
      toast.success("Dokumen berhasil dihapus");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};
