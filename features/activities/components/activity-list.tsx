"use client";

import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

import { useActivityContext } from "../contexts/ActivityContext";
import { Activity } from "../services/activityService";
import {
  CreateActivityInput,
  CreateActivitySchema,
} from "@/lib/validations/activity-schema";

import { ActivityGrid } from "./activity-table";
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

  const {
    activities,
    createActivity,
    updateActivity,
    deleteActivity,
    isFetchingActivities,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
  } = useActivityContext();

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
    router.push(`/dashboard/activities/${item.id}`);
  };

  const handleSave = async () => {
    try {
      const parsed = CreateActivitySchema.parse(form);

      if (editing) {
        await updateActivity({
          id: editing.id,
          data: parsed,
        });
      } else {
        await createActivity(parsed);
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
      await deleteActivity(deleting.id);
      toast.success("Kegiatan dihapus");
      setDeleteOpen(false);
    } catch (err: any) {
      toast.error(err.response?.error || "Gagal menghapus kegiatan");
    }
  };

  if (isFetchingActivities) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Activity Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and track all social activities and events.
          </p>
        </div>
        <PermissionGate permission={PERMISSIONS.CREATE_ACTIVITIES}>
          <Button
            onClick={openAdd}
            className="bg-primary hover:bg-primary/90 text-white shadow-sm inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-semibold transition-all"
          >
            <Plus className="h-5 w-5" /> Create Activity
          </Button>
        </PermissionGate>
      </div>

      {/* Filters & Search */}
      <div className="mb-8 flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-[#1e1429] lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input
            className="block w-full rounded-lg border-0 bg-slate-50 py-2.5 pl-10 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-white/5 dark:text-white dark:ring-slate-700 dark:focus:ring-primary sm:text-sm sm:leading-6 transition-all"
            placeholder="Search activities by name, location..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex w-full flex-wrap gap-2 lg:w-auto">
          {[
            { id: "all", label: "All Status" },
            { id: "perencanaan", label: "Perencanaan" },
            { id: "berjalan", label: "Berjalan" },
            { id: "selesai", label: "Selesai" },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                statusFilter === s.id
                  ? "bg-primary text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <ActivityGrid
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
