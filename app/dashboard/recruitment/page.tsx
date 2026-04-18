// app/dashboard/recruitment/page.tsx
import { RecruitmentList } from "@/features/recruitment/components/recruitment-list";
import { RecruitmentProvider } from "@/features/recruitment/contexts/RecruitmentContext";
import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";

export default function RecruitmentPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.VIEW_RECRUITMENTS}>
      <RecruitmentProvider>
        <div className="flex-1 bg-surface min-h-full">
          <RecruitmentList />
        </div>
      </RecruitmentProvider>
    </PermissionGuard>
  );
}
