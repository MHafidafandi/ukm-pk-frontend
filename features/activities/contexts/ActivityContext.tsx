"use client";
import React, { createContext, useContext, useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import {
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  updateActivityStatus,
  deleteActivity,
  getProgressReports,
  getProgressReport,
  createProgressReport,
  updateProgressReport,
  deleteProgressReport,
  getLpjByActivity,
  createLpj,
  updateLpj,
  deleteLpj,
  getDocumentsByReport,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  Activity,
  ProgressReport,
  LPJ,
  ProgressDocument,
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
  updateActivityStatus: (args: { id: string; data: any }) => Promise<any>;
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
  getProgressReport: (id: string) => Promise<{ data: ProgressReport }>;
  createProgressReport: (data: any) => Promise<any>;
  updateProgressReport: (args: { id: string; data: any }) => Promise<any>;
  deleteProgressReport: (id: string) => Promise<any>;
  // -- LPJ --
  lpj: LPJ | null; // ✅ single object, bukan array
  createLpj: (data: any) => Promise<any>;
  updateLpj: (args: { id: string; data: FormData }) => Promise<any>;
  deleteLpj: (id: string) => Promise<any>;
  // -- Progress Report Documents --
  getDocumentsByReport: (
    reportId: string,
  ) => Promise<{ data: { count: number; documents: ProgressDocument[] } }>;
  getDocument: (id: string) => Promise<{ data: ProgressDocument }>;
  createDocument: (data: FormData) => Promise<any>;
  updateDocument: (args: { id: string; data: FormData }) => Promise<any>;
  deleteDocument: (id: string) => Promise<any>;
  // -- Loaders --
  isFetchingActivities: boolean;
  isFetchingActivityDetails: boolean;
  isFetchingProgressReports: boolean;
  isFetchingLpj: boolean;
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

  // -- Derived Data --
  const activities = activitiesData?.data?.activities || [];
  const pagination = activitiesData?.data?.pagination || null;
  const activeActivityDetails = activeActivityData?.data || null;
  const progressReports = progressReportsData?.data?.reports || [];
  const progressReportsPagination =
    progressReportsData?.data?.pagination || null;
  const lpj = lpjData?.data ?? null; // ✅ single LPJ | null

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

  const updateActivityStatusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateActivityStatus(id, data),
    onSuccess: () => {
      invalidateActivities();
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

  const updateLpjMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      updateLpj(id, data),
    onSuccess: invalidateLpj,
  });

  const deleteLpjMutation = useMutation({
    mutationFn: deleteLpj,
    onSuccess: invalidateLpj,
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
      updateActivityStatus: updateActivityStatusMutation.mutateAsync,
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
      getProgressReport,
      createProgressReport: createProgressReportMutation.mutateAsync,
      updateProgressReport: updateProgressReportMutation.mutateAsync,
      deleteProgressReport: deleteProgressReportMutation.mutateAsync,
      // LPJ
      lpj, // ✅ ganti lpjList → lpj
      createLpj: createLpjMutation.mutateAsync,
      updateLpj: updateLpjMutation.mutateAsync,
      deleteLpj: deleteLpjMutation.mutateAsync,
      // Progress report documents
      getDocumentsByReport,
      getDocument,
      createDocument: createDocument,
      updateDocument: ({ id, data }: { id: string; data: FormData }) =>
        updateDocument(id, data),
      deleteDocument,
      // Loaders
      isFetchingActivities,
      isFetchingActivityDetails,
      isFetchingProgressReports,
      isFetchingLpj,
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
      lpj, // ✅ ganti lpjList → lpj
      createActivityMutation,
      updateActivityMutation,
      updateActivityStatusMutation,
      deleteActivityMutation,
      createProgressReportMutation,
      updateProgressReportMutation,
      deleteProgressReportMutation,
      createLpjMutation,
      updateLpjMutation,
      deleteLpjMutation,
      isFetchingActivities,
      isFetchingActivityDetails,
      isFetchingProgressReports,
      isFetchingLpj,
    ],
  );

  return (
    <ActivityContext.Provider value={contextValue}>
      {children}
    </ActivityContext.Provider>
  );
};
