"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

import {
  getRoles,
  getRoleStats,
  createRole,
  updateRole,
  deleteRole,
  Role,
} from "@/features/roles/services/roleService";

interface RoleContextType {
  // Data
  roles: Role[];
  stats: any;

  // UI State
  search: string;
  setSearch: (s: string) => void;

  // Actions
  createRole: (data: any) => Promise<any>;
  updateRole: (args: { id: string; data: any }) => Promise<any>;
  deleteRole: (id: string) => Promise<any>;

  // Loaders
  isFetchingRoles: boolean;
  isFetchingStats: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRoleContext = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRoleContext must be used within RoleProvider");
  }
  return context;
};

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debounceSearch] = useDebounce(search, 500);

  // Queries
  const { data: rolesData, isLoading: isFetchingRoles } = useQuery({
    queryKey: ["roles", "list"],
    queryFn: getRoles,
    staleTime: 5 * 60 * 1000,
  });

  const { data: statsData, isLoading: isFetchingStats } = useQuery({
    queryKey: ["roles", "stats"],
    queryFn: getRoleStats,
    staleTime: 5 * 60 * 1000,
  });

  const roles = useMemo(() => {
    let result = Array.isArray(rolesData?.data) ? rolesData.data : [];
    if (debounceSearch) {
      result = result.filter((r) =>
        r.name.toLowerCase().includes(debounceSearch.toLowerCase()),
      );
    }
    return result;
  }, [rolesData, debounceSearch]);

  const stats = statsData || null;

  // Mutations
  const invalidateRoles = () => {
    queryClient.invalidateQueries({ queryKey: ["roles"] });
  };

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => invalidateRoles(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateRole(id, data),
    onSuccess: () => invalidateRoles(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => invalidateRoles(),
  });

  const contextValue = useMemo(
    () => ({
      roles,
      stats,

      search,
      setSearch,

      createRole: createMutation.mutateAsync,
      updateRole: updateMutation.mutateAsync,
      deleteRole: deleteMutation.mutateAsync,

      isFetchingRoles,
      isFetchingStats,
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,
    }),
    [
      roles,
      stats,
      search,
      createMutation,
      updateMutation,
      deleteMutation,
      isFetchingRoles,
      isFetchingStats,
    ],
  );

  return (
    <RoleContext.Provider value={contextValue}>{children}</RoleContext.Provider>
  );
};
