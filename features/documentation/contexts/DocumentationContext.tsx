"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import {
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  Document,
  CreateDocumentInput,
} from "@/features/documentation/services/documentationService";
import { getErrorMessage } from "@/lib/api/client";

interface DocumentationContextType {
  documents: Document[];
  isFetchingDocuments: boolean;
  search: string;
  setSearch: (search: string) => void;
  kategori: string | undefined;
  setKategori: (kategori: string | undefined) => void;

  createDocument: (args: {
    data: CreateDocumentInput;
    file: File;
  }) => Promise<any>;
  updateDocument: (args: {
    id: string;
    data: Partial<CreateDocumentInput>;
  }) => Promise<any>;
  deleteDocument: (id: string) => Promise<any>;
}

const DocumentationContext = createContext<
  DocumentationContextType | undefined
>(undefined);

export const useDocumentationContext = () => {
  const context = useContext(DocumentationContext);
  if (!context) {
    throw new Error(
      "useDocumentationContext must be used within DocumentationProvider",
    );
  }
  return context;
};

export const DocumentationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debounceSearch] = useDebounce(search, 500);
  const [kategori, setKategori] = useState<string | undefined>();

  const queryParams = useMemo(() => {
    const params: any = {};
    if (debounceSearch) params.search = debounceSearch;
    if (kategori) params.kategori = kategori;
    return params;
  }, [debounceSearch, kategori]);

  const { data: documentsData, isLoading: isFetchingDocuments } = useQuery({
    queryKey: ["documents", "list", queryParams],
    queryFn: () => getDocuments(queryParams),
  });

  const documents = documentsData?.data || [];

  const createDocumentMutation = useMutation({
    mutationFn: ({ data, file }: { data: CreateDocumentInput; file: File }) =>
      createDocument(data, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Dokumen berhasil diunggah");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  const updateDocumentMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateDocumentInput>;
    }) => updateDocument(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Dokumen berhasil diperbarui");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Dokumen berhasil dihapus");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  const contextValue = useMemo(
    () => ({
      documents,
      isFetchingDocuments,
      search,
      setSearch,
      kategori,
      setKategori,

      createDocument: createDocumentMutation.mutateAsync,
      updateDocument: updateDocumentMutation.mutateAsync,
      deleteDocument: deleteDocumentMutation.mutateAsync,
    }),
    [
      documents,
      isFetchingDocuments,
      search,
      kategori,
      createDocumentMutation,
      updateDocumentMutation,
      deleteDocumentMutation,
    ],
  );

  return (
    <DocumentationContext.Provider value={contextValue}>
      {children}
    </DocumentationContext.Provider>
  );
};
