"use client";

import LandingHeader from "@/features/landing-page/components/LandingHeader";
import LandingFooter from "@/features/landing-page/components/LandingFooter";
import {
  PublicLandingProvider,
  usePublicLandingContext,
} from "@/features/landing-page/contexts/PublicLandingPageContext";

// Inner component agar bisa konsumsi context
function LandingShell({ children }: { children: React.ReactNode }) {
  const { grouped } = usePublicLandingContext();
  return (
    <div className="min-h-screen bg-surface text-on-surface font-['Inter']">
      <LandingHeader organization={grouped.organization} />
      <main>{children}</main>
      <LandingFooter organization={grouped.organization} />
    </div>
  );
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicLandingProvider>
      <LandingShell>{children}</LandingShell>
    </PublicLandingProvider>
  );
}
