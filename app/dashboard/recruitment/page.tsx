"use client";

import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { RecruitmentList } from "@/features/recruitment/components/recruitment-list";
import { RecruitmentProvider } from "@/features/recruitment/contexts/RecruitmentContext";

export default function RecruitmentPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.VIEW_RECRUITMENTS}>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
          <RecruitmentProvider>
            <RecruitmentList />
          </RecruitmentProvider>
        </div>
      </div>
    </PermissionGuard>
  );
}
