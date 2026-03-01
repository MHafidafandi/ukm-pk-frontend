"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import { useDebounce } from "use-debounce";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getUsers,
  getUsersStats,
  createUser,
  deleteUser,
  updateUser,
  activateUser,
  deactivateUser,
  markAsAlumniUser,
  bulkUserStatus,
  assignUserRole,
  removeUserRole,
  assignUserDivision,
  UsersResponse,
  UsersStatsResponse,
} from "@/features/users/services/userService";

interface UserContextType {
  // Data
  users: UsersResponse["data"]["users"];
  pagination: UsersResponse["data"]["pagination"] | null;
  filters: UsersResponse["data"]["filters"] | null;
  stats: UsersStatsResponse["data"] | null;

  // State Methods (Search, Paginate, Filter)
  search: string;
  setSearch: (s: string) => void;
  page: number;
  setPage: (p: number) => void;
  limit: number;
  setLimit: (l: number) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  divisionFilter: string;
  setDivisionFilter: (d: string) => void;
  angkatanFilter: number | undefined;
  setAngkatanFilter: (a: number | undefined) => void;

  // Actions
  createUser: (data: any) => Promise<any>;
  updateUser: (args: { id: string; data: any }) => Promise<any>;
  deleteUser: (id: string) => Promise<any>;
  activateUser: (id: string) => Promise<any>;
  deactivateUser: (id: string) => Promise<any>;
  markAsAlumniUser: (id: string) => Promise<any>;
  bulkUserStatus: (args: { user_ids: string[]; status: any }) => Promise<any>;
  assignUserRole: (args: { id: string; roleIds: string[] }) => Promise<any>;
  removeUserRole: (args: { id: string; roleIds: string[] }) => Promise<any>;
  assignUserDivision: (args: {
    id: string;
    divisionId: string;
  }) => Promise<any>;

  // Loading States
  isFetchingUsers: boolean;
  isFetchingStats: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isActivating: boolean;
  isDeactivating: boolean;
  isMarkingAlumni: boolean;
  isBulkingStatus: boolean;
  isAssigningRole: boolean;
  isRemovingRole: boolean;
  isAssigningDivision: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within UserProvider");
  }
  return context;
};

// ── Helper ─────────────────────────────────────────────────────────────────

const handleError = (err: any, fallback: string) => {
  const message =
    err?.response?.data?.message || err?.response?.data?.error || fallback;
  toast.error(message);
  console.error(err);
};

// ── Provider ───────────────────────────────────────────────────────────────

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  const [search, setSearchRaw] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimitRaw] = useState(10);
  const [statusFilter, setStatusFilterRaw] = useState("");
  const [divisionFilter, setDivisionFilterRaw] = useState("");
  const [angkatanFilter, setAngkatanFilterRaw] = useState<number | undefined>(
    undefined,
  );

  const [debounceSearch] = useDebounce(search, 500);

  // Reset ke page 1 setiap kali filter/search berubah
  const setSearch = (s: string) => {
    setSearchRaw(s);
    setPage(1);
  };
  const setLimit = (l: number) => {
    setLimitRaw(l);
    setPage(1);
  };
  const setStatusFilter = (s: string) => {
    setStatusFilterRaw(s);
    setPage(1);
  };
  const setDivisionFilter = (d: string) => {
    setDivisionFilterRaw(d);
    setPage(1);
  };
  const setAngkatanFilter = (a: number | undefined) => {
    setAngkatanFilterRaw(a);
    setPage(1);
  };

  // ── Queries ──────────────────────────────────────────────────────────────

  const {
    data: userData,
    isLoading: isLoadingUsers,
    isFetching: isFetchingUsers, // ✅ isFetching untuk loading saat refetch
  } = useQuery({
    queryKey: [
      "users",
      "list",
      {
        page,
        limit,
        debounceSearch,
        statusFilter,
        divisionFilter,
        angkatanFilter,
      },
    ],
    queryFn: () =>
      getUsers({
        page,
        limit,
        search: debounceSearch || undefined,
        status: statusFilter || undefined,
        division_id: divisionFilter || undefined,
        angkatan: angkatanFilter,
      }),
    placeholderData: (prev) => prev, // ✅ jaga data lama saat filter berubah (ganti keepPreviousData)
  });

  const { data: statsData, isFetching: isFetchingStats } = useQuery({
    queryKey: ["users", "stats"],
    queryFn: getUsersStats,
  });

  // ── Mutations ─────────────────────────────────────────────────────────────

  const invalidateUsers = () => {
    queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    queryClient.invalidateQueries({ queryKey: ["users", "stats"] });
  };

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => invalidateUsers(),
    onError: (err: any) => handleError(err, "Gagal membuat user"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateUser(id, data),
    onSuccess: () => invalidateUsers(),
    onError: (err: any) => handleError(err, "Gagal mengupdate user"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => invalidateUsers(),
    onError: (err: any) => handleError(err, "Gagal menghapus user"),
  });

  const activateMutation = useMutation({
    mutationFn: activateUser,
    onSuccess: () => invalidateUsers(),
    onError: (err: any) => handleError(err, "Gagal mengaktifkan user"),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => invalidateUsers(),
    onError: (err: any) => handleError(err, "Gagal menonaktifkan user"),
  });

  const alumniMutation = useMutation({
    mutationFn: markAsAlumniUser,
    onSuccess: () => invalidateUsers(),
    onError: (err: any) => handleError(err, "Gagal menandai sebagai alumni"),
  });

  const bulkStatusMutation = useMutation({
    mutationFn: bulkUserStatus,
    onSuccess: () => invalidateUsers(),
    onError: (err: any) => handleError(err, "Gagal bulk update status"),
  });

  const assignRoleMutation = useMutation({
    mutationFn: ({ id, roleIds }: { id: string; roleIds: string[] }) =>
      assignUserRole(id, roleIds),
    onSuccess: () => invalidateUsers(),
    onError: (err: any) => handleError(err, "Gagal assign role"),
  });

  const removeRoleMutation = useMutation({
    mutationFn: ({ id, roleIds }: { id: string; roleIds: string[] }) =>
      removeUserRole(id, roleIds),
    onSuccess: () => invalidateUsers(),
    onError: (err: any) => handleError(err, "Gagal menghapus role"),
  });

  const assignDivisionMutation = useMutation({
    mutationFn: ({ id, divisionId }: { id: string; divisionId: string }) =>
      assignUserDivision(id, divisionId),
    onSuccess: () => invalidateUsers(),
    onError: (err: any) => handleError(err, "Gagal assign divisi"),
  });

  // ── Context Value ─────────────────────────────────────────────────────────

  const contextValue = useMemo(
    () => ({
      // Data
      users: userData?.data?.users ?? [],
      pagination: userData?.data?.pagination ?? null,
      filters: userData?.data?.filters ?? null,
      stats: statsData?.data ?? null,

      // State Controls
      search,
      setSearch,
      page,
      setPage,
      limit,
      setLimit,
      statusFilter,
      setStatusFilter,
      divisionFilter,
      setDivisionFilter,
      angkatanFilter,
      setAngkatanFilter,

      // Actions
      createUser: createMutation.mutateAsync,
      updateUser: updateMutation.mutateAsync,
      deleteUser: deleteMutation.mutateAsync,
      activateUser: activateMutation.mutateAsync,
      deactivateUser: deactivateMutation.mutateAsync,
      markAsAlumniUser: alumniMutation.mutateAsync,
      bulkUserStatus: bulkStatusMutation.mutateAsync,
      assignUserRole: assignRoleMutation.mutateAsync,
      removeUserRole: removeRoleMutation.mutateAsync,
      assignUserDivision: assignDivisionMutation.mutateAsync,

      // Loaders
      isFetchingUsers: isLoadingUsers || isFetchingUsers,
      isFetchingStats,
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,
      isActivating: activateMutation.isPending,
      isDeactivating: deactivateMutation.isPending,
      isMarkingAlumni: alumniMutation.isPending,
      isBulkingStatus: bulkStatusMutation.isPending,
      isAssigningRole: assignRoleMutation.isPending,
      isRemovingRole: removeRoleMutation.isPending,
      isAssigningDivision: assignDivisionMutation.isPending,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      userData,
      statsData,
      search,
      page,
      limit,
      statusFilter,
      divisionFilter,
      angkatanFilter,
      isLoadingUsers,
      isFetchingUsers,
      isFetchingStats,
      createMutation.isPending,
      updateMutation.isPending,
      deleteMutation.isPending,
      activateMutation.isPending,
      deactivateMutation.isPending,
      alumniMutation.isPending,
      bulkStatusMutation.isPending,
      assignRoleMutation.isPending,
      removeRoleMutation.isPending,
      assignDivisionMutation.isPending,
    ],
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
