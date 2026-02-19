"use client";

import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  useDivisions,
  useCreateDivision,
  useUpdateDivision,
  useDeleteDivision,
} from "../hooks/useDivisions";
import { Division, CreateDivisionInput } from "../api";
import { z } from "zod";

const createDivisionSchema = z.object({
  nama_divisi: z.string().min(1, "Nama divisi wajib diisi"),
  deskripsi: z.string().optional(),
});
import { DivisionsTable } from "./division-table";
import { DivisionFormDialog } from "./division-form-dialog";
import { DivisionDeleteDialog } from "./division-delete-dialog";
import { PermissionGate } from "@/components/guard";

const emptyForm: CreateDivisionInput = {
  nama_divisi: "",
  deskripsi: "",
};

export const DivisionsList = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [editing, setEditing] = useState<Division | null>(null);
  const [deleting, setDeleting] = useState<Division | null>(null);
  const [form, setForm] = useState<CreateDivisionInput>(emptyForm);

  const divisionsQuery = useDivisions();
  const createDivision = useCreateDivision();
  const updateDivision = useUpdateDivision();
  const deleteDivision = useDeleteDivision();

  const divisions = divisionsQuery.data?.data ?? [];

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (division: Division) => {
    setEditing(division);
    setForm({
      nama_divisi: division.nama_divisi,
      deskripsi: division.deskripsi || "",
    });
    setFormOpen(true);
  };

  const openDelete = (division: Division) => {
    setDeleting(division);
    setDeleteOpen(true);
  };

  const handleSave = async () => {
    try {
      const parsed = createDivisionSchema.parse(form);

      if (editing) {
        await updateDivision.mutateAsync({
          id: editing.id,
          data: parsed,
        });
      } else {
        await createDivision.mutateAsync(parsed);
      }

      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (err: any) {
      if (err.name === "ZodError") {
        toast.error(err.errors[0].message);
        return;
      }
      toast.error("Gagal menyimpan divisi");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;

    try {
      await deleteDivision.mutateAsync(deleting.id);
      toast.success("Divisi dihapus");
      setDeleteOpen(false);
    } catch (err: any) {
      toast.error(err.response?.error || "Gagal menghapus divisi");
    }
  };

  if (divisionsQuery.isLoading) {
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
            Manajemen Divisi
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola data divisi dan departemen
          </p>
        </div>
        <PermissionGate permission="divisions:create">
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Divisi
          </Button>
        </PermissionGate>
      </div>

      <DivisionsTable
        divisions={divisions}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      <DivisionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        isEdit={!!editing}
        form={form}
        setForm={setForm}
        onSubmit={handleSave}
      />

      <DivisionDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        division={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};
