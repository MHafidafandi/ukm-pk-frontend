"use client";

import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
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
    pagination,
    createActivity,
    updateActivity,
    deleteActivity,
    isFetchingActivities,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
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
      tanggal: new Date(item.tanggal),
      lokasi: item.lokasi,
      thumbnail: undefined,
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

      const formData = new FormData();
      formData.append("judul", parsed.judul);
      formData.append("deskripsi", parsed.deskripsi);
      formData.append("lokasi", parsed.lokasi);
      formData.append(
        "tanggal",
        parsed.tanggal instanceof Date
          ? parsed.tanggal.toISOString().split("T")[0]
          : String(parsed.tanggal),
      );

      if (form.thumbnail instanceof File) {
        formData.append("thumbnail", form.thumbnail);
      } else if (form.thumbnail === null) {
        // null = sinyal untuk menghapus thumbnail dari server
        formData.append("thumbnail", "");
      }

      if (editing) {
        await updateActivity({ id: editing.id, data: formData });
        toast.success("Kegiatan berhasil diperbarui");
      } else {
        await createActivity(formData);
        toast.success("Kegiatan berhasil ditambahkan");
      }

      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (err: any) {
      if (err.name === "ZodError") {
        toast.error(err.errors[0].message);
        return;
      }
      const message =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Gagal menyimpan kegiatan";
      toast.error(message);
      console.error("[handleSave] error:", err);
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

  // ── Pagination helpers ──────────────────────────────
  const totalPages = pagination?.total_pages ?? 1;
  const currentPage = page;
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
            <Search className="size-4" />
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
            { id: "", label: "All Status" },
            { id: "perencanaan", label: "Perencanaan" },
            { id: "berjalan", label: "Berjalan" },
            { id: "selesai", label: "Selesai" },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${statusFilter === s.id
                ? "bg-primary text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
                }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid / Loading */}
      {isFetchingActivities ? (
        <div className="flex h-48 w-full items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <ActivityGrid
          activities={activities}
          onEdit={openEdit}
          onDelete={openDelete}
          onViewDetail={handleViewDetail}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-4">
          <button
            onClick={() => setPage(currentPage - 1)}
            disabled={!hasPrev}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-40 dark:text-slate-400 dark:hover:bg-white/5"
          >
            <ChevronLeft className="size-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {getPageNumbers().map((p, i) =>
            p === "ellipsis" ? (
              <span
                key={`ellipsis-${i}`}
                className="flex size-9 items-center justify-center text-sm text-slate-400"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === p
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
                  }`}
              >
                {p}
              </button>
            ),
          )}

          <button
            onClick={() => setPage(currentPage + 1)}
            disabled={!hasNext}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-40 dark:text-slate-400 dark:hover:bg-white/5"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}

      {pagination && (
        <p className="text-center text-xs text-muted-foreground">
          Halaman {currentPage} dari {totalPages} &middot; Total{" "}
          {pagination.total} kegiatan
        </p>
      )}

      {/* Dialogs */}
      <ActivityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        isEdit={!!editing}
        form={form}
        setForm={setForm}
        onSubmit={handleSave}
        existingThumbnailUrl={editing?.thumbnail}
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
