// @/features/recruitment/components/recruitment-list.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { useRecruitmentContext } from "@/features/recruitment/contexts/RecruitmentContext";
import {
  Recruitment,
  CreateRecruitmentDTO,
  UpdateRecruitmentDTO,
} from "@/features/recruitment/services/recruitmentService";
import {
  CreateRecruitmentInput,
  defaultRecruitmentForm,
} from "@/lib/validations/recruitment-schema";
import { RecruitmentTable } from "./recruitment-table";
import { RecruitmentFormDialog } from "./recruitment-form-dialog";
import { RecruitmentDeleteDialog } from "./recruitment-delete-dialog";
import { format } from "date-fns";
import { AlertDialog } from "radix-ui";

// ---- Helpers ----

/** Form state → API create DTO */
function formToCreateDTO(form: CreateRecruitmentInput): CreateRecruitmentDTO {
  return {
    nama_recruitment: form.nama_recruitment,
    deskripsi: form.deskripsi || undefined,
    tanggal_buka: format(form.start_date, "yyyy-MM-dd"),
    tanggal_tutup: format(form.end_date, "yyyy-MM-dd"),
  };
}

/** Form state → API update DTO */
function formToUpdateDTO(form: CreateRecruitmentInput): UpdateRecruitmentDTO {
  return {
    nama_recruitment: form.nama_recruitment,
    deskripsi: form.deskripsi || undefined,
    tanggal_buka: format(form.start_date, "yyyy-MM-dd"),
    tanggal_tutup: format(form.end_date, "yyyy-MM-dd"),
    announcement_link: form.announcement_link || undefined,
  };
}

/** API model → form state (for editing) */
function recruitmentToForm(r: Recruitment): CreateRecruitmentInput {
  return {
    nama_recruitment: r.nama_recruitment,
    deskripsi: r.deskripsi ?? "",
    start_date: new Date(r.tanggal_buka),
    end_date: new Date(r.tanggal_tutup),
    announcement_link: r.announcement_link ?? "",
  };
}

export const RecruitmentList = () => {
  const router = useRouter();
  const {
    recruitments,
    recruitmentPagination,
    isFetchingRecruitments,
    recruitmentFilters,
    setRecruitmentFilters,
    createRecruitment,
    updateRecruitment,
    deleteRecruitment,
    openRecruitment,
    closeRecruitment,
    archiveRecruitment,
  } = useRecruitmentContext();

  // ---- Local UI states ----
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingRecruitment, setDeletingRecruitment] =
    useState<Recruitment | null>(null);
  const [form, setForm] =
    useState<CreateRecruitmentInput>(defaultRecruitmentForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // ---- Handlers ----

  const handleSearch = () => {
    setRecruitmentFilters((prev) => ({
      ...prev,
      search: searchValue,
      page: 1,
    }));
  };

  const handleOpenCreate = () => {
    setIsEdit(false);
    setEditingId(null);
    setForm(defaultRecruitmentForm);
    setFormOpen(true);
  };

  const handleOpenEdit = (recruitment: Recruitment) => {
    setIsEdit(true);
    setEditingId(recruitment.id);
    setForm(recruitmentToForm(recruitment));
    setFormOpen(true);
  };

  const handleOpenDelete = (recruitment: Recruitment) => {
    setDeletingRecruitment(recruitment);
    setDeleteOpen(true);
  };

  const handleViewRegistrants = (recruitment: Recruitment) => {
    router.push(
      `/administrator/recruitments/${recruitment.id}/registrants`
    );
  };

  const handleSubmit = async () => {
    if (!form.nama_recruitment.trim()) {
      toast.error("Judul kegiatan wajib diisi");
      return;
    }
    if (form.end_date < form.start_date) {
      toast.error("Tanggal selesai tidak boleh sebelum tanggal mulai");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit && editingId) {
        await updateRecruitment(editingId, formToUpdateDTO(form));
        toast.success("Rekrutmen berhasil diperbarui");
      } else {
        await createRecruitment(formToCreateDTO(form));
        toast.success("Rekrutmen berhasil dibuat");
      }
      setFormOpen(false);
      setForm(defaultRecruitmentForm);
      setEditingId(null);
    } catch {
      toast.error(
        isEdit ? "Gagal memperbarui rekrutmen" : "Gagal membuat rekrutmen"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRecruitment) return;
    setIsDeleting(true);
    try {
      await deleteRecruitment(deletingRecruitment.id);
      toast.success("Rekrutmen berhasil dihapus");
      setDeleteOpen(false);
      setDeletingRecruitment(null);
    } catch {
      toast.error("Gagal menghapus rekrutmen");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpen = async (recruitment: Recruitment) => {
    try {
      await openRecruitment(recruitment.id);
      toast.success("Pendaftaran berhasil dibuka");
    } catch {
      toast.error("Gagal membuka pendaftaran");
    }
  };

  const handleClose = async (recruitment: Recruitment) => {
    try {
      await closeRecruitment(recruitment.id);
      toast.success("Pendaftaran berhasil ditutup");
    } catch {
      toast.error("Gagal menutup pendaftaran");
    }
  };

  const handleArchive = async (recruitment: Recruitment) => {
    try {
      await archiveRecruitment(recruitment.id);
      toast.success("Rekrutmen berhasil diarsipkan");
    } catch {
      toast.error("Gagal mengarsipkan rekrutmen");
    }
  };

  // ---- Render ----

  if (isFetchingRecruitments && recruitments.length === 0) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Manajemen Rekrutmen
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola periode pendaftaran dan lihat data pendaftar.
          </p>
        </div>
        <PermissionGuard permission={PERMISSIONS.CREATE_RECRUITMENT}>
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Buat Rekrutmen
          </Button>
        </PermissionGuard>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 max-w-sm">
        <Input
          placeholder="Cari rekrutmen..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button variant="outline" size="icon" onClick={handleSearch}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Total Rekrutmen
          </p>
          <p className="text-2xl font-bold">
            {recruitmentPagination?.total ?? recruitments.length}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Rekrutmen Aktif
          </p>
          <p className="text-2xl font-bold text-green-600">
            {recruitments.filter((r) => r.status === "open").length}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Rekrutmen Ditutup
          </p>
          <p className="text-2xl font-bold text-red-600">
            {recruitments.filter((r) => r.status === "closed").length}
          </p>
        </div>
      </div>

      {/* Table */}
      <RecruitmentTable
        data={recruitments}
        isLoading={isLoadingRecruitments}
        pagination={recruitmentPagination}
        onPageChange={(page) =>
          setRecruitmentParams((prev) => ({ ...prev, page }))
        }
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onStatusChange={handleStatusChange}
        onViewRegistrants={handleViewRegistrants}
      />

      {/* Create / Edit Dialog */}
      <RecruitmentFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        mode={formMode}
        initialData={selectedRecruitment}
        onSubmit={handleFormSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Rekrutmen</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus rekrutmen{" "}
              <span className="font-semibold">
                {selectedRecruitment?.nama_recruitment}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusAction === "open"
                ? "Buka Rekrutmen"
                : statusAction === "close"
                  ? "Tutup Rekrutmen"
                  : "Arsipkan Rekrutmen"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusAction === "open" &&
                "Rekrutmen akan dibuka dan dapat menerima pendaftar baru."}
              {statusAction === "close" &&
                "Rekrutmen akan ditutup dan tidak dapat menerima pendaftar baru."}
              {statusAction === "archive" &&
                "Rekrutmen akan diarsipkan. Pastikan semua data sudah diproses."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isChangingStatus}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmStatusChange}
              disabled={isChangingStatus}
            >
              {isChangingStatus ? "Memproses..." : "Konfirmasi"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}