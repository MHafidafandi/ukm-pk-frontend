"use client";

import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useRecruitmentContext } from "@/features/recruitment/contexts/RecruitmentContext";
import type { Registrant } from "@/features/recruitment/services/recruitmentService";
import { RegistrantsTable } from "./registrants-table";

type Props = {
  recruitmentId: string;
};

export const RegistrantsList = ({ recruitmentId }: Props) => {
  const router = useRouter();
  const {
    setActiveRecruitmentId,
    registrants,
    activeRecruitmentDetails,
    isFetchingRegistrants,
    isFetchingRecruitmentDetails,
    acceptRegistrant,
    rejectRegistrant,
    registrantSearch,
    setRegistrantSearch,
    recruitments,
    setRegistrantPage,
    registrantStatusFilter,
    setRegistrantStatusFilter,
    registrantPagination,
  } = useRecruitmentContext();

  useEffect(() => {
    setActiveRecruitmentId(recruitmentId);
    return () => setActiveRecruitmentId(null);
  }, [recruitmentId]);

  const recruitment = activeRecruitmentDetails;

  const handleAcceptRegistrant = async (registrant: Registrant) => {
    try {
      await acceptRegistrant(registrant.id);
    } catch {
      toast.error("Failed to accept registrant");
    }
  };

  const handleRejectRegistrant = async (registrant: Registrant) => {
    try {
      await rejectRegistrant(registrant.id);
    } catch {
      toast.error("Failed to reject registrant");
    }
  };

  if (isFetchingRecruitmentDetails && !recruitment) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/recruitment")}
            className="hover:bg-muted transition-colors rounded-full h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Registrant: {recruitments?.find((r) => r.id === recruitmentId)?.nama_recruitment}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage registrant for this recruitment
            </p>
          </div>
        </div>
      </div>

      <RegistrantsTable
        registrants={registrants}
        isLoading={isFetchingRegistrants}
        pagination={registrantPagination}
        onPageChange={setRegistrantPage}
        searchValue={registrantSearch}
        onSearchChange={setRegistrantSearch}
        statusFilter={registrantStatusFilter}
        onStatusFilterChange={setRegistrantStatusFilter}
        onAcceptRegistrant={handleAcceptRegistrant}
        onRejectRegistrant={handleRejectRegistrant}
      />
    </div>
  );
};