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
  acceptRegistrant as apiAccept,
  rejectRegistrant as apiReject,
  getRegistrants,
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
  registrantSearch: string;
  setRegistrantSearch: (s: string) => void;
  registrantPage: number;
  setRegistrantPage: (p: number) => void;
  registrantStatusFilter: string;
  setRegistrantStatusFilter: (s: string) => void;

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

  // --- Recruitment filter states ---
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [debouncedSearch] = useDebounce(searchQuery, 500);

  // --- Registrant filter states ---
  const [registrantSearch, setRegistrantSearch] = useState("");
  const [registrantPage, setRegistrantPage] = useState(1);
  const [registrantStatusFilter, setRegistrantStatusFilter] = useState("all");
  const [debouncedRegistrantSearch] = useDebounce(registrantSearch, 500);

  // --- Active recruitment ---
  const [activeRecruitmentId, setActiveRecruitmentId] = useState<
    string | null
  >(null);

  // ========================
  // QUERIES
  // ========================

  // Recruitment list
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

  // Recruitment detail
  const recruitmentDetailQuery = useQuery({
    queryKey: ["recruitment", activeRecruitmentId],
    queryFn: () => getRecruitmentById(activeRecruitmentId!),
    enabled: !!activeRecruitmentId,
  });

  // Registrants (single query — no duplication)
  const registrantsQuery = useQuery({
    queryKey: [
      "registrants",
      activeRecruitmentId,
      registrantPage,
      limit,
      debouncedRegistrantSearch,
      registrantStatusFilter,
    ],
    queryFn: () =>
      getRegistrants({
        page: registrantPage,
        limit,
        search: debouncedRegistrantSearch || undefined,
        status: registrantStatusFilter !== "all" ? registrantStatusFilter : undefined,
        recruitment_id: activeRecruitmentId!,
      }),
    enabled: !!activeRecruitmentId,
    placeholderData: keepPreviousData,
  });

  // ========================
  // DATA EXTRACTION
  // ========================
  const recruitments = recruitmentsQuery.data?.data?.recruitments ?? [];
  const recruitmentPagination =
    recruitmentsQuery.data?.data?.pagination ?? null;

  const activeRecruitmentDetails =
    recruitmentDetailQuery.data ?? null;

  const registrants = registrantsQuery.data?.data?.registrants ?? [];
  const registrantPagination =
    registrantsQuery.data?.data?.pagination ?? null;

  // ========================
  // INVALIDATION HELPERS
  // ========================
  const invalidateRecruitments = () =>
    qc.invalidateQueries({ queryKey: ["recruitments"] });

  const invalidateRegistrants = () =>
    qc.invalidateQueries({
      queryKey: ["registrants", activeRecruitmentId],
    });

  const invalidateDetail = () =>
    qc.invalidateQueries({
      queryKey: ["recruitment", activeRecruitmentId],
    });

  // ========================
  // MUTATIONS
  // ========================
  const createMut = useMutation({
    mutationFn: (data: CreateRecruitmentDTO) => apiCreate(data),
    onSuccess: () => {
      invalidateRecruitments();
      toast.success("Rekrutmen berhasil ditambahkan");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecruitmentDTO }) =>
      apiUpdate(id, data),
    onSuccess: () => {
      invalidateRecruitments();
      invalidateDetail();
      toast.success("Rekrutmen berhasil diperbarui");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiDelete(id),
    onSuccess: () => {
      invalidateRecruitments();
      toast.success("Rekrutmen berhasil dihapus");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const openMut = useMutation({
    mutationFn: (id: string) => apiOpen(id),
    onSuccess: () => {
      invalidateRecruitments();
      invalidateDetail();
      toast.success("Rekrutmen berhasil dibuka");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const closeMut = useMutation({
    mutationFn: (id: string) => apiClose(id),
    onSuccess: () => {
      invalidateRecruitments();
      invalidateDetail();
      toast.success("Rekrutmen berhasil ditutup");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const archiveMut = useMutation({
    mutationFn: (id: string) => apiArchive(id),
    onSuccess: () => {
      invalidateRecruitments();
      invalidateDetail();
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const acceptMut = useMutation({
    mutationFn: (registrantId: string) => apiAccept(registrantId),
    onSuccess: () => {
      invalidateRegistrants();
      invalidateDetail();
      toast.success("Registrant has been accepted");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const rejectMut = useMutation({
    mutationFn: (registrantId: string) => apiReject(registrantId),
    onSuccess: () => {
      invalidateRegistrants();
      invalidateDetail();
      toast.success("Registrant has been rejected");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  // ========================
  // CONTEXT VALUE
  // ========================
  const value = useMemo<RecruitmentContextType>(
    () => ({
      // Recruitments
      recruitments,
      recruitmentPagination,
      isFetchingRecruitments: recruitmentsQuery.isFetching,

      // Search & filter
      searchQuery,
      setSearchQuery,
      statusFilter,
      setStatusFilter,
      page,
      setPage,

      // Detail
      activeRecruitmentId,
      setActiveRecruitmentId,
      activeRecruitmentDetails,
      isFetchingRecruitmentDetails: recruitmentDetailQuery.isFetching,

      // Registrants
      registrants,
      registrantPagination,
      isFetchingRegistrants: registrantsQuery.isFetching,
      registrantSearch,
      setRegistrantSearch,
      registrantPage,
      setRegistrantPage,
      registrantStatusFilter,
      setRegistrantStatusFilter,

      // CRUD
      createRecruitment: createMut.mutateAsync,
      updateRecruitment: (id: string, data: UpdateRecruitmentDTO) =>
        updateMut.mutateAsync({ id, data }),
      deleteRecruitment: deleteMut.mutateAsync,

      // Status
      openRecruitment: openMut.mutateAsync,
      closeRecruitment: closeMut.mutateAsync,
      archiveRecruitment: archiveMut.mutateAsync,

      // Registrant actions
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
      activeRecruitmentDetails,
      recruitmentDetailQuery.isFetching,
      registrants,
      registrantPagination,
      registrantsQuery.isFetching,
      registrantSearch,
      registrantPage,
      registrantStatusFilter,
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