"use client";

import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  PlayCircle,
  Users,
  Clock,
  Calendar,
  Edit,
  Trash2,
  ArrowRight,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

export const RecruitmentList = () => {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [editing, setEditing] = useState<Recruitment | null>(null);
  const [deleting, setDeleting] = useState<Recruitment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state — raw input values (Date objects from Calendar, strings from Input)
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

  // --- Helpers ---

  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // --- Handlers ---

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
    // Validation
    if (!formData.nama_recruitment.trim()) {
      toast.error("Judul rekrutmen wajib diisi");
      return;
    }
    if (!formData.deskripsi.trim()) {
      toast.error("Deskripsi rekrutmen wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editing) {
        // UPDATE
        const payload: UpdateRecruitmentDTO = {
          nama_recruitment: formData.nama_recruitment,
          deskripsi: formData.deskripsi,
          tanggal_buka: formatDateToString(formData.tanggal_buka),
          tanggal_tutup: formatDateToString(formData.tanggal_tutup),
        };
        if (formData.announcement_link) {
          payload.announcement_link = formData.announcement_link;
        }
        await updateRecruitment(editing.id, payload);

      } else {
        // CREATE
        const payload: CreateRecruitmentDTO = {
          nama_recruitment: formData.nama_recruitment,
          deskripsi: formData.deskripsi,
          tanggal_buka: formatDateToString(formData.tanggal_buka),
          tanggal_tutup: formatDateToString(formData.tanggal_tutup),
        };
        await createRecruitment(payload);

      }

      setFormOpen(false);
      setEditing(null);
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;

    try {
      await deleteRecruitment(deleting.id);
      setDeleteOpen(false);
      setDeleting(null);
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleOpenStatus = async (item: Recruitment) => {
    try {
      await openRecruitment(item.id);

    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleCloseStatus = async (item: Recruitment) => {
    try {
      await closeRecruitment(item.id);

    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleArchiveStatus = async (item: Recruitment) => {
    try {
      await archiveRecruitment(item.id);

    } catch (err: any) {
      toast.error(getErrorMessage(err));
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

  return (
    <div className=" space-y-8 bg-slate-50 dark:bg-slate-900 min-h-screen text-text-light dark:text-text-dark font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recruitment Periods
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage ongoing and past recruitment drives for UKM-PK.
          </p>
        </div>
        <PermissionGate permission={PERMISSIONS.CREATE_RECRUITMENTS}>
          <Button
            onClick={openAdd}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Recruitment
          </Button>
        </PermissionGate>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-subtext-light dark:text-subtext-dark">
              Active Periods
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {activeRecruitments.length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
            <PlayCircle className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-subtext-light dark:text-subtext-dark">
              Total Recruitments
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {recruitments.length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Users className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-subtext-light dark:text-subtext-dark">
              Draft / Closed
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {pastRecruitments.length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {activeRecruitments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Active Recruitment
          </h3>

          {activeRecruitments.map((recruitment) => (
            <div
              key={recruitment.id}
              className="bg-card-light dark:bg-card-dark rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Open
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 inline-flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(
                          recruitment.tanggal_buka
                        ).toLocaleDateString()}{" "}
                        -{" "}
                        {new Date(
                          recruitment.tanggal_tutup
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-primary dark:text-blue-400 mb-2">
                      {recruitment.nama_recruitment}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm max-w-2xl line-clamp-2">
                      {recruitment.deskripsi || "Tidak ada deskripsi."}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <PermissionGate permission={PERMISSIONS.EDIT_RECRUITMENTS}>
                      <button
                        onClick={() => openEdit(recruitment)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </PermissionGate>
                    <PermissionGate
                      permission={PERMISSIONS.DELETE_RECRUITMENTS}
                    >
                      <button
                        onClick={() => openDelete(recruitment)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </PermissionGate>
                  </div>
                </div>

                <div className="mt-6 flex justify-end pt-6 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => handleViewRegistrants(recruitment)}
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark dark:hover:text-blue-300 transition-colors"
                  >
                    View Registrants
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            All Recruitments
          </h3>
          <div className="flex items-center bg-card-light dark:bg-card-dark rounded-lg p-1 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1 rounded-md text-sm font-medium shadow-sm transition-colors ${viewMode === "grid"
                ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 rounded-md text-sm font-medium shadow-sm transition-colors ${viewMode === "list"
                ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              List
            </button>
          </div>
        </div>

        {pastRecruitments.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center p-12 bg-card-light dark:bg-card-dark rounded-xl border border-dashed border-gray-200 dark:border-gray-800 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 text-gray-400">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Tidak ada data rekrutmen
            </h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Belum ada data rekrutmen lain yang pernah dibuat atau data
              rekrutmen sedang kosong.
            </p>
          </div>
        ) : viewMode === "list" ? (
          <RecruitmentTable
            recruitments={pastRecruitments}
            onEdit={openEdit}
            onDelete={openDelete}
            onViewRegistrants={handleViewRegistrants}
            onOpen={handleOpenStatus}
            onClose={handleCloseStatus}
            onArchive={handleArchiveStatus}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {pastRecruitments.map((recruitment) => {
              const isDraft = recruitment.status === "draft";
              const badgeBg = isDraft
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";

              return (
                <div
                  key={recruitment.id}
                  className={`bg-card-light dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 ${isDraft ? "border-dashed" : ""
                    } hover:border-primary/50 dark:hover:border-blue-500/50 transition-all duration-200 flex flex-col`}
                >
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeBg}`}
                      >
                        {recruitment.status.charAt(0).toUpperCase() +
                          recruitment.status.slice(1)}
                      </span>
                      <div className="flex items-center gap-1">
                        <PermissionGate
                          permission={PERMISSIONS.EDIT_RECRUITMENTS}
                        >
                          <button
                            onClick={() => openEdit(recruitment)}
                            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </PermissionGate>
                        <PermissionGate
                          permission={PERMISSIONS.DELETE_RECRUITMENTS}
                        >
                          <button
                            onClick={() => openDelete(recruitment)}
                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </PermissionGate>
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
                      {recruitment.nama_recruitment}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      {new Date(
                        recruitment.tanggal_buka
                      ).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(
                        recruitment.tanggal_tutup
                      ).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {recruitment.deskripsi || "Tidak ada deskripsi."}
                    </p>
                  </div>

                  <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 rounded-b-xl flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {isDraft ? "Draft" : "Closed"}
                    </span>
                    {isDraft ? (
                      <button
                        onClick={() => openEdit(recruitment)}
                        className="text-sm font-medium text-primary hover:text-primary-dark dark:hover:text-blue-400"
                      >
                        Continue Editing
                      </button>
                    ) : (
                      <button
                        onClick={() => handleViewRegistrants(recruitment)}
                        className="text-sm font-medium text-primary hover:text-primary-dark dark:hover:text-blue-400"
                      >
                        Details
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
    </div>
  );
};
