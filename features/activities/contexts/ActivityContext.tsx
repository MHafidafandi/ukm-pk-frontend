"use client";
import React, { createContext, useContext, useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import {
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  getProgressReports,
  createProgressReport,
  updateProgressReport,
  deleteProgressReport,
  getLpjByActivity,
  createLpj,
  deleteLpj,
  getDocumentations,
  createDocumentation,
  deleteDocumentation,
  Activity,
  ProgressReport,
  LPJ,
  Documentation,
} from "@/features/activities/services/activityService";

interface ActivityContextType {
  // -- Activities --
  activities: Activity[];
  pagination: any;
  search: string;
  setSearch: (s: string) => void;
  page: number;
  setPage: (p: number) => void;
  limit: number;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  createActivity: (data: any) => Promise<any>;
  updateActivity: (args: { id: string; data: any }) => Promise<any>;
  deleteActivity: (id: string) => Promise<any>;
  // -- Active Activity --
  activeActivityId: string | null;
  setActiveActivityId: (id: string | null) => void;
  activeActivityDetails: Activity | null;
  // -- Progress Reports --
  progressReports: ProgressReport[];
  progressReportsPagination: any;
  progressReportPage: number;
  setProgressReportPage: (p: number) => void;
  createProgressReport: (data: any) => Promise<any>;
  updateProgressReport: (args: { id: string; data: any }) => Promise<any>;
  deleteProgressReport: (id: string) => Promise<any>;
  // -- LPJ --
  lpj: LPJ | null;           // ✅ single object, bukan array
  createLpj: (data: any) => Promise<any>;
  deleteLpj: (id: string) => Promise<any>;
  // -- Documentation --
  documentations: Documentation[];
  createDocumentation: (data: any) => Promise<any>;
  deleteDocumentation: (id: string) => Promise<any>;
  // -- Loaders --
  isFetchingActivities: boolean;
  isFetchingActivityDetails: boolean;
  isFetchingProgressReports: boolean;
  isFetchingLpj: boolean;
  isFetchingDocumentations: boolean;
}

const ActivityContext = createContext<ActivityContextType | undefined>(
  undefined,
);

export const useActivityContext = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error("useActivityContext must be used within ActivityProvider");
  }
  return context;
};

export const ActivityProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const queryClient = useQueryClient();

  // Activities State
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [debounceSearch] = useDebounce(search, 500);

  // Active Context State
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);

  // Progress Reports State
  const [progressReportPage, setProgressReportPage] = useState(1);

  // -- Queries --
  const { data: activitiesData, isLoading: isFetchingActivities } = useQuery({
    queryKey: ["activities", "list", page, limit, debounceSearch, statusFilter],
    queryFn: () =>
      getActivities({
        page,
        limit,
        search: debounceSearch || undefined,
        status:
          statusFilter && statusFilter !== "all" ? statusFilter : undefined,
      }),
  });

  const { data: activeActivityData, isLoading: isFetchingActivityDetails } =
    useQuery({
      queryKey: ["activities", activeActivityId],
      queryFn: () => getActivity(activeActivityId!),
      enabled: !!activeActivityId,
    });

  const { data: progressReportsData, isLoading: isFetchingProgressReports } =
    useQuery({
      queryKey: [
        "activities",
        activeActivityId,
        "progress-reports",
        progressReportPage,
        limit,
      ],
      queryFn: () =>
        getProgressReports({
          activity_id: activeActivityId!,
          page: progressReportPage,
          limit,
        }),
      enabled: !!activeActivityId,
    });

  const { data: lpjData, isLoading: isFetchingLpj } = useQuery({
    queryKey: ["activities", activeActivityId, "lpj"],
    queryFn: () => getLpjByActivity(activeActivityId!),
    enabled: !!activeActivityId,
  });

  const { data: documentationsData, isLoading: isFetchingDocumentations } =
    useQuery({
      queryKey: ["activities", activeActivityId, "documentations"],
      queryFn: () => getDocumentations(activeActivityId!),
      enabled: !!activeActivityId,
    });

  // -- Derived Data --
  const activities = activitiesData?.data?.activities || [];
  const pagination = activitiesData?.data?.pagination || null;
  const activeActivityDetails = activeActivityData?.data || null;
  const progressReports = progressReportsData?.data?.reports || [];
  const progressReportsPagination = progressReportsData?.data?.pagination || null;
  const lpj = lpjData?.data ?? null;           // ✅ single LPJ | null
  const documentations = documentationsData?.data || [];

  // -- Invalidators --
  const invalidateActivities = () =>
    queryClient.invalidateQueries({ queryKey: ["activities", "list"] });

  const invalidateProgressReports = () =>
    queryClient.invalidateQueries({
      queryKey: ["activities", activeActivityId, "progress-reports"],
    });

  const invalidateLpj = () =>
    queryClient.invalidateQueries({
      queryKey: ["activities", activeActivityId, "lpj"],
    });

  const invalidateDocumentations = () =>
    queryClient.invalidateQueries({
      queryKey: ["activities", activeActivityId, "documentations"],
    });

  // -- Mutations --
  const createActivityMutation = useMutation({
    mutationFn: createActivity,
    onSuccess: invalidateActivities,
  });

  const updateActivityMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateActivity(id, data),
    onSuccess: () => {
      invalidateActivities();
      // ✅ Invalidate detail juga supaya ActivityDetail ikut update
      queryClient.invalidateQueries({
        queryKey: ["activities", activeActivityId],
      });
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: deleteActivity,
    onSuccess: invalidateActivities,
  });

  const createProgressReportMutation = useMutation({
    mutationFn: createProgressReport,
    onSuccess: invalidateProgressReports,
  });

  const updateProgressReportMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateProgressReport(id, data),
    onSuccess: invalidateProgressReports,
  });

  const deleteProgressReportMutation = useMutation({
    mutationFn: deleteProgressReport,
    onSuccess: invalidateProgressReports,
  });

  const createLpjMutation = useMutation({
    mutationFn: createLpj,
    onSuccess: invalidateLpj,
  });


  const deleteLpjMutation = useMutation({
    mutationFn: deleteLpj,
    onSuccess: invalidateLpj,
  });

  const createDocumentationMutation = useMutation({
    mutationFn: createDocumentation,
    onSuccess: invalidateDocumentations,
  });

  const deleteDocumentationMutation = useMutation({
    mutationFn: deleteDocumentation,
    onSuccess: invalidateDocumentations,
  });

  const contextValue = useMemo(
    () => ({
      // Activities
      activities,
      pagination,
      search,
      setSearch,
      page,
      setPage,
      limit,
      statusFilter,
      setStatusFilter,
      createActivity: createActivityMutation.mutateAsync,
      updateActivity: updateActivityMutation.mutateAsync,
      deleteActivity: deleteActivityMutation.mutateAsync,
      // Active Context
      activeActivityId,
      setActiveActivityId,
      activeActivityDetails,
      // Progress Reports
      progressReports,
      progressReportsPagination,
      progressReportPage,
      setProgressReportPage,
      createProgressReport: createProgressReportMutation.mutateAsync,
      updateProgressReport: updateProgressReportMutation.mutateAsync,
      deleteProgressReport: deleteProgressReportMutation.mutateAsync,
      // LPJ
      lpj,                                          // ✅ ganti lpjList → lpj
      createLpj: createLpjMutation.mutateAsync,
      deleteLpj: deleteLpjMutation.mutateAsync,
      // Documentations
      documentations,
      createDocumentation: createDocumentationMutation.mutateAsync,
      deleteDocumentation: deleteDocumentationMutation.mutateAsync,
      // Loaders
      isFetchingActivities,
      isFetchingActivityDetails,
      isFetchingProgressReports,
      isFetchingLpj,
      isFetchingDocumentations,
    }),
    [
      activities,
      pagination,
      search,
      page,
      limit,
      statusFilter,
      activeActivityId,
      activeActivityDetails,
      progressReports,
      progressReportsPagination,
      progressReportPage,
      lpj,                                          // ✅ ganti lpjList → lpj
      documentations,
      createActivityMutation,
      updateActivityMutation,
      deleteActivityMutation,
      createProgressReportMutation,
      updateProgressReportMutation,
      deleteProgressReportMutation,
      createLpjMutation,
      deleteLpjMutation,
      createDocumentationMutation,
      deleteDocumentationMutation,
      isFetchingActivities,
      isFetchingActivityDetails,
      isFetchingProgressReports,
      isFetchingLpj,
      isFetchingDocumentations,
    ],
  );

  return (
    <ActivityContext.Provider value={contextValue}>
      {children}
    </ActivityContext.Provider>
  );
};