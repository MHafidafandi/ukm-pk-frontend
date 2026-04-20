"use client";

import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRecruitmentContext } from "@/features/recruitment/contexts/RecruitmentContext";
import type { Registrant } from "@/features/recruitment/services/recruitmentService";
import { RegistrantsTable } from "./registrants-table";
import {
  useDivisionsSelect,
  useRolesSelect,
} from "@/lib/services/selectService";
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
import { Label } from "@/components/ui/label";

type Props = { recruitmentId: string };

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
    registrantSort,
    setRegistrantSort,
    registrantOrder,
    setRegistrantOrder,
    registrantPagination,
  } = useRecruitmentContext();

  const [selectedRegistrant, setSelectedRegistrant] =
    useState<Registrant | null>(null);
  const [division, setDivision] = useState("");
  const [role, setRole] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: divisions = [], isLoading: loadingDivisions } =
    useDivisionsSelect(isModalOpen);
  const { data: roles = [], isLoading: loadingRoles } =
    useRolesSelect(isModalOpen);
  useEffect(() => {
    setActiveRecruitmentId(recruitmentId);
    return () => setActiveRecruitmentId(null);
  }, [recruitmentId]);

  const recruitmentName = recruitments?.find(
    (r) => r.id === recruitmentId,
  )?.nama_recruitment;

  const handleAcceptClick = (registrant: Registrant) => {
    setSelectedRegistrant(registrant);
    setDivision("");
    setRole([]);
    setIsModalOpen(true);
  };

  const handleConfirmAccept = async () => {
    if (!division || role.length === 0) {
      toast.error("Pilih divisi dan role terlebih dahulu");
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
      toast.error("Gagal menerima pendaftar");
    }
  };

  const handleRejectRegistrant = async (registrant: Registrant) => {
    try {
      await rejectRegistrant(registrant.id);
    } catch {
      toast.error("Gagal menolak pendaftar");
    }
  };

  if (isFetchingRecruitmentDetails && !activeRecruitmentDetails) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard/recruitment")}
            className="h-10 w-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-['Manrope'] text-3xl font-bold text-on-surface tracking-tight">
              Pendaftar: {recruitmentName}
            </h1>
            <p className=" text-sm text-on-surface-variant mt-1">
              Kelola pendaftar untuk rekrutmen ini
            </p>
          </div>
        </div>
      </header>

      <RegistrantsTable
        registrants={registrants}
        isLoading={isFetchingRegistrants}
        pagination={registrantPagination}
        onPageChange={setRegistrantPage}
        searchValue={registrantSearch}
        onSearchChange={setRegistrantSearch}
        statusFilter={registrantStatusFilter}
        onStatusFilterChange={setRegistrantStatusFilter}
        sort={registrantSort}
        onSortChange={setRegistrantSort}
        order={registrantOrder}
        onOrderChange={setRegistrantOrder}
        onAcceptRegistrant={handleAcceptClick}
        onRejectRegistrant={handleRejectRegistrant}
      />

      {/* ── Accept Dialog ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-surface-container-lowest p-0">
          <div className="px-8 pt-8 pb-6 bg-surface-container-low">
            <DialogHeader>
              <DialogTitle className="font-['Manrope'] text-xl font-bold text-primary">
                Tetapkan Divisi & Role
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="px-8 py-6 space-y-6">
            <div className="space-y-2">
              <Label className=" text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Pilih Divisi
              </Label>
              <Select value={division} onValueChange={setDivision}>
                <SelectTrigger className=" border-0 border-b-2 border-outline-variant rounded-none px-0 focus:border-primary focus:ring-0 bg-transparent">
                  <SelectValue
                    placeholder={
                      loadingDivisions ? "Memuat..." : "Pilih divisi"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {divisions.map((div) => (
                    <SelectItem key={div.id} value={div.id} className="">
                      {div.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className=" text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Pilih Role
              </Label>
              <div className="flex flex-col gap-2 rounded-xl bg-surface-container-low p-4">
                {loadingRoles ? (
                  <p className="text-sm text-on-surface-variant">
                    Memuat role...
                  </p>
                ) : (
                  roles.map((r) => (
                    <div key={r.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`role-${r.id}`}
                        checked={role.includes(r.id)}
                        onCheckedChange={(checked) => {
                          if (checked) setRole([...role, r.id]);
                          else setRole(role.filter((id) => id !== r.id));
                        }}
                      />
                      <label
                        htmlFor={`role-${r.id}`}
                        className=" text-sm font-medium text-on-surface cursor-pointer"
                      >
                        {r.name}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="px-8 py-5 bg-surface-container-low flex justify-end gap-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className=" px-5 py-2.5 text-sm font-medium text-primary border border-outline/20 rounded-xl hover:bg-surface-container transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleConfirmAccept}
              className=" font-bold px-6 py-2.5 text-sm text-on-primary bg-primary-gradient rounded-xl shadow-ambient hover:opacity-90 active:scale-95 transition-all"
            >
              Konfirmasi
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
