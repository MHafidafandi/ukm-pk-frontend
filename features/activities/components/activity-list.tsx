"use client";

import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

import {
  useActivities,
  useCreateActivity,
  useUpdateActivity,
  useDeleteActivity,
} from "../hooks/useActivities";
import { Activity } from "../api";
import {
  CreateActivityInput,
  CreateActivitySchema,
} from "@/lib/validations/activity-schema";

import { ActivityTable } from "./activity-table";
import { ActivityFormDialog } from "./activity-form-dialog";
import { ActivityDeleteDialog } from "./activity-delete-dialog";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";

const emptyForm: CreateActivityInput = {
  judul: "",
  deskripsi: "",
  tanggal: new Date(),
  lokasi: "",
};

export const ActivityList = () => {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [editing, setEditing] = useState<Activity | null>(null);
  const [deleting, setDeleting] = useState<Activity | null>(null);
  const [form, setForm] = useState<CreateActivityInput>(emptyForm);

  // Pagination states could be added here
  const activitiesQuery = useActivities();
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();
  const deleteActivity = useDeleteActivity();

  const activities = activitiesQuery.data?.data ?? [];

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (item: Activity) => {
    setEditing(item);
    setForm({
      judul: item.judul,
      deskripsi: item.deskripsi,
      tanggal: new Date(item.tanggal), // Ensure date object for picker
      lokasi: item.lokasi,
    });
    setFormOpen(true);
  };

  const openDelete = (item: Activity) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const handleViewDetail = (item: Activity) => {
    router.push(`/administrator/activities/${item.id}`);
  };

  const handleSave = async () => {
    try {
      const parsed = CreateActivitySchema.parse(form);

      if (editing) {
        await updateActivity.mutateAsync({
          id: editing.id,
          data: parsed,
        });
      } else {
        await createActivity.mutateAsync(parsed);
      }

      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (err: any) {
      if (err.name === "ZodError") {
        toast.error(err.errors[0].message);
        return;
      }
      console.error(err);
      toast.error("Gagal menyimpan kegiatan");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;

    try {
      await deleteActivity.mutateAsync(deleting.id);
      toast.success("Kegiatan dihapus");
      setDeleteOpen(false);
    } catch (err: any) {
      toast.error(err.response?.error || "Gagal menghapus kegiatan");
    }
  };

  if (activitiesQuery.isLoading) {
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
            Manajemen Kegiatan
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola program kerja, progres, dan dokumentasi
          </p>
        </div>
        <PermissionGate permission={PERMISSIONS.CREATE_ACTIVITIES}>
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Kegiatan
          </Button>
        </PermissionGate>
      </div>

      <ActivityTable
        activities={activities}
        onEdit={openEdit}
        onDelete={openDelete}
        onViewDetail={handleViewDetail}
      />

      <ActivityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        isEdit={!!editing}
        form={form}
        setForm={setForm}
        onSubmit={handleSave}
      />

      <ActivityDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        activity={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};
