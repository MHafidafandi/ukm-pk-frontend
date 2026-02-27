"use client";

import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useRoleContext } from "@/features/roles/contexts/RoleContext";
import { Role } from "@/features/roles/services/roleService";
import { z } from "zod";

const createRoleSchema = z.object({
  name: z.string().min(1, "Nama role wajib diisi"),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

type CreateRoleInput = z.infer<typeof createRoleSchema>;

import { RolesTable } from "./role-table";
import { RoleFormDialog } from "./role-form-dialog";
import { RoleDeleteDialog } from "./role-delete-dialog";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";

const emptyForm: CreateRoleInput = {
  name: "",
};

export const RolesList = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [editing, setEditing] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState<Role | null>(null);
  const [form, setForm] = useState<CreateRoleInput>(emptyForm);

  const { roles, createRole, updateRole, deleteRole, isFetchingRoles } =
    useRoleContext();

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditing(role);
    setForm({
      name: role.name,
    });
    setFormOpen(true);
  };

  const openDelete = (role: Role) => {
    setDeleting(role);
    setDeleteOpen(true);
  };

  const handleSave = async () => {
    try {
      const parsed = createRoleSchema.parse(form);

      if (editing) {
        await updateRole({
          id: editing.id,
          data: parsed,
        });
      } else {
        await createRole(parsed);
      }

      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (err: any) {
      if (err.name === "ZodError") {
        toast.error(err.errors[0].message);
        return;
      }
      toast.error("Gagal menyimpan role");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;

    try {
      await deleteRole(deleting.id);
      toast.success("Role dihapus");
      setDeleteOpen(false);
    } catch (err: any) {
      toast.error(err.response?.error || "Gagal menghapus role");
    }
  };

  if (isFetchingRoles) {
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
            Manajemen Role
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola role dan hak akses pengguna
          </p>
        </div>
        <PermissionGate permission={PERMISSIONS.CREATE_ROLES}>
          <Button
            onClick={openAdd}
            className="bg-primary hover:bg-primary/90 text-white shadow-sm inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-semibold transition-all"
          >
            <Plus className="h-5 w-5" /> Tambah Role
          </Button>
        </PermissionGate>
      </div>

      <RolesTable roles={roles} onEdit={openEdit} onDelete={openDelete} />

      <RoleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        isEdit={!!editing}
        form={form}
        setForm={setForm}
        onSubmit={handleSave}
      />

      <RoleDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        role={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};
