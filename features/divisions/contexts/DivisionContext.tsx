"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";

import {
  getDivisions,
  getDivisionsStatistics,
  createDivision,
  updateDivision,
  deleteDivision,
  Division,
} from "@/features/divisions/services/divisionService";

interface DivisionContextType {
  // Data
  divisions: Division[];
  stats: any;

  // UI State
  search: string;
  setSearch: (s: string) => void;

  // Actions
  createDivision: (data: any) => Promise<any>;
  updateDivision: (args: { id: string; data: any }) => Promise<any>;
  deleteDivision: (id: string) => Promise<any>;

  // Loaders
  isFetchingDivisions: boolean;
  isFetchingStats: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

const DivisionContext = createContext<DivisionContextType | undefined>(
  undefined,
);

export const useDivisionContext = () => {
  const context = useContext(DivisionContext);
  if (!context) {
    throw new Error("useDivisionContext must be used within DivisionProvider");
  }
  return context;
};

export const DivisionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debounceSearch] = useDebounce(search, 500);

  // Queries
  const { data: divisionsData, isLoading: isFetchingDivisions } = useQuery({
    queryKey: ["divisions", "list"],
    queryFn: getDivisions,
    staleTime: 5 * 60 * 1000,
  });

  const { data: statsData, isLoading: isFetchingStats } = useQuery({
    queryKey: ["divisions", "stats"],
    queryFn: getDivisionsStatistics,
    staleTime: 5 * 60 * 1000,
  });

  // Derived Filtering for local search since Divisions list isn't paginated over API according to SRS
  const divisions = useMemo(() => {
    let result = divisionsData ?? [];

    if (debounceSearch) {
      result = result.filter(
        (r: Division) =>
          r.nama_divisi
            .toLowerCase()
            .includes(debounceSearch.toLowerCase()) ||
          r.deskripsi
            ?.toLowerCase()
            .includes(debounceSearch.toLowerCase())
      );
    }

    return result;
  }, [divisionsData, debounceSearch]);

  const stats = statsData || null;

  // Mutations
  const invalidateDivisions = () => {
    queryClient.invalidateQueries({ queryKey: ["divisions"] });
  };

  const createMutation = useMutation({
    mutationFn: createDivision,
    onSuccess: () => invalidateDivisions(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateDivision(id, data),
    onSuccess: () => invalidateDivisions(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDivision,
    onSuccess: () => invalidateDivisions(),
  });

  const contextValue = useMemo(
    () => ({
      divisions,
      stats,

      search,
      setSearch,

      createDivision: createMutation.mutateAsync,
      updateDivision: updateMutation.mutateAsync,
      deleteDivision: deleteMutation.mutateAsync,

      isFetchingDivisions,
      isFetchingStats,
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,
    }),
    [
      divisions,
      stats,
      search,
      createMutation,
      updateMutation,
      deleteMutation,
      isFetchingDivisions,
      isFetchingStats,
    ],
  );

  return (
    <DivisionContext.Provider value={contextValue}>
      {children}
    </DivisionContext.Provider>
  );
};
