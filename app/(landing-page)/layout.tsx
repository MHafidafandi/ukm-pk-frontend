// app/(landing)/layout.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import LandingHeader from "@/features/landing-page/components/LandingHeader";
import LandingFooter from "@/features/landing-page/components/LandingFooter";
import {
  getLandingPageContents,
  groupContentByType,
} from "@/features/landing-page/services/landingPageService";
import type { LandingContent } from "@/features/landing-page/types";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch semua konten aktif — termasuk type "organization"
  const { data } = useQuery<{ data: LandingContent[] }>({
    queryKey: [...queryKeys.landingContents.list(), "layout"],
    queryFn: () => getLandingPageContents({ active: true }),
    staleTime: 5 * 60 * 1000, // 5 menit cache agar tidak refetch setiap render
  });

  const grouped = groupContentByType(data?.data ?? []);

  return (
    <div className="min-h-screen bg-surface text-on-surface font-['Inter']">
      {/* Header menerima data organisasi dari CMS */}
      <LandingHeader organization={grouped.organization} />
      <main>{children}</main>
      {/* Footer menerima data organisasi dari CMS */}
      <LandingFooter organization={grouped.organization} />
    </div>
  );
}
