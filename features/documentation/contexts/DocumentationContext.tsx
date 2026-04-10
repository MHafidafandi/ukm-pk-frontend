"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import {
  getDocumentations,
  getDocumentation,
  createDocumentation,
  updateDocumentation,
  deleteDocumentation,
  archiveDocumentation,
  activateDocumentation,
  bulkArchiveDocumentations,
  bulkDeleteDocumentations,
  getDocumentationsByActivity,
  getDocumentationsByType,
  getDocumentationsByCreator,
  getRecentDocumentations,
  getMyDocumentations,
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
  viewScope: "all" | "recent" | "my" | "activity" | "type" | "creator";
  setViewScope: (
    scope: "all" | "recent" | "my" | "activity" | "type" | "creator",
  ) => void;
  refreshDocuments: () => Promise<void>;

  createDocument: (args: { data: CreateDocumentationInput }) => Promise<any>;
  updateDocument: (args: {
    id: string;
    data: UpdateDocumentationInput;
  }) => Promise<any>;
  deleteDocument: (id: string) => Promise<any>;
  archiveDocument: (id: string) => Promise<any>;
  activateDocument: (id: string) => Promise<any>;
  bulkArchiveDocuments: (ids: string[]) => Promise<any>;
  bulkDeleteDocuments: (ids: string[]) => Promise<any>;
  getDocumentationById: (id: string) => Promise<any>;
  getDocumentsByActivity: (activityId: string) => Promise<any>;
  getDocumentsByType: (type: DocumentCategory) => Promise<any>;
  getDocumentsByCreator: (creatorId: string) => Promise<any>;
  getRecentDocuments: (limit?: number) => Promise<any>;
  getMyDocuments: () => Promise<any>;
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
  const [viewScope, setViewScope] = useState<
    "all" | "recent" | "my" | "activity" | "type" | "creator"
  >("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
    queryKey: ["documentations", viewScope, queryParams],
    queryFn: async () => {
      if (viewScope === "recent") {
        const response = await getRecentDocumentations(5);
        return extractDocuments(response);
      }

      if (viewScope === "my") {
        const response = await getMyDocumentations();
        return extractDocuments(response);
      }

      if (viewScope === "activity" && activityFilter) {
        const response = await getDocumentationsByActivity(activityFilter);
        return extractDocuments(response);
      }

      if (viewScope === "type" && typeFilter) {
        const response = await getDocumentationsByType(typeFilter);
        return extractDocuments(response);
      }

      if (viewScope === "creator" && creatorFilter) {
        const response = await getDocumentationsByCreator(creatorFilter);
        return extractDocuments(response);
      }

      const response = await getDocumentations(queryParams);
      return extractDocuments(response);
    },
  });

  const documents = documentsData ?? [];

  const { data: statisticsData, isLoading: isFetchingStatistics } = useQuery({
    queryKey: ["documentations", "statistics"],
    queryFn: () => getDocumentationStatistics(),
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
  const getDocumentsByActivity = async (activityId: string) =>
    getDocumentationsByActivity(activityId);
  const getDocumentsByType = async (type: DocumentCategory) =>
    getDocumentationsByType(type);
  const getDocumentsByCreator = async (creatorId: string) =>
    getDocumentationsByCreator(creatorId);
  const getRecentDocuments = async (limit?: number) =>
    getRecentDocumentations(limit);
  const getMyDocuments = async () => getMyDocumentations();

  const contextValue = useMemo(
    () => ({
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
      viewScope,
      setViewScope,
      refreshDocuments,

      createDocument: createDocumentMutation.mutateAsync,
      updateDocument: updateDocumentMutation.mutateAsync,
      deleteDocument: deleteDocumentMutation.mutateAsync,
      archiveDocument: archiveDocumentMutation.mutateAsync,
      activateDocument: activateDocumentMutation.mutateAsync,
      bulkArchiveDocuments: bulkArchiveDocumentsMutation.mutateAsync,
      bulkDeleteDocuments: bulkDeleteDocumentsMutation.mutateAsync,
      getDocumentationById,
      getDocumentsByActivity,
      getDocumentsByType,
      getDocumentsByCreator,
      getRecentDocuments,
      getMyDocuments,
    }),
    [
      documents,
      isFetchingDocuments,
      statistics,
      isFetchingStatistics,
      search,
      selectedIds,
      typeFilter,
      statusFilter,
      activityFilter,
      creatorFilter,
      viewScope,
      refreshDocuments,
      createDocumentMutation,
      updateDocumentMutation,
      deleteDocumentMutation,
      archiveDocumentMutation,
      activateDocumentMutation,
      bulkArchiveDocumentsMutation,
      bulkDeleteDocumentsMutation,
    ],
  );

  return (
    <DocumentationContext.Provider value={contextValue}>
      {children}
    </DocumentationContext.Provider>
  );
};
