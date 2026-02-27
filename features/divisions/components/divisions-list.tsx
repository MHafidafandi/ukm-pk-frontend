"use client";

import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useDivisionContext } from "@/features/divisions/contexts/DivisionContext";
import { Division } from "@/features/divisions/services/divisionService";
import { z } from "zod";

const createDivisionSchema = z.object({
  nama_divisi: z.string().min(1, "Nama divisi wajib diisi"),
  deskripsi: z.string().optional(),
});

type CreateDivisionInput = z.infer<typeof createDivisionSchema>;

import { DivisionsTable } from "./division-table";
import { DivisionFormDialog } from "./division-form-dialog";
import { DivisionDeleteDialog } from "./division-delete-dialog";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";

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

  const {
    divisions,
    createDivision,
    updateDivision,
    deleteDivision,
    isFetchingDivisions,
  } = useDivisionContext();

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
        await updateDivision({
          id: editing.id,
          data: parsed,
        });
      } else {
        await createDivision(parsed);
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
      await deleteDivision(deleting.id);
      toast.success("Divisi dihapus");
      setDeleteOpen(false);
    } catch (err: any) {
      toast.error(err.response?.error || "Gagal menghapus divisi");
    }
  };

  if (isFetchingDivisions) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Manajemen Divisi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola data divisi dan departemen
          </p>
        </div>
        <PermissionGate permission={PERMISSIONS.CREATE_DIVISIONS}>
          <Button
            onClick={openAdd}
            className="bg-primary hover:bg-primary/90 text-white shadow-sm inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-semibold transition-all"
          >
            <Plus className="h-5 w-5" /> Tambah Divisi
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
