"use client";

import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { RegistrantsList } from "@/features/recruitment/components/registrants-list";
import { RecruitmentProvider } from "@/features/recruitment/contexts/RecruitmentContext";
import { use } from "react";
import { DivisionProvider } from "@/features/divisions/contexts/DivisionContext";
import { RoleProvider } from "@/features/roles/contexts/RoleContext";

export default function RecruitmentDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);

    return (
        <PermissionGuard permission={PERMISSIONS.VIEW_RECRUITMENTS}>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <DivisionProvider>
                    <RoleProvider>
                        <RecruitmentProvider>
                            <RegistrantsList recruitmentId={id} />
                        </RecruitmentProvider>
                    </RoleProvider>
                </DivisionProvider>
            </div>
        </PermissionGuard>
    );
}
