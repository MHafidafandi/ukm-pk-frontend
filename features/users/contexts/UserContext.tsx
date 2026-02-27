"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";
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

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
  const [angkatanFilter, setAngkatanFilter] = useState<number | undefined>(
    undefined,
  );

  const [debounceSearch] = useDebounce(search, 500);

  // Queries
  const { data: userData, isLoading: isFetchingUsers } = useQuery({
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
  });

  const { data: statsData, isLoading: isFetchingStats } = useQuery({
    queryKey: ["users", "stats"],
    queryFn: getUsersStats,
  });

  // Mutations
  const invalidateUsers = () => {
    queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    queryClient.invalidateQueries({ queryKey: ["users", "stats"] });
  };

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      invalidateUsers();
    },
    onError: (err: any) => {
      console.error(err);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateUser(id, data),
    onSuccess: () => invalidateUsers(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => invalidateUsers(),
  });

  const activateMutation = useMutation({
    mutationFn: activateUser,
    onSuccess: () => invalidateUsers(),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => invalidateUsers(),
  });

  const alumniMutation = useMutation({
    mutationFn: markAsAlumniUser,
    onSuccess: () => invalidateUsers(),
  });

  const bulkStatusMutation = useMutation({
    mutationFn: bulkUserStatus,
    onSuccess: () => invalidateUsers(),
  });

  const assignRoleMutation = useMutation({
    mutationFn: ({ id, roleIds }: { id: string; roleIds: string[] }) =>
      assignUserRole(id, roleIds),
    onSuccess: () => invalidateUsers(),
  });

  const removeRoleMutation = useMutation({
    mutationFn: ({ id, roleIds }: { id: string; roleIds: string[] }) =>
      removeUserRole(id, roleIds),
    onSuccess: () => invalidateUsers(),
  });

  const assignDivisionMutation = useMutation({
    mutationFn: ({ id, divisionId }: { id: string; divisionId: string }) =>
      assignUserDivision(id, divisionId),
    onSuccess: () => invalidateUsers(),
  });

  const contextValue = useMemo(
    () => ({
      // Data
      users: userData?.data?.users || [],
      pagination: userData?.data?.pagination || null,
      filters: userData?.data?.filters || null,
      stats: statsData?.data || null,

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
      isFetchingUsers,
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
    [
      userData,
      statsData,
      search,
      page,
      limit,
      statusFilter,
      divisionFilter,
      angkatanFilter,
      createMutation,
      updateMutation,
      deleteMutation,
      activateMutation,
      deactivateMutation,
      alumniMutation,
      bulkStatusMutation,
      assignRoleMutation,
      removeRoleMutation,
      assignDivisionMutation,
      isFetchingUsers,
      isFetchingStats,
    ],
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
