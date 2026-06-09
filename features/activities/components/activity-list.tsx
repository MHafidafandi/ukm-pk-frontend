/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/api/client";

import { useActivityContext } from "../contexts/ActivityContext";
import { Activity } from "../services/activityService";
import {
  ActivityStatus,
  CreateActivityInput,
  CreateActivitySchema,
} from "@/lib/validations/activity-schema";

import { ActivityGrid } from "./activity-table";
import { ActivityFormDialog } from "./activity-form-dialog";
import { ActivityDeleteDialog } from "./activity-delete-dialog";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import { useQueryClient } from "@tanstack/react-query";

// ── Filter Pill ───────────────────────────────────────────────────────────────
const FilterPill = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
      active
        ? "bg-primary text-on-primary shadow-sm"
        : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high"
    }`}
  >
    {label}
  </button>
);

const emptyForm: CreateActivityInput = {
  judul: "",
  deskripsi: "",
  tanggal: new Date(),
  lokasi: "",
};

// ── Main Component ────────────────────────────────────────────────────────────
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
    updateActivityStatus,
    updateActivityFeatured,
    deleteActivity,
    isFetchingActivities,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sort,
    setSort,
    order,
    setOrder,
    page,
    setPage,
  } = useActivityContext();

  const queryClient = useQueryClient();

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

      if (editing) {
        const existingThumbnailUrl = editing.thumbnail || "";
        if (form.thumbnail instanceof File) {
          formData.append("thumbnail", form.thumbnail);
          formData.append("thumbnail_url", "");
        } else if (form.thumbnail === null) {
          formData.append("thumbnail", "");
          formData.append("thumbnail_url", "");
        } else if (existingThumbnailUrl) {
          formData.append("thumbnail_url", existingThumbnailUrl);
        } else {
          formData.append("thumbnail_url", "");
        }
        await updateActivity({ id: editing.id, data: formData });
        toast.success("Kegiatan berhasil diperbarui");
      } else {
        if (form.thumbnail instanceof File) {
          formData.append("thumbnail", form.thumbnail);
        }
        await createActivity(formData);
        toast.success("Kegiatan berhasil dibuat");
      }

      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "name" in err &&
        (err as any).name === "ZodError"
      ) {
        toast.error((err as any).errors[0].message);
        return;
      }
      toast.error(getErrorMessage(err) || "Gagal menyimpan kegiatan");
    }
  };

  const handleStatusChange = async (item: Activity, status: ActivityStatus) => {
    try {
      await updateActivityStatus({ id: item.id, data: { status } });
      toast.success("Status kegiatan diperbarui");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Gagal memperbarui status");
    }
  };

  const handleFeaturedChange = async (item: Activity, isFeatured: boolean) => {
    queryClient.setQueriesData({ queryKey: ["activities"] }, (old: any) => {
      if (!old) return old;
      const updateList = (list: Activity[]) =>
        list.map((a) =>
          a.id === item.id ? { ...a, is_featured: isFeatured } : a,
        );
      if (old?.data?.activities)
        return {
          ...old,
          data: { ...old.data, activities: updateList(old.data.activities) },
        };
      if (Array.isArray(old)) return updateList(old);
      return old;
    });
    try {
      await updateActivityFeatured({
        id: item.id,
        data: { is_featured: isFeatured },
      });
      toast.success("Featured diperbarui");
    } catch (err: unknown) {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast.error(getErrorMessage(err) || "Gagal memperbarui featured");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteActivity(deleting.id);
      toast.success("Kegiatan dihapus");
      setDeleteOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Gagal menghapus kegiatan");
    }
  };

  // Pagination
  const totalPages = pagination?.total_pages ?? 1;
  const currentPage = page;
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const getPageNumbers = (): (number | "ellipsis")[] => {
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
      )
        pages.push(i);
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-['Manrope'] font-bold text-3xl text-on-surface tracking-tight">
            Manajemen Kegiatan
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Pantau dan kelola semua kegiatan sosial dan acara organisasi.
          </p>
        </div>
        <PermissionGate permission={PERMISSIONS.CREATE_ACTIVITIES}>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white text-sm font-bold shadow-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Buat Kegiatan
          </button>
        </PermissionGate>
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-surface-container-low rounded-2xl px-6 py-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
          <input
            type="text"
            placeholder="Cari kegiatan berdasarkan judul atau lokasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-lowest rounded-full py-2.5 pl-10 pr-4 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: "", label: "Semua" },
              { id: "perencanaan", label: "Perencanaan" },
              { id: "berjalan", label: "Berjalan" },
              { id: "selesai", label: "Selesai" },
            ].map((s) => (
              <FilterPill
                key={s.id}
                label={s.label}
                active={statusFilter === s.id}
                onClick={() => setStatusFilter(s.id)}
              />
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-surface-container-lowest border-0 border-b-2 border-outline-variant rounded-t-lg px-3 py-2 text-xs font-medium text-on-surface-variant outline-none focus:border-primary transition-colors"
            >
              <option value="tanggal">Tanggal</option>
              <option value="judul">Judul</option>
              <option value="status">Status</option>
            </select>
            <button
              onClick={() => setOrder(order === "ASC" ? "DESC" : "ASC")}
              className="px-3 py-2 rounded-xl bg-surface-container-lowest text-on-surface-variant text-xs font-bold hover:bg-surface-container-high transition-colors"
            >
              {order === "ASC" ? "↑ Asc" : "↓ Desc"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Grid / Loading ── */}
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
          onStatusChange={handleStatusChange}
          onFeaturedChange={handleFeaturedChange}
        />
      )}

      {/* ── Pagination ── */}
      {pagination && (
        <div className="flex items-center justify-between px-2">
          <p className="text-xs text-on-surface-variant">
            Halaman {currentPage} dari {totalPages} · Total{" "}
            {pagination?.total ?? 0} kegiatan
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={!hasPrev}
              className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-highest transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {getPageNumbers().map((p, i) =>
              p === "ellipsis" ? (
                <span
                  key={`e-${i}`}
                  className="w-9 h-9 flex items-center justify-center text-sm text-on-surface-variant"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                    currentPage === p
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container-highest"
                  }`}
                >
                  {p}
                </button>
              ),
            )}

            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={!hasNext}
              className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-highest transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Dialogs ── */}
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
