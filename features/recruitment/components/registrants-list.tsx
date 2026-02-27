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
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/administrator/recruitments")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Pendaftar: {recruitment?.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola pendaftar untuk kegiatan rekrutmen ini
          </p>
        </div>
      </div>

      <RegistrantsTable
        registrants={registrants}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};
