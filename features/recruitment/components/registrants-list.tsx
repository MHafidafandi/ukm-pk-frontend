"use client";

import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRecruitmentContext } from "@/features/recruitment/contexts/RecruitmentContext";
import type { Registrant } from "@/features/recruitment/services/recruitmentService";
import { RegistrantsTable } from "./registrants-table";
import { useDivisionContext } from "@/features/divisions/contexts/DivisionContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useRoleContext } from "@/features/roles/contexts/RoleContext";

type Props = {
  recruitmentId: string;
};

export const RegistrantsList = ({ recruitmentId }: Props) => {
  const router = useRouter();
  const {
    setActiveRecruitmentId,
    registrants,
    // divisions,
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
  const { divisions } = useDivisionContext();
  const { roles } = useRoleContext();

  const [selectedRegistrant, setSelectedRegistrant] = useState<Registrant | null>(null);
  const [division, setDivision] = useState("");
  const [role, setRole] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setActiveRecruitmentId(recruitmentId);
    return () => setActiveRecruitmentId(null);
  }, [recruitmentId]);


  const recruitment = activeRecruitmentDetails;

  const handleAcceptClick = (registrant: Registrant) => {
    setSelectedRegistrant(registrant);
    setDivision("");
    setRole([]);
    setIsModalOpen(true);
  };

  const handleConfirmAccept = async () => {
    if (!division || role.length === 0) {
      toast.error("Please select both division and role");
      return;
    }

    try {
      if (!selectedRegistrant) return;
      await acceptRegistrant({
        registrantId: selectedRegistrant.id,
        division_id: division,
        role_ids: role,
      });
      setIsModalOpen(false);
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
        onAcceptRegistrant={handleAcceptClick}
        onRejectRegistrant={handleRejectRegistrant}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Division and Role</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-2">
            <Select value={division} onValueChange={setDivision}>
              <label className="text-sm font-medium">Select Division</label>
              <SelectTrigger>
                <SelectValue placeholder="Select Division" />
              </SelectTrigger>
              <SelectContent>
                {divisions.map((div) => (
                  <SelectItem key={div.id} value={div.id}>
                    {div.nama_divisi}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Select Roles</label>
              <div className="flex flex-col gap-2 rounded-md border p-3">
                {roles.map((r) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`role-${r.id}`}
                      checked={role.includes(r.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setRole([...role, r.id]);
                        } else {
                          setRole(role.filter(id => id !== r.id));
                        }
                      }}
                    />
                    <label htmlFor={`role-${r.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{r.name}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAccept}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};