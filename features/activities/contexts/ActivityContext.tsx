/* eslint-disable @typescript-eslint/no-explicit-any */
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
  updateActivityFeatured,
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
  sort: string;
  setSort: (s: string) => void;
  order: "ASC" | "DESC";
  setOrder: (o: "ASC" | "DESC") => void;
  createActivity: (data: any) => Promise<any>;
  updateActivity: (args: { id: string; data: any }) => Promise<any>;
  updateActivityStatus: (args: { id: string; data: any }) => Promise<any>;
  updateActivityFeatured: (args: {
    id: string;
    data: { is_featured: boolean };
  }) => Promise<any>;
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
  progressReportSearch: string;
  setProgressReportSearch: (s: string) => void;
  progressReportSort: string;
  setProgressReportSort: (s: string) => void;
  progressReportOrder: "ASC" | "DESC";
  setProgressReportOrder: (o: "ASC" | "DESC") => void;
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
  const [sort, setSort] = useState("tanggal");
  const [order, setOrder] = useState<"ASC" | "DESC">("DESC");
  const [debounceSearch] = useDebounce(search, 500);

  // Active Context State
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);

  // Progress Reports State
  const [progressReportPage, setProgressReportPage] = useState(1);
  const [progressReportSearch, setProgressReportSearchRaw] = useState("");
  const [progressReportSort, setProgressReportSortRaw] = useState("created_at");
  const [progressReportOrder, setProgressReportOrderRaw] = useState<
    "ASC" | "DESC"
  >("DESC");
  const [debounceProgressReportSearch] = useDebounce(progressReportSearch, 500);

  // -- Queries --
  const { data: activitiesData, isLoading: isFetchingActivities } = useQuery({
    queryKey: [
      "activities",
      "list",
      page,
      limit,
      debounceSearch,
      statusFilter,
      sort,
      order,
    ],
    queryFn: () =>
      getActivities({
        page,
        limit,
        search: debounceSearch || undefined,
        status:
          statusFilter && statusFilter !== "all" ? statusFilter : undefined,
        sort: sort || undefined,
        order: order || undefined,
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
        debounceProgressReportSearch,
        progressReportSort,
        progressReportOrder,
      ],
      queryFn: () =>
        getProgressReports({
          activity_id: activeActivityId!,
          page: progressReportPage,
          limit,
          search: debounceProgressReportSearch || undefined,
          sort: progressReportSort || undefined,
          order: progressReportOrder,
        }),
      enabled: !!activeActivityId,
    });

  const { data: lpjData, isLoading: isFetchingLpj } = useQuery({
    queryKey: ["activities", activeActivityId, "lpj"],
    queryFn: () => getLpjByActivity(activeActivityId!),
    enabled: !!activeActivityId,
  });

  // -- Derived Data --
  const activities = useMemo(
    () => activitiesData?.data?.activities || [],
    [activitiesData?.data?.activities],
  );
  const pagination = useMemo(
    () => activitiesData?.data?.pagination || null,
    [activitiesData?.data?.pagination],
  );
  const activeActivityDetails = activeActivityData?.data || null;
  const progressReports = useMemo(
    () => progressReportsData?.data?.reports || [],
    [progressReportsData?.data?.reports],
  );
  const progressReportsPagination = useMemo(
    () => progressReportsData?.data?.pagination || null,
    [progressReportsData?.data?.pagination],
  );
  const lpj = lpjData?.data ?? null; // ✅ single LPJ | null

  // -- Invalidators --
  const invalidateActivities = () => {
    queryClient.invalidateQueries({ queryKey: ["activities", "list"] });
    queryClient.invalidateQueries({ queryKey: ["public", "activities"] });
  };

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
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["activities", "list"] });

      // Snapshot previous state
      const previousQueries = queryClient.getQueriesData<any>({
        queryKey: ["activities", "list"],
      });

      // Extract form data into object for optimistic update
      let updatedFields: any = {};
      if (data instanceof FormData) {
        for (const [key, value] of data.entries()) {
          if (value instanceof File) {
            updatedFields[key] = URL.createObjectURL(value);
          } else {
            updatedFields[key] = value;
          }
        }
      } else {
        updatedFields = data;
      }

      // Optimistic update
      queryClient.setQueriesData<any>(
        { queryKey: ["activities", "list"] },
        (old: any) => {
          if (!old?.data?.activities) return old;
          return {
            ...old,
            data: {
              ...old.data,
              activities: old.data.activities.map((a: Activity) =>
                a.id === id ? { ...a, ...updatedFields } : a,
              ),
            },
          };
        },
      );

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      context?.previousQueries?.forEach(([queryKey, value]: [any, any]) => {
        queryClient.setQueryData(queryKey, value);
      });
    },
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
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["activities", "list"] });

      // Snapshot previous state
      const previousQueries = queryClient.getQueriesData<any>({
        queryKey: ["activities", "list"],
      });

      // Optimistic update - map status ke UI format
      queryClient.setQueriesData<any>(
        { queryKey: ["activities", "list"] },
        (old: any) => {
          if (!old?.data?.activities) return old;
          return {
            ...old,
            data: {
              ...old.data,
              activities: old.data.activities.map((a: Activity) =>
                a.id === id ? { ...a, status: data.status } : a,
              ),
            },
          };
        },
      );

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      context?.previousQueries?.forEach(([queryKey, value]: [any, any]) => {
        queryClient.setQueryData(queryKey, value);
      });
    },
    onSuccess: () => {
      invalidateActivities();
      queryClient.invalidateQueries({
        queryKey: ["activities", activeActivityId],
      });
    },
  });

  const updateActivityFeaturedMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { is_featured: boolean };
    }) => updateActivityFeatured(id, data),

    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["activities", "list"] });

      // Snapshot semua query dengan prefix ["activities", "list"] untuk rollback
      const previousQueries = queryClient.getQueriesData<any>({
        queryKey: ["activities", "list"],
      });

      // Optimistic update semua page yang ada di cache
      queryClient.setQueriesData<any>(
        { queryKey: ["activities", "list"] },
        (old: any) => {
          if (!old?.data?.activities) return old;
          return {
            ...old,
            data: {
              ...old.data,
              activities: old.data.activities.map((a: Activity) =>
                a.id === id ? { ...a, is_featured: data.is_featured } : a,
              ),
            },
          };
        },
      );

      return { previousQueries };
    },

    onError: (_err, _vars, context) => {
      // Rollback semua query ke snapshot sebelumnya
      context?.previousQueries?.forEach(([queryKey, value]: [any, any]) => {
        queryClient.setQueryData(queryKey, value);
      });
    },

    onSuccess: () => {
      invalidateActivities();
      queryClient.invalidateQueries({
        queryKey: ["activities", activeActivityId],
      });
      // Invalidate landing page juga biar sync
      queryClient.invalidateQueries({ queryKey: ["landing", "activities"] });
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
      sort,
      setSort,
      order,
      setOrder,
      createActivity: createActivityMutation.mutateAsync,
      updateActivity: updateActivityMutation.mutateAsync,
      updateActivityStatus: updateActivityStatusMutation.mutateAsync,
      updateActivityFeatured: updateActivityFeaturedMutation.mutateAsync,
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
      progressReportSearch,
      setProgressReportSearch: (s: string) => {
        setProgressReportSearchRaw(s);
        setProgressReportPage(1);
      },
      progressReportSort,
      setProgressReportSort: (s: string) => {
        setProgressReportSortRaw(s);
        setProgressReportPage(1);
      },
      progressReportOrder,
      setProgressReportOrder: (o: "ASC" | "DESC") => {
        setProgressReportOrderRaw(o);
        setProgressReportPage(1);
      },
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
      sort,
      setSort,
      order,
      setOrder,
      activeActivityId,
      activeActivityDetails,
      progressReports,
      progressReportsPagination,
      progressReportPage,
      progressReportSearch,
      progressReportSort,
      progressReportOrder,
      lpj, // ✅ ganti lpjList → lpj
      createActivityMutation,
      updateActivityMutation,
      updateActivityStatusMutation,
      updateActivityFeaturedMutation,
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
