// app/dashboard/recruitment/[id]/registrants/page.tsx
"use client";

import { use } from "react";
import { RegistrantsList } from "@/features/recruitment/components/registrants-list";
import { RecruitmentProvider } from "@/features/recruitment/contexts/RecruitmentContext";
import { DivisionProvider } from "@/features/divisions/contexts/DivisionContext";
import { RoleProvider } from "@/features/roles/contexts/RoleContext";
import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";

type Props = {
  params: Promise<{ id: string }>;
};

export default function RegistrantsPage({ params }: Props) {
  const { id } = use(params);

  return (
    <PermissionGuard permission={PERMISSIONS.VIEW_RECRUITMENTS}>
      <RecruitmentProvider>
        <DivisionProvider>
          <RoleProvider>
            <div className="flex-1 p-8 bg-surface min-h-full">
              <RegistrantsList recruitmentId={id} />
            </div>
          </RoleProvider>
        </DivisionProvider>
      </RecruitmentProvider>
    </PermissionGuard>
  );
}
