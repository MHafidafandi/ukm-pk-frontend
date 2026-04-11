"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  getLandingPageContents,
  groupContentByType,
} from "@/features/landing-page/services/landingPageService";
import HeroSection from "@/features/landing-page/components/HeroSection";
import VisiMisiSection from "@/features/landing-page/components/VisiMisiSection";
import StrukturOrganisasiSection from "@/features/landing-page/components/StrukturOrganisasiSection";

export default function Home() {
  const { data } = useQuery({
    queryKey: queryKeys.landingContents.list(),
    queryFn: getLandingPageContents,
  });

  const grouped = groupContentByType(data?.data ?? []);

  return (
    <>
      <HeroSection content={grouped.hero} />
      <VisiMisiSection visi={grouped.visi} misi={grouped.misi} />
      <StrukturOrganisasiSection content={grouped.struktur_organisasi} />
    </>
  );
}
