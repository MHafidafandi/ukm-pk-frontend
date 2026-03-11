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
  DivisionStats,
} from "@/features/divisions/services/divisionService";

interface DivisionContextType {
  divisions: Division[];
  stats: DivisionStats | null;
  search: string;
  setSearch: (s: string) => void;
  createDivision: (data: any) => Promise<any>;
  updateDivision: (args: { id: string; data: any }) => Promise<any>;
  deleteDivision: (id: string) => Promise<any>;
  isFetchingDivisions: boolean;
  isFetchingStats: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

const DivisionContext = createContext<DivisionContextType | undefined>(undefined);

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

  // ✅ select langsung mengeluarkan Division[] dari { data: [...] }
  const { data: divisions = [], isLoading: isFetchingDivisions } = useQuery({
    queryKey: ["divisions", "list"],
    queryFn: getDivisions,
    select: (response): Division[] => response.data ?? [],
    staleTime: 5 * 60 * 1000,
  });

  // ✅ Konsisten, stats juga pakai select
  const { data: stats = null, isLoading: isFetchingStats } = useQuery({
    queryKey: ["divisions", "stats"],
    queryFn: getDivisionsStatistics,
    select: (response): DivisionStats | null => response.data ?? null,
    staleTime: 5 * 60 * 1000,
  });

  // ✅ Filtering lokal — keyword di-lowercase sekali saja
  const filteredDivisions = useMemo(() => {
    if (!debounceSearch) return divisions;

    const keyword = debounceSearch.toLowerCase();

    return divisions.filter(
      (r) =>
        r.nama_divisi.toLowerCase().includes(keyword) ||
        r.deskripsi?.toLowerCase().includes(keyword)
    );
  }, [divisions, debounceSearch]);

  const invalidateDivisions = () => {
    queryClient.invalidateQueries({ queryKey: ["divisions"] });
  };

  const createMutation = useMutation({
    mutationFn: createDivision,
    onSuccess: invalidateDivisions,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateDivision(id, data),
    onSuccess: invalidateDivisions,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDivision,
    onSuccess: invalidateDivisions,
  });

  const contextValue = useMemo(
    () => ({
      divisions: filteredDivisions,
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
      filteredDivisions,
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