// @/features/recruitment/contexts/RecruitmentContext.tsx
"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { getErrorMessage } from "@/lib/api/client";
import {
  Recruitment,
  Registrant,
  Pagination,
  RecruitmentFilters,
  RegistrantFilters,
  CreateRecruitmentDTO,
  UpdateRecruitmentDTO,
  getRecruitments,
  getRecruitmentById,
  createRecruitment as apiCreate,
  updateRecruitment as apiUpdate,
  deleteRecruitment as apiDelete,
  openRecruitment as apiOpen,
  closeRecruitment as apiClose,
  archiveRecruitment as apiArchive,
  getRegistrants,
  acceptRegistrant as apiAccept,
  rejectRegistrant as apiReject,
} from "@/features/recruitment/services/recruitmentService";

// ========================
// CONTEXT TYPE
// ========================

type RecruitmentContextType = {
  // Recruitments
  recruitments: Recruitment[];
  recruitmentPagination: Pagination | null;
  isFetchingRecruitments: boolean;

  // Search & filter
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  page: number;
  setPage: (p: number) => void;

  // Single recruitment detail
  activeRecruitmentId: string | null;
  setActiveRecruitmentId: (id: string | null) => void;
  activeRecruitmentDetails: Recruitment | null;
  isFetchingRecruitmentDetails: boolean;

  // Registrants
  registrants: Registrant[];
  registrantPagination: Pagination | null;
  isFetchingRegistrants: boolean;
  registrantFilters: RegistrantFilters;
  setRegistrantFilters: React.Dispatch<
    React.SetStateAction<RegistrantFilters>
  >;

  // Recruitment CRUD
  createRecruitment: (data: CreateRecruitmentDTO) => Promise<any>;
  updateRecruitment: (id: string, data: UpdateRecruitmentDTO) => Promise<any>;
  deleteRecruitment: (id: string) => Promise<any>;

  // Status actions
  openRecruitment: (id: string) => Promise<any>;
  closeRecruitment: (id: string) => Promise<any>;
  archiveRecruitment: (id: string) => Promise<any>;

  // Registrant actions
  acceptRegistrant: (registrantId: string) => Promise<any>;
  rejectRegistrant: (registrantId: string) => Promise<any>;
};

const RecruitmentContext = createContext<RecruitmentContextType | null>(null);

export const useRecruitmentContext = () => {
  const ctx = useContext(RecruitmentContext);
  if (!ctx)
    throw new Error(
      "useRecruitmentContext must be used within RecruitmentProvider"
    );
  return ctx;
};

// ========================
// PROVIDER
// ========================

export const RecruitmentProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const qc = useQueryClient();

  // --- Filter states ---
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [debouncedSearch] = useDebounce(searchQuery, 500);

  const [registrantFilters, setRegistrantFilters] =
    useState<RegistrantFilters>({ page: 1, limit: 10 });
  const [activeRecruitmentId, setActiveRecruitmentId] = useState<
    string | null
  >(null);

  // --- Queries ---

  const recruitmentsQuery = useQuery({
    queryKey: ["recruitments", page, limit, debouncedSearch, statusFilter],
    queryFn: () =>
      getRecruitments({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const recruitmentDetailQuery = useQuery({
    queryKey: ["recruitment", activeRecruitmentId],
    queryFn: () => getRecruitmentById(activeRecruitmentId!),
    enabled: !!activeRecruitmentId,
  });

  // Registrants — auto-fetch when activeRecruitmentId is set
  const registrantsQuery = useQuery({
    queryKey: ["registrants", activeRecruitmentId, registrantFilters],
    queryFn: () =>
      getRegistrants({
        ...registrantFilters,
        recuruit_id: activeRecruitmentId!,
      }),
    enabled: !!activeRecruitmentId,
  });

  // --- Data extraction (matches donation pattern) ---
  // getRecruitments returns the already-unwrapped JSON body:
  // { data: { recruitments: [...], pagination: {...} } }
  const recruitments = recruitmentsQuery.data?.data?.recruitments ?? [];
  const recruitmentPagination =
    recruitmentsQuery.data?.data?.pagination ?? null;

  const registrants = registrantsQuery.data?.data?.registrants ?? [];
  const registrantPagination =
    registrantsQuery.data?.data?.pagination ?? null;

  // --- Invalidation helper ---
  const invalidateRecruitments = () =>
    qc.invalidateQueries({ queryKey: ["recruitments"] });
  const invalidateRegistrants = () =>
    qc.invalidateQueries({ queryKey: ["registrants"] });
  const invalidateDetail = () =>
    qc.invalidateQueries({
      queryKey: ["recruitment", activeRecruitmentId],
    });

  // --- Mutations ---

  const createMut = useMutation({
    mutationFn: (data: CreateRecruitmentDTO) => apiCreate(data),
    onSuccess: () => {
      invalidateRecruitments();
      toast.success("recruitment successfully added");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecruitmentDTO }) =>
      apiUpdate(id, data),
    onSuccess: () => {
      invalidateRecruitments();
      invalidateDetail();
      toast.success("recruitment successfully updated");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiDelete(id),
    onSuccess: () => {
      invalidateRecruitments();
      toast.success("recruitment successfully deleted");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const openMut = useMutation({
    mutationFn: (id: string) => apiOpen(id),
    onSuccess: () => {
      invalidateRecruitments();
      invalidateDetail();
      toast.success("recruitment successfully opened");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const closeMut = useMutation({
    mutationFn: (id: string) => apiClose(id),
    onSuccess: () => {
      invalidateRecruitments();
      invalidateDetail();
      toast.success("recruitment successfully closed");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const archiveMut = useMutation({
    mutationFn: (id: string) => apiArchive(id),
    onSuccess: () => {
      invalidateRecruitments();
      invalidateDetail();
      toast.success("recruitment successfully archived");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const acceptMut = useMutation({
    mutationFn: (registrantId: string) => apiAccept(registrantId),
    onSuccess: () => {
      invalidateRegistrants();
      toast.success("recruitment successfully accepted");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const rejectMut = useMutation({
    mutationFn: (registrantId: string) => apiReject(registrantId),
    onSuccess: () => {
      invalidateRegistrants();
      toast.success("recruitment successfully rejected");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  // --- Value ---
  const value = useMemo<RecruitmentContextType>(
    () => ({
      recruitments,
      recruitmentPagination,
      isFetchingRecruitments: recruitmentsQuery.isFetching,

      searchQuery,
      setSearchQuery,
      statusFilter,
      setStatusFilter,
      page,
      setPage,

      activeRecruitmentId,
      setActiveRecruitmentId,
      activeRecruitmentDetails: recruitmentDetailQuery.data ?? null,
      isFetchingRecruitmentDetails: recruitmentDetailQuery.isFetching,

      registrants,
      registrantPagination,
      isFetchingRegistrants: registrantsQuery.isFetching,
      registrantFilters,
      setRegistrantFilters,

      createRecruitment: createMut.mutateAsync,
      updateRecruitment: (id: string, data: UpdateRecruitmentDTO) =>
        updateMut.mutateAsync({ id, data }),
      deleteRecruitment: deleteMut.mutateAsync,
      openRecruitment: openMut.mutateAsync,
      closeRecruitment: closeMut.mutateAsync,
      archiveRecruitment: archiveMut.mutateAsync,
      acceptRegistrant: acceptMut.mutateAsync,
      rejectRegistrant: rejectMut.mutateAsync,
    }),
    [
      recruitments,
      recruitmentPagination,
      recruitmentsQuery.isFetching,
      searchQuery,
      statusFilter,
      page,
      activeRecruitmentId,
      recruitmentDetailQuery.data,
      recruitmentDetailQuery.isFetching,
      registrants,
      registrantPagination,
      registrantsQuery.isFetching,
      registrantFilters,
      createMut,
      updateMut,
      deleteMut,
      openMut,
      closeMut,
      archiveMut,
      acceptMut,
      rejectMut,
    ]
  );

  return (
    <RecruitmentContext.Provider value={value}>
      {children}
    </RecruitmentContext.Provider>
  );
};