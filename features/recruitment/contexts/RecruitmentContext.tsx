"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";

import {
  getRecruitments,
  getRecruitment,
  createRecruitment,
  updateRecruitment,
  deleteRecruitment,
  getRegistrants,
  updateRegistrantStatus,
  Recruitment,
  Registrant,
  RegistrantStatus,
} from "@/features/recruitment/services/recruitmentService";

interface RecruitmentContextType {
  // Recruitments Data
  recruitments: Recruitment[];
  pagination: any;

  // Filters for Recruitments
  search: string;
  setSearch: (s: string) => void;
  page: number;
  setPage: (p: number) => void;
  limit: number;
  statusFilter: string;
  setStatusFilter: (s: string) => void;

  // Actions for Recruitments
  createRecruitment: (data: any) => Promise<any>;
  updateRecruitment: (args: { id: string; data: any }) => Promise<any>;
  deleteRecruitment: (id: string) => Promise<any>;

  // Registrants State
  activeRecruitmentId: string | null;
  setActiveRecruitmentId: (id: string | null) => void;
  registrants: Registrant[];
  registrantsPagination: any;
  activeRecruitmentDetails: Recruitment | null;

  // Filters for Registrants
  registrantSearch: string;
  setRegistrantSearch: (s: string) => void;
  registrantPage: number;
  setRegistrantPage: (p: number) => void;
  registrantStatusFilter: string;
  setRegistrantStatusFilter: (s: string) => void;

  // Actions for Registrants
  updateRegistrantStatus: (args: {
    recruitmentId: string;
    registrantId: string;
    status: RegistrantStatus;
  }) => Promise<any>;

  // Loaders
  isFetchingRecruitments: boolean;
  isFetchingRegistrants: boolean;
  isFetchingRecruitmentDetails: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isUpdatingStatus: boolean;
}

const RecruitmentContext = createContext<RecruitmentContextType | undefined>(
  undefined,
);

export const useRecruitmentContext = () => {
  const context = useContext(RecruitmentContext);
  if (!context) {
    throw new Error(
      "useRecruitmentContext must be used within RecruitmentProvider",
    );
  }
  return context;
};

export const RecruitmentProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const queryClient = useQueryClient();

  // -- Recruitments State --
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");
  const [debounceSearch] = useDebounce(search, 500);

  // -- Registrants State --
  const [activeRecruitmentId, setActiveRecruitmentId] = useState<string | null>(
    null,
  );
  const [registrantSearch, setRegistrantSearch] = useState("");
  const [registrantPage, setRegistrantPage] = useState(1);
  const [registrantStatusFilter, setRegistrantStatusFilter] = useState("all");
  const [debounceRegistrantSearch] = useDebounce(registrantSearch, 500);

  // Queries for Recruitments
  const { data: recruitmentsData, isLoading: isFetchingRecruitments } =
    useQuery({
      queryKey: [
        "recruitments",
        "list",
        page,
        limit,
        debounceSearch,
        statusFilter,
      ],
      queryFn: () =>
        getRecruitments({
          page,
          limit,
          search: debounceSearch || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
        }),
    });

  const recruitments = recruitmentsData?.data?.recruitments || [];
  const pagination = recruitmentsData?.data?.pagination || null;

  // Queries for Registrants & Details
  const {
    data: activeRecruitmentData,
    isLoading: isFetchingRecruitmentDetails,
  } = useQuery({
    queryKey: ["recruitments", activeRecruitmentId],
    queryFn: () => getRecruitment(activeRecruitmentId!),
    enabled: !!activeRecruitmentId,
  });

  const { data: registrantsData, isLoading: isFetchingRegistrants } = useQuery({
    queryKey: [
      "recruitments",
      activeRecruitmentId,
      "registrants",
      registrantPage,
      limit,
      debounceRegistrantSearch,
      registrantStatusFilter,
    ],
    queryFn: () =>
      getRegistrants(activeRecruitmentId!, {
        page: registrantPage,
        limit,
        search: debounceRegistrantSearch || undefined,
        status:
          registrantStatusFilter !== "all" ? registrantStatusFilter : undefined,
      }),
    enabled: !!activeRecruitmentId,
  });

  const activeRecruitmentDetails = activeRecruitmentData?.data || null;
  const registrants = registrantsData?.data?.registrants || [];
  const registrantsPagination = registrantsData?.data?.pagination || null;

  // Mutations
  const invalidateRecruitments = () => {
    queryClient.invalidateQueries({ queryKey: ["recruitments"] });
  };

  const createMutation = useMutation({
    mutationFn: createRecruitment,
    onSuccess: () => invalidateRecruitments(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateRecruitment(id, data),
    onSuccess: () => invalidateRecruitments(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRecruitment,
    onSuccess: () => invalidateRecruitments(),
  });

  const updateRegistrantStatusMutation = useMutation({
    mutationFn: ({
      recruitmentId,
      registrantId,
      status,
    }: {
      recruitmentId: string;
      registrantId: string;
      status: RegistrantStatus;
    }) => updateRegistrantStatus(recruitmentId, registrantId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recruitments", activeRecruitmentId, "registrants"],
      });
    },
  });

  const contextValue = useMemo(
    () => ({
      // Recruitments Data
      recruitments,
      pagination,
      search,
      setSearch,
      page,
      setPage,
      limit,
      statusFilter,
      setStatusFilter,

      // Actions for Recruitments
      createRecruitment: createMutation.mutateAsync,
      updateRecruitment: updateMutation.mutateAsync,
      deleteRecruitment: deleteMutation.mutateAsync,

      // Registrants Data
      activeRecruitmentId,
      setActiveRecruitmentId,
      activeRecruitmentDetails,
      registrants,
      registrantsPagination,
      registrantSearch,
      setRegistrantSearch,
      registrantPage,
      setRegistrantPage,
      registrantStatusFilter,
      setRegistrantStatusFilter,

      // Actions for Registrants
      updateRegistrantStatus: updateRegistrantStatusMutation.mutateAsync,

      // Loaders
      isFetchingRecruitments,
      isFetchingRegistrants,
      isFetchingRecruitmentDetails,
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,
      isUpdatingStatus: updateRegistrantStatusMutation.isPending,
    }),
    [
      recruitments,
      pagination,
      search,
      page,
      limit,
      statusFilter,
      activeRecruitmentId,
      activeRecruitmentDetails,
      registrants,
      registrantsPagination,
      registrantSearch,
      registrantPage,
      registrantStatusFilter,
      createMutation,
      updateMutation,
      deleteMutation,
      updateRegistrantStatusMutation,
      isFetchingRecruitments,
      isFetchingRegistrants,
      isFetchingRecruitmentDetails,
    ],
  );

  return (
    <RecruitmentContext.Provider value={contextValue}>
      {children}
    </RecruitmentContext.Provider>
  );
};
