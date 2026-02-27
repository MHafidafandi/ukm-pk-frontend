"use client";

import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { useEffect } from "react";
import { useRecruitmentContext } from "@/features/recruitment/contexts/RecruitmentContext";
import { Registrant } from "@/features/recruitment/services/recruitmentService";
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
    updateRegistrantStatus,
    isFetchingRegistrants,
    isFetchingRecruitmentDetails,
  } = useRecruitmentContext();

  useEffect(() => {
    setActiveRecruitmentId(recruitmentId);
    return () => setActiveRecruitmentId(null);
  }, [recruitmentId, setActiveRecruitmentId]);

  const recruitment = activeRecruitmentDetails;

  const handleUpdateStatus = async (
    registrant: Registrant,
    status: Registrant["status"],
  ) => {
    try {
      await updateRegistrantStatus({
        recruitmentId,
        registrantId: registrant.id,
        status,
      });
      toast.success(`Status pendaftar diubah menjadi ${status}`);
    } catch {
      toast.error("Gagal mengubah status pendaftar");
    }
  };

  if (isFetchingRegistrants || isFetchingRecruitmentDetails) {
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
            onClick={() => router.push("/administrator/recruitments")}
            className="hover:bg-muted transition-colors rounded-full h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Pendaftar: {recruitment?.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Kelola pendaftar untuk kegiatan rekrutmen ini
            </p>
          </div>
        </div>
      </div>

      <RegistrantsTable
        registrants={registrants}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};
