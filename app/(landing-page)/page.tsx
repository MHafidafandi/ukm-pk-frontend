"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  getLandingPageContents,
  groupContentByType,
} from "@/features/landing-page/services/landingPageService";
import type { LandingContent } from "@/features/landing-page/types";
import HeroSection from "@/features/landing-page/components/HeroSection";
import VisiMisiSection from "@/features/landing-page/components/VisiMisiSection";
import StrukturOrganisasiSection from "@/features/landing-page/components/StrukturOrganisasiSection";
import PublicOverviewSection from "@/features/landing-page/components/PublicOverviewSection";

export default function Home() {
  const { data } = useQuery<{ data: LandingContent[] }>({
    queryKey: queryKeys.landingContents.list(),
    queryFn: () => getLandingPageContents({ active: true }),
  });

  const grouped = groupContentByType(data?.data ?? []);

  return (
    <main id="top">
      <HeroSection content={grouped.hero} />
      <VisiMisiSection visi={grouped.visi} misi={grouped.misi} />
      <StrukturOrganisasiSection content={grouped.struktur_organisasi} />
      <PublicOverviewSection />
    </main>
  );
}
