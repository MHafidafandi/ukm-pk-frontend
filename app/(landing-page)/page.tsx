// app/(landing)/page.tsx
"use client";

import HeroSection from "@/features/landing-page/components/HeroSection";
import VisiMisiSection from "@/features/landing-page/components/VisiMisiSection";
import StrukturOrganisasiSection from "@/features/landing-page/components/StrukturOrganisasiSection";
import { usePublicLandingContext } from "@/features/landing-page/contexts/PublicLandingPageContext";

export default function Home() {
  const { grouped } = usePublicLandingContext();

  return (
    <main id="top">
      <HeroSection content={grouped.hero} />
      <VisiMisiSection visi={grouped.visi} misi={grouped.misi} />
      <StrukturOrganisasiSection content={grouped.struktur_organisasi} />
    </main>
  );
}
