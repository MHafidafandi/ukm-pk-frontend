"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import {
  getLandingPageContents,
  groupContentByType,
} from "@/features/landing-page/services/landingPageService";
import { env } from "@/configs/env";
import { getPublicActivities } from "../services/publicOverviewService";

// ── ENV ───────────────────────────────────────────────────────────────────────
const BASE_URL = env.API_URL;

// ── Types ─────────────────────────────────────────────────────────────────────
export interface PublicActivity {
  id: string;
  judul: string;
  deskripsi: string;
  tanggal: string;
  lokasi: string;
  status: string;
  thumbnail?: string;
  is_featured?: boolean;
}

export interface Pagination {
  total: number;
  page: number;
  total_pages: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface PublicRecruitment {
  id: string;
  nama_recruitment: string;
  deskripsi: string;
  tanggal_buka: string;
  tanggal_tutup: string;
  announcement_link?: string;
  status: "open" | "closed" | "archived";
}

export interface PublicDivision {
  id: string;
  nama_divisi: string;
  deskripsi: string;
}

export interface DonationPayload {
  nama_donatur: string;
  jumlah: number;
  tanggal: string;
  metode: string;
  deskripsi?: string;
  bukti_pembayaran?: File;
}

export interface RegistrationPayload {
  recruit_id: string;
  nama: string;
  email: string;
  angkatan: number;
  first_choice: string;
  second_choice: string;
  third_choice: string;
}

// ── Query Keys ────────────────────────────────────────────────────────────────
export const publicLandingKeys = {
  contents: ["public", "landing-contents"] as const,
  activities: (params: object) => ["public", "activities", params] as const,
  featuredActivities: ["public", "activities", "featured"] as const,
  openRecruitments: ["public", "recruitments", "open"] as const,
  divisions: ["public", "divisions"] as const,
};

// ── Context Type ──────────────────────────────────────────────────────────────
type PublicLandingContextType = {
  // ── CMS Content (digunakan semua halaman publik) ──
  grouped: ReturnType<typeof groupContentByType>;
  isLoadingContents: boolean;

  // ── Activities (/activities page) ──
  publicActivities: PublicActivity[];
  activitiesPagination: Pagination | null;
  isLoadingActivities: boolean;
  activitySearch: string;
  setActivitySearch: (s: string) => void;
  activityStatus: string;
  setActivityStatus: (s: string) => void;
  activityPage: number;
  setActivityPage: (p: number) => void;

  // ── Donation (/donation page) ──
  submitDonation: (payload: DonationPayload) => Promise<any>;
  isSubmittingDonation: boolean;

  // ── Recruitment (/recruitment page) ──
  openRecruitments: PublicRecruitment[];
  isLoadingRecruitments: boolean;
  divisions: PublicDivision[];
  isLoadingDivisions: boolean;
  submitRegistration: (payload: RegistrationPayload) => Promise<any>;
  isSubmittingRegistration: boolean;
};

// ── Context ───────────────────────────────────────────────────────────────────
const PublicLandingContext = createContext<
  PublicLandingContextType | undefined
>(undefined);

export const usePublicLandingContext = () => {
  const ctx = useContext(PublicLandingContext);
  if (!ctx)
    throw new Error(
      "usePublicLandingContext must be used within PublicLandingProvider",
    );
  return ctx;
};

async function submitDonationApi(payload: DonationPayload): Promise<void> {
  const fd = new FormData();
  fd.append("nama_donatur", payload.nama_donatur);
  fd.append("jumlah", String(payload.jumlah));
  fd.append("tanggal", payload.tanggal);
  fd.append("metode", payload.metode);
  if (payload.deskripsi) fd.append("deskripsi", payload.deskripsi);
  if (payload.bukti_pembayaran)
    fd.append("bukti_pembayaran", payload.bukti_pembayaran);

  const res = await fetch(`${BASE_URL}/donations`, {
    method: "POST",
    body: fd,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? "Gagal mengirim donasi");
}

async function submitRegistrationApi(
  payload: RegistrationPayload,
): Promise<void> {
  const res = await fetch(`${BASE_URL}/recruitments/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? "Gagal mendaftar");
}

// ── Provider ──────────────────────────────────────────────────────────────────
export const PublicLandingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const qc = useQueryClient();

  // ── Activity filter states ──
  const [activitySearch, setActivitySearch] = useState("");
  const [activityStatus, setActivityStatus] = useState("");
  const [activityPage, setActivityPage] = useState(1);
  const [activityLimit] = useState(9);
  const [debouncedSearch] = useDebounce(activitySearch, 500);

  // ── Reset page on search/filter change ──
  const handleSetActivitySearch = (s: string) => {
    setActivitySearch(s);
    setActivityPage(1);
  };
  const handleSetActivityStatus = (s: string) => {
    setActivityStatus(s);
    setActivityPage(1);
  };

  // ── Queries ──────────────────────────────────────────────────────────────

  // 1. CMS Contents (active only — untuk halaman publik)
  const contentsQuery = useQuery({
    queryKey: publicLandingKeys.contents,
    queryFn: () => getLandingPageContents({ active: true }),
    staleTime: 5 * 60_000,
  });

  // 2. Public activities (untuk halaman /activities)
  const activitiesQuery = useQuery({
    queryKey: publicLandingKeys.activities({
      page: activityPage,
      limit: activityLimit,
      search: debouncedSearch,
      status: activityStatus,
    }),
    queryFn: () =>
      getPublicActivities({
        page: activityPage,
        limit: activityLimit,
        search: debouncedSearch,
        status: activityStatus,
      }),
    staleTime: 60_000,
  });

  // 3. Featured activities (untuk home page / PublicOverviewSection)

  // 4. Open recruitments
  const recruitmentsQuery = useQuery({
    queryKey: publicLandingKeys.openRecruitments,
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/recruitments/open`);
      const json = await res.json();
      return (json?.data ?? []) as PublicRecruitment[];
    },
    staleTime: 5 * 60_000,
  });

  // 5. Divisions (untuk form rekrutmen)
  const divisionsQuery = useQuery({
    queryKey: publicLandingKeys.divisions,
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/divisions`);
      const json = await res.json();
      return (json?.data ?? []) as PublicDivision[];
    },
    staleTime: 10 * 60_000,
  });

  // ── Derived ──────────────────────────────────────────────────────────────
  const contents = contentsQuery.data?.data ?? [];
  const grouped = useMemo(() => groupContentByType(contents), [contents]);

  const publicActivities = activitiesQuery.data?.activities ?? [];

  const activitiesPagination = useMemo<Pagination | null>(() => {
    if (!activitiesQuery.data) return null;
    const total = activitiesQuery.data.total;
    return {
      total,
      page: activityPage,
      page_size: activityLimit,
      total_pages: Math.ceil(total / activityLimit) || 1,
      has_next: activityPage * activityLimit < total,
      has_previous: activityPage > 1,
    };
  }, [activitiesQuery.data, activityPage, activityLimit]);

  const openRecruitments = recruitmentsQuery.data ?? [];
  const divisions = divisionsQuery.data ?? [];

  // ── Mutations ─────────────────────────────────────────────────────────────
  const donationMut = useMutation({
    mutationFn: submitDonationApi,
    // Tidak perlu invalidate — donasi publik tidak ada cache yang perlu di-refresh
  });

  const registrationMut = useMutation({
    mutationFn: submitRegistrationApi,
  });

  // ── Context Value ─────────────────────────────────────────────────────────
  const value = useMemo<PublicLandingContextType>(
    () => ({
      // CMS
      grouped,
      isLoadingContents: contentsQuery.isLoading,

      // Activities page
      publicActivities,
      activitiesPagination,
      isLoadingActivities: activitiesQuery.isFetching,
      activitySearch,
      setActivitySearch: handleSetActivitySearch,
      activityStatus,
      setActivityStatus: handleSetActivityStatus,
      activityPage,
      setActivityPage,

      // Donation
      submitDonation: (p) => donationMut.mutateAsync(p),
      isSubmittingDonation: donationMut.isPending,

      // Recruitment
      openRecruitments,
      isLoadingRecruitments: recruitmentsQuery.isLoading,
      divisions,
      isLoadingDivisions: divisionsQuery.isLoading,
      submitRegistration: (p) => registrationMut.mutateAsync(p),
      isSubmittingRegistration: registrationMut.isPending,
    }),
    [
      grouped,
      contentsQuery.isLoading,
      publicActivities,
      activitiesPagination,
      activitiesQuery.isFetching,
      activitySearch,
      activityStatus,
      activityPage,
      donationMut,
      openRecruitments,
      recruitmentsQuery.isLoading,
      divisions,
      divisionsQuery.isLoading,
      registrationMut,
    ],
  );

  return (
    <PublicLandingContext.Provider value={value}>
      {children}
    </PublicLandingContext.Provider>
  );
};
