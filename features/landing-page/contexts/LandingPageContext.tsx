// features/landing-page/contexts/LandingPageContext.tsx
"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getLandingPageContents,
  createContent,
  updateContent,
  deleteContent,
  groupContentByType,
} from "@/features/landing-page/services/landingPageService";
import type {
  LandingContent,
  ContentType,
} from "@/features/landing-page/types";

// ── Query Keys ────────────────────────────────────────────────────────────────
export const landingPageKeys = {
  all: ["landing-contents"] as const,
  list: (filter?: string) =>
    [...landingPageKeys.all, "list", filter ?? "all"] as const,
  detail: (id: string) => [...landingPageKeys.all, "detail", id] as const,
};

// ── Context Type ──────────────────────────────────────────────────────────────
type LandingPageContextType = {
  // ── Data ──
  contents: LandingContent[];
  grouped: ReturnType<typeof groupContentByType>;
  isFetching: boolean;

  // ── Filter ──
  typeFilter: string;
  setTypeFilter: (t: string) => void;

  // ── Filtered view ──
  filteredContents: LandingContent[];

  // ── Stats ──
  totalActive: number;
  totalInactive: number;
  uniqueTypes: number;

  // ── CRUD ──
  createContent: (
    body: Omit<
      LandingContent,
      "id" | "created_at" | "updated_at" | "created_by" | "updated_by"
    >,
    imageFile?: File,
  ) => Promise<any>;
  updateContent: (
    id: string,
    body: Partial<
      Pick<
        LandingContent,
        "title" | "description" | "active" | "type" | "image"
      >
    >,
    imageFile?: File,
  ) => Promise<any>;
  deleteContent: (id: string) => Promise<any>;

  // ── Loaders ──
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
};

// ── Context ───────────────────────────────────────────────────────────────────
const LandingPageContext = createContext<LandingPageContextType | undefined>(
  undefined,
);

export const useLandingPageContext = () => {
  const ctx = useContext(LandingPageContext);
  if (!ctx)
    throw new Error(
      "useLandingPageContext must be used within LandingPageProvider",
    );
  return ctx;
};

// ── Provider ──────────────────────────────────────────────────────────────────
export const LandingPageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const qc = useQueryClient();
  const [typeFilter, setTypeFilter] = useState("all");

  // ── Query: semua konten (tanpa filter active, biar admin lihat semuanya) ──
  const { data, isFetching } = useQuery({
    queryKey: landingPageKeys.list(),
    queryFn: () => getLandingPageContents({}),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  // ── Derived ──
  const contents: LandingContent[] = data?.data ?? [];

  const grouped = useMemo(() => groupContentByType(contents), [contents]);

  const filteredContents = useMemo(() => {
    if (typeFilter === "all") return contents;
    if (typeFilter === "inactive") return contents.filter((c) => !c.active);
    return contents.filter((c) => c.type === typeFilter);
  }, [contents, typeFilter]);

  const totalActive = useMemo(
    () => contents.filter((c) => c.active).length,
    [contents],
  );
  const totalInactive = useMemo(
    () => contents.filter((c) => !c.active).length,
    [contents],
  );
  const uniqueTypes = useMemo(
    () => new Set(contents.map((c) => c.type)).size,
    [contents],
  );

  // ── Invalidators ──
  const invalidateAll = () =>
    qc.invalidateQueries({ queryKey: landingPageKeys.all });

  // ── Mutations ──
  const createMut = useMutation({
    mutationFn: ({
      body,
      imageFile,
    }: {
      body: Omit<
        LandingContent,
        "id" | "created_at" | "updated_at" | "created_by" | "updated_by"
      >;
      imageFile?: File;
    }) => createContent(body, imageFile),
    onSuccess: () => {
      invalidateAll();
      toast.success("Konten berhasil dibuat");
    },
    onError: () => toast.error("Gagal membuat konten"),
  });

  const updateMut = useMutation({
    mutationFn: ({
      id,
      body,
      imageFile,
    }: {
      id: string;
      body: Partial<
        Pick<
          LandingContent,
          "title" | "description" | "active" | "type" | "image"
        >
      >;
      imageFile?: File;
    }) => updateContent(id, body, imageFile),
    // Optimistic update — langsung update cache sebelum response
    onMutate: async ({ id, body }) => {
      await qc.cancelQueries({ queryKey: landingPageKeys.all });
      const snapshot = qc.getQueryData<{ data: LandingContent[] }>(
        landingPageKeys.list(),
      );
      qc.setQueryData<{ data: LandingContent[] }>(
        landingPageKeys.list(),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((c) => (c.id === id ? { ...c, ...body } : c)),
          };
        },
      );
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) {
        qc.setQueryData(landingPageKeys.list(), ctx.snapshot);
      }
      toast.error("Gagal memperbarui konten");
    },
    onSuccess: () => {
      invalidateAll();
      toast.success("Konten berhasil diperbarui");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteContent(id),
    // Optimistic remove
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: landingPageKeys.all });
      const snapshot = qc.getQueryData<{ data: LandingContent[] }>(
        landingPageKeys.list(),
      );
      qc.setQueryData<{ data: LandingContent[] }>(
        landingPageKeys.list(),
        (old) => {
          if (!old) return old;
          return { ...old, data: old.data.filter((c) => c.id !== id) };
        },
      );
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) {
        qc.setQueryData(landingPageKeys.list(), ctx.snapshot);
      }
      toast.error("Gagal menghapus konten");
    },
    onSuccess: () => {
      invalidateAll();
      toast.success("Konten berhasil dihapus");
    },
  });

  // ── Context Value ──
  const value = useMemo<LandingPageContextType>(
    () => ({
      contents,
      grouped,
      isFetching,
      typeFilter,
      setTypeFilter,
      filteredContents,
      totalActive,
      totalInactive,
      uniqueTypes,
      createContent: (body, imageFile) =>
        createMut.mutateAsync({ body, imageFile }),
      updateContent: (id, body, imageFile) =>
        updateMut.mutateAsync({ id, body, imageFile }),
      deleteContent: (id) => deleteMut.mutateAsync(id),
      isCreating: createMut.isPending,
      isUpdating: updateMut.isPending,
      isDeleting: deleteMut.isPending,
    }),
    [
      contents,
      grouped,
      isFetching,
      typeFilter,
      filteredContents,
      totalActive,
      totalInactive,
      uniqueTypes,
      createMut,
      updateMut,
      deleteMut,
    ],
  );

  return (
    <LandingPageContext.Provider value={value}>
      {children}
    </LandingPageContext.Provider>
  );
};
