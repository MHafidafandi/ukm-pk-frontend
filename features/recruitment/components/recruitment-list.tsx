"use client";

import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Users,
  Calendar,
  Edit,
  Trash2,
  ArrowRight,
  LockOpen,
  Lock,
  Archive,
  LayoutGrid,
  List,
} from "lucide-react";

import { useRecruitmentContext } from "@/features/recruitment/contexts/RecruitmentContext";
import {
  Recruitment,
  CreateRecruitmentDTO,
  UpdateRecruitmentDTO,
} from "@/features/recruitment/services/recruitmentService";
import { RecruitmentFormDialog } from "./recruitment-form-dialog";
import { RecruitmentDeleteDialog } from "./recruitment-delete-dialog";
import { RecruitmentTable } from "./recruitment-table";
import { useRouter } from "next/navigation";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import { getErrorMessage } from "@/lib/api/client";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const statusConfig: Record<string, { label: string; className: string }> = {
  open: {
    label: "Dibuka",
    className: "bg-primary-fixed text-on-primary-fixed-variant",
  },
  closed: {
    label: "Ditutup",
    className: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  },
  draft: {
    label: "Draft",
    className: "bg-surface-container-high text-on-surface-variant",
  },
};

export const RecruitmentList = () => {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [editing, setEditing] = useState<Recruitment | null>(null);
  const [deleting, setDeleting] = useState<Recruitment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nama_recruitment: "",
    deskripsi: "",
    tanggal_buka: new Date(),
    tanggal_tutup: new Date(),
    announcement_link: "",
  });

  const {
    recruitments,
    createRecruitment,
    updateRecruitment,
    deleteRecruitment,
    openRecruitment,
    closeRecruitment,
    archiveRecruitment,
    isFetchingRecruitments,
  } = useRecruitmentContext();

  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const openAdd = () => {
    setEditing(null);
    setFormData({
      nama_recruitment: "",
      deskripsi: "",
      tanggal_buka: new Date(),
      tanggal_tutup: new Date(),
      announcement_link: "",
    });
    setFormOpen(true);
  };

  const openEdit = (item: Recruitment) => {
    setEditing(item);
    setFormData({
      nama_recruitment: item.nama_recruitment,
      deskripsi: item.deskripsi || "",
      tanggal_buka: new Date(item.tanggal_buka),
      tanggal_tutup: new Date(item.tanggal_tutup),
      announcement_link: item.announcement_link || "",
    });
    setFormOpen(true);
  };

  const openDelete = (item: Recruitment) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const handleViewRegistrants = (item: Recruitment) => {
    router.push(`/dashboard/recruitment/${item.id}/registrants`);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        nama_recruitment: formData.nama_recruitment,
        deskripsi: formData.deskripsi,
        tanggal_buka: formatDateToString(formData.tanggal_buka),
        tanggal_tutup: formatDateToString(formData.tanggal_tutup),
        ...(editing && { announcement_link: formData.announcement_link }),
      };

      if (editing) {
        await updateRecruitment(editing.id, payload as UpdateRecruitmentDTO);
        toast.success("Rekrutmen berhasil diperbarui");
      } else {
        await createRecruitment(payload as CreateRecruitmentDTO);
        toast.success("Rekrutmen berhasil dibuat");
      }
      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      toast.error(getErrorMessage(err) || "Gagal menyimpan rekrutmen");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteRecruitment(deleting.id);
      toast.success("Rekrutmen dihapus");
      setDeleteOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err) || "Gagal menghapus rekrutmen");
    }
  };

  const handleOpenStatus = async (item: Recruitment) => {
    try {
      await openRecruitment(item.id);
      toast.success("Pendaftaran dibuka");
    } catch (err) {
      toast.error(getErrorMessage(err) || "Gagal membuka pendaftaran");
    }
  };

  const handleCloseStatus = async (item: Recruitment) => {
    try {
      await closeRecruitment(item.id);
      toast.success("Pendaftaran ditutup");
    } catch (err) {
      toast.error(getErrorMessage(err) || "Gagal menutup pendaftaran");
    }
  };

  const handleArchiveStatus = async (item: Recruitment) => {
    try {
      await archiveRecruitment(item.id);
      toast.success("Rekrutmen diarsipkan");
    } catch (err) {
      toast.error(getErrorMessage(err) || "Gagal mengarsipkan rekrutmen");
    }
  };

  if (isFetchingRecruitments) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const activeRecruitments = recruitments.filter((r) => r.status === "open");
  const pastRecruitments = recruitments.filter((r) => r.status !== "open");

  const statCards = [
    {
      label: "Total Rekrutmen",
      value: recruitments.length,
      icon: Calendar,
      bg: "bg-secondary-container",
      color: "text-on-secondary-container",
    },
    {
      label: "Pendaftaran Aktif",
      value: activeRecruitments.length,
      icon: Users,
      bg: "bg-primary-fixed",
      color: "text-on-primary-fixed-variant",
    },
    {
      label: "Pending Review",
      value: recruitments.filter((r) => r.status === "draft").length,
      icon: Archive,
      bg: "bg-tertiary-fixed",
      color: "text-on-tertiary-fixed-variant",
    },
  ];

  return (
    <>
      {/* ── Page Header ── */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-['Manrope'] text-3xl font-bold text-on-surface tracking-tight">
            Recruitment Phases
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Kelola siklus rekrutmen dan pendaftar organisasi.
          </p>
        </div>
        <PermissionGate permission={PERMISSIONS.CREATE_RECRUITMENTS}>
          <button
            onClick={openAdd}
            className="bg-primary-gradient text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-ambient hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            Buka Rekrutmen
          </button>
        </PermissionGate>
      </header>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-surface-container-lowest rounded-2xl p-6 flex items-center gap-4 shadow-ambient"
            >
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${card.bg}`}
              >
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">
                  {card.label}
                </p>
                <p className="font-['Manrope'] text-2xl font-bold text-on-surface">
                  {card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Active Recruitments ── */}
      {activeRecruitments.length > 0 && (
        <section className="mb-8">
          <h2 className="font-['Manrope'] text-lg font-bold text-on-surface mb-4">
            Pendaftaran Aktif
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeRecruitments.map((item) => (
              <div
                key={item.id}
                className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient border-l-4 border-primary"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-['Manrope'] text-base font-bold text-on-surface truncate">
                      {item.nama_recruitment}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-on-surface-variant">
                      <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="text-xs">
                        {format(new Date(item.tanggal_buka), "dd MMM", {
                          locale: idLocale,
                        })}{" "}
                        –{" "}
                        {format(new Date(item.tanggal_tutup), "dd MMM yyyy", {
                          locale: idLocale,
                        })}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant flex-shrink-0 ml-3">
                    Aktif
                  </span>
                </div>

                <p className="text-sm text-on-surface-variant line-clamp-2 mb-4">
                  {item.deskripsi || "Tidak ada deskripsi."}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
                  <div className="flex items-center gap-1">
                    <PermissionGate permission={PERMISSIONS.EDIT_RECRUITMENTS}>
                      <button
                        onClick={() => handleCloseStatus(item)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-tertiary-fixed-variant hover:bg-tertiary-fixed/20 transition-colors"
                        title="Tutup Pendaftaran"
                      >
                        <Lock className="h-4 w-4" />
                      </button>
                    </PermissionGate>
                    <PermissionGate permission={PERMISSIONS.EDIT_RECRUITMENTS}>
                      <button
                        onClick={() => openEdit(item)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </PermissionGate>
                    <PermissionGate
                      permission={PERMISSIONS.DELETE_RECRUITMENTS}
                    >
                      <button
                        onClick={() => openDelete(item)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-destructive hover:bg-destructive/5 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </PermissionGate>
                  </div>
                  <button
                    onClick={() => handleViewRegistrants(item)}
                    className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline"
                  >
                    Lihat Pendaftar <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── All Recruitments ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-['Manrope'] text-lg font-bold text-on-surface">
            Semua Rekrutmen
          </h2>
          <div className="flex items-center gap-1 bg-surface-container rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {pastRecruitments.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-ambient">
            <div className="h-16 w-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-on-surface-variant" />
            </div>
            <p className="font-['Manrope'] font-bold text-lg text-on-surface">
              Tidak ada data rekrutmen
            </p>
            <p className="text-sm text-on-surface-variant mt-1">
              Belum ada rekrutmen lain yang dibuat.
            </p>
          </div>
        ) : viewMode === "list" ? (
          <div className="bg-surface-container-lowest rounded-2xl shadow-ambient overflow-hidden">
            <RecruitmentTable
              recruitments={pastRecruitments}
              onEdit={openEdit}
              onDelete={openDelete}
              onViewRegistrants={handleViewRegistrants}
              onOpen={handleOpenStatus}
              onClose={handleCloseStatus}
              onArchive={handleArchiveStatus}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pastRecruitments.map((item) => {
              const status = statusConfig[item.status] ?? {
                label: item.status,
                className: "bg-surface-container text-on-surface-variant",
              };
              return (
                <div
                  key={item.id}
                  className="bg-surface-container-lowest rounded-2xl p-5 shadow-ambient flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${status.className}`}
                    >
                      {status.label}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <PermissionGate
                        permission={PERMISSIONS.EDIT_RECRUITMENTS}
                      >
                        <button
                          onClick={() => handleOpenStatus(item)}
                          title="Buka"
                          className="p-1 rounded-lg text-on-surface-variant hover:text-on-primary-fixed-variant hover:bg-primary-fixed/30 transition-colors"
                        >
                          <LockOpen className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleArchiveStatus(item)}
                          title="Arsip"
                          className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                      </PermissionGate>
                      <PermissionGate
                        permission={PERMISSIONS.DELETE_RECRUITMENTS}
                      >
                        <button
                          onClick={() => openDelete(item)}
                          className="p-1 rounded-lg text-on-surface-variant hover:text-destructive hover:bg-destructive/5 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </PermissionGate>
                    </div>
                  </div>

                  <h4 className="font-['Manrope'] font-bold text-base text-on-surface mb-1 line-clamp-1">
                    {item.nama_recruitment}
                  </h4>
                  <p className="text-xs text-on-surface-variant mb-3">
                    {format(new Date(item.tanggal_buka), "dd MMM", {
                      locale: idLocale,
                    })}{" "}
                    –{" "}
                    {format(new Date(item.tanggal_tutup), "dd MMM yyyy", {
                      locale: idLocale,
                    })}
                  </p>
                  <p className="text-sm text-on-surface-variant line-clamp-2 flex-1">
                    {item.deskripsi || "Tidak ada deskripsi."}
                  </p>

                  <div className="mt-4 pt-4 border-t border-outline-variant/10 flex justify-end">
                    <button
                      onClick={() => handleViewRegistrants(item)}
                      className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline"
                    >
                      {item.status === "draft" ? "Lanjut Edit" : "Detail"}{" "}
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <RecruitmentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        isEdit={!!editing}
        form={formData}
        setForm={setFormData}
        onSubmit={handleSave}
        isSubmitting={isSubmitting}
      />
      <RecruitmentDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        recruitment={deleting}
        onConfirm={handleDelete}
      />
    </>
  );
};
