"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import {
  getDocumentations,
  getAdminDocumentations,
  getDocumentation,
  createDocumentation,
  updateDocumentation,
  deleteDocumentation,
  archiveDocumentation,
  activateDocumentation,
  bulkArchiveDocumentations,
  bulkDeleteDocumentations,
  getDocumentationStatistics,
  Documentation,
  CreateDocumentationInput,
  UpdateDocumentationInput,
  DocumentCategory,
  DocumentationStatus,
  DocumentationQueryParams,
  DocumentationStatistics,
} from "@/features/documentation/services/documentationService";
import { getErrorMessage } from "@/lib/api/client";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/permissions";

interface DocumentationContextType {
  documents: Documentation[];
  isFetchingDocuments: boolean;
  statistics: DocumentationStatistics | null;
  isFetchingStatistics: boolean;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  search: string;
  setSearch: (search: string) => void;
  typeFilter: DocumentCategory | undefined;
  setTypeFilter: (type: DocumentCategory | undefined) => void;
  statusFilter: DocumentationStatus | undefined;
  setStatusFilter: (status: DocumentationStatus | undefined) => void;
  activityFilter: string;
  setActivityFilter: (activityId: string) => void;
  creatorFilter: string;
  setCreatorFilter: (creatorId: string) => void;
  refreshDocuments: () => Promise<void>;

  createDocument: (args: { data: CreateDocumentationInput }) => Promise<{
    message: string;
    id?: string;
  }>;
  updateDocument: (args: {
    id: string;
    data: UpdateDocumentationInput;
  }) => Promise<{
    message: string;
    id?: string;
  }>;
  deleteDocument: (id: string) => Promise<{ message: string }>;
  archiveDocument: (id: string) => Promise<{ message: string }>;
  activateDocument: (id: string) => Promise<{ message: string }>;
  bulkArchiveDocuments: (ids: string[]) => Promise<{ message: string }>;
  bulkDeleteDocuments: (ids: string[]) => Promise<{ message: string }>;
  getDocumentationById: (id: string) => Promise<{ data: Documentation }>;
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
  const { can } = usePermission();

  const extractDocuments = (payload: unknown): Documentation[] => {
    if (Array.isArray(payload)) {
      return payload as Documentation[];
    }

    if (!payload || typeof payload !== "object") {
      return [];
    }

    const record = payload as Record<string, unknown>;
    const nestedData = record.data as unknown;

    const candidates: unknown[] = [
      record.documents,
      record.documentations,
      record.items,
      nestedData,
    ];

    if (nestedData && typeof nestedData === "object") {
      const nestedRecord = nestedData as Record<string, unknown>;
      candidates.push(
        nestedRecord.documents,
        nestedRecord.documentations,
        nestedRecord.items,
      );
    }

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate as Documentation[];
      }
    }

    return [];
  };

  const extractStatistics = (
    payload: unknown,
  ): DocumentationStatistics | null => {
    if (!payload || typeof payload !== "object") {
      return null;
    }

    const record = payload as Record<string, unknown>;
    const nestedData = record.data;

    if (nestedData && typeof nestedData === "object") {
      const nestedRecord = nestedData as Record<string, unknown>;
      if (
        "total_documents" in nestedRecord &&
        "by_type" in nestedRecord &&
        "by_status" in nestedRecord &&
        "recent_added" in nestedRecord
      ) {
        return nestedRecord as unknown as DocumentationStatistics;
      }
    }

    if (
      "total_documents" in record &&
      "by_type" in record &&
      "by_status" in record &&
      "recent_added" in record
    ) {
      return record as unknown as DocumentationStatistics;
    }

    return null;
  };

  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debounceSearch] = useDebounce(search, 500);
  const [typeFilter, setTypeFilter] = useState<DocumentCategory | undefined>();
  const [statusFilter, setStatusFilter] = useState<
    DocumentationStatus | undefined
  >();
  const [activityFilter, setActivityFilter] = useState("");
  const [creatorFilter, setCreatorFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const canViewDocumentations = can(PERMISSIONS.VIEW_DOCUMENTATIONS);
  const canViewAllDocumentations = can(PERMISSIONS.VIEW_ALL_DOCUMENTATIONS);

  const queryParams = useMemo<DocumentationQueryParams>(() => {
    const params: DocumentationQueryParams = {};
    if (debounceSearch) params.search = debounceSearch;
    if (typeFilter) params.tipe_dokumen = typeFilter;
    if (statusFilter) params.status = statusFilter;
    if (activityFilter) params.activity_id = activityFilter;
    if (creatorFilter) params.dibuat_oleh = creatorFilter;
    return params;
  }, [debounceSearch, typeFilter, statusFilter, activityFilter, creatorFilter]);

  const {
    data: documentsData,
    isLoading: isFetchingDocuments,
    refetch,
  } = useQuery({
    queryKey: [
      "documentations",
      queryParams,
      canViewDocumentations,
      canViewAllDocumentations,
    ],
    queryFn: async () => {
      const response = canViewAllDocumentations
        ? await getAdminDocumentations(queryParams)
        : await getDocumentations();
      return extractDocuments(response);
    },
    enabled: canViewDocumentations || canViewAllDocumentations,
  });

  const documents = documentsData ?? [];

  const { data: statisticsData, isLoading: isFetchingStatistics } = useQuery({
    queryKey: ["documentations", "statistics"],
    queryFn: () => getDocumentationStatistics(),
    enabled: canViewAllDocumentations,
  });

  const statistics = extractStatistics(statisticsData);

  const refreshDocuments = async () => {
    await refetch();
  };

  const createDocumentMutation = useMutation({
    mutationFn: (data: CreateDocumentationInput) => createDocumentation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentations"] });
      toast.success("Documentation created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });

  const updateDocumentMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateDocumentationInput;
    }) => updateDocumentation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentations"] });
      toast.success("Documentation updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: deleteDocumentation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentations"] });
      toast.success("Documentation deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });

  const archiveDocumentMutation = useMutation({
    mutationFn: archiveDocumentation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentations"] });
      toast.success("Documentation archived successfully");
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });

  const activateDocumentMutation = useMutation({
    mutationFn: activateDocumentation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentations"] });
      toast.success("Documentation activated successfully");
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });

  const bulkArchiveDocumentsMutation = useMutation({
    mutationFn: bulkArchiveDocumentations,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentations"] });
      setSelectedIds([]);
      toast.success("Documentations archived successfully");
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });

  const bulkDeleteDocumentsMutation = useMutation({
    mutationFn: bulkDeleteDocumentations,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentations"] });
      setSelectedIds([]);
      toast.success("Documentations deleted successfully");
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });

  const getDocumentationById = async (id: string) => getDocumentation(id);

  const createDocument = async (args: { data: CreateDocumentationInput }) =>
    createDocumentMutation.mutateAsync(args.data);
  const updateDocument = async (args: {
    id: string;
    data: UpdateDocumentationInput;
  }) => updateDocumentMutation.mutateAsync(args);
  const deleteDocument = async (id: string) =>
    deleteDocumentMutation.mutateAsync(id);
  const archiveDocument = async (id: string) =>
    archiveDocumentMutation.mutateAsync(id);
  const activateDocument = async (id: string) =>
    activateDocumentMutation.mutateAsync(id);
  const bulkArchiveDocuments = async (ids: string[]) =>
    bulkArchiveDocumentsMutation.mutateAsync(ids);
  const bulkDeleteDocuments = async (ids: string[]) =>
    bulkDeleteDocumentsMutation.mutateAsync(ids);

  const contextValue = {
    documents,
    isFetchingDocuments,
    statistics,
    isFetchingStatistics,
    search,
    setSearch,
    selectedIds,
    setSelectedIds,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    activityFilter,
    setActivityFilter,
    creatorFilter,
    setCreatorFilter,
    refreshDocuments,

    createDocument,
    updateDocument,
    deleteDocument,
    archiveDocument,
    activateDocument,
    bulkArchiveDocuments,
    bulkDeleteDocuments,
    getDocumentationById,
  };

  return (
    <DocumentationContext.Provider value={contextValue}>
      {children}
    </DocumentationContext.Provider>
  );
};
