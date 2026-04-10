"use client";

import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { RegistrantsList } from "@/features/recruitment/components/registrants-list";
import { RecruitmentProvider } from "@/features/recruitment/contexts/RecruitmentContext";
import { use } from "react";

export default function RecruitmentDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);

    return (
<<<<<<< HEAD
        <PermissionGuard permission={PERMISSIONS.VIEW_RECRUITMENTS}>
=======
        <PermissionGuard permission={PERMISSIONS.VIEW_ACTIVITIES}>
>>>>>>> d1006d5a3f81168775557fa0498b538d3dcbbd83
            <div className="flex-1 space-y-4 p-8 pt-6">
                <RecruitmentProvider>
                    <RegistrantsList recruitmentId={id} />
                </RecruitmentProvider>
            </div>
        </PermissionGuard>
    );
}
