"use client";

import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  useRecruitments,
  useCreateRecruitment,
  useUpdateRecruitment,
  useDeleteRecruitment,
} from "../hooks/useRecruitments";
import { Recruitment, CreateRecruitmentInput } from "../api";
import { CreateRecruitmentSchema } from "@/lib/validations/recruitment-schema";
import { RecruitmentTable } from "./recruitment-table";
import { RecruitmentFormDialog } from "./recruitment-form-dialog";
import { RecruitmentDeleteDialog } from "./recruitment-delete-dialog";
import { useRouter } from "next/navigation";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";

const emptyForm: CreateRecruitmentInput = {
  title: "",
  description: "",
  start_date: new Date(),
  end_date: new Date(),
  status: "draft",
  requirements: [],
};

export const RecruitmentList = () => {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [editing, setEditing] = useState<Recruitment | null>(null);
  const [deleting, setDeleting] = useState<Recruitment | null>(null);
  const [form, setForm] = useState<CreateRecruitmentInput>(emptyForm);

  const recruitmentsQuery = useRecruitments();
  const createRecruitment = useCreateRecruitment();
  const updateRecruitment = useUpdateRecruitment();
  const deleteRecruitment = useDeleteRecruitment();

  const recruitments = recruitmentsQuery.data?.data ?? [];

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (item: Recruitment) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description,
      start_date: new Date(item.start_date),
      end_date: new Date(item.end_date),
      status: item.status,
      requirements: item.requirements || [],
    });
    setFormOpen(true);
  };

  const openDelete = (item: Recruitment) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const handleViewRegistrants = (item: Recruitment) => {
    router.push(`/administrator/recruitments/${item.id}/registrants`);
  };

  const handleSave = async () => {
    try {
      const parsed = CreateRecruitmentSchema.parse(form);
      // Ensure dates are strings if API expects strings, or Date objects if configured so.
      // Zod schema accepts both, but let's send what API usually expects.
      // If API expects ISO string:
      // parsed.start_date = new Date(parsed.start_date).toISOString();
      // parsed.end_date = new Date(parsed.end_date).toISOString();

      if (editing) {
        await updateRecruitment.mutateAsync({
          id: editing.id,
          data: parsed,
        });
      } else {
        await createRecruitment.mutateAsync(parsed);
      }

      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (err: any) {
      if (err.name === "ZodError") {
        toast.error(err.errors[0].message);
        return;
      }
      toast.error("Gagal menyimpan rekrutmen");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;

    try {
      await deleteRecruitment.mutateAsync(deleting.id);
      toast.success("Rekrutmen dihapus");
      setDeleteOpen(false);
    } catch (err: any) {
      toast.error(err.response?.error || "Gagal menghapus rekrutmen");
    }
  };

  if (recruitmentsQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Manajemen Rekrutmen
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola kegiatan open recruitment dan pendaftar
          </p>
        </div>
        <PermissionGate permission={PERMISSIONS.CREATE_RECRUITMENTS}>
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" /> Buat Rekrutmen
          </Button>
        </PermissionGate>
      </div>

      <RecruitmentTable
        recruitments={recruitments}
        onEdit={openEdit}
        onDelete={openDelete}
        onViewRegistrants={handleViewRegistrants}
      />

      <RecruitmentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        isEdit={!!editing}
        form={form}
        setForm={setForm}
        onSubmit={handleSave}
      />

      <RecruitmentDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        recruitment={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};
