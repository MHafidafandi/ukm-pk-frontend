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
import { Recruitment } from "@/features/recruitment/services/recruitmentService";
import { CreateRecruitmentSchema } from "@/lib/validations/recruitment-schema";
import { z } from "zod";

type CreateRecruitmentInput = z.infer<typeof CreateRecruitmentSchema>;
import { RecruitmentFormDialog } from "./recruitment-form-dialog";
import { RecruitmentDeleteDialog } from "./recruitment-delete-dialog";
import { useRouter } from "next/navigation";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";

const emptyForm: CreateRecruitmentInput = {
  title: "",
  description: "",
  start_date: new Date(),
  end_date: new Date(),
  status: "draft",
  requirements: [],
};

export const RecruitmentList = () => {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [editing, setEditing] = useState<Recruitment | null>(null);
  const [deleting, setDeleting] = useState<Recruitment | null>(null);
  const [form, setForm] = useState<CreateRecruitmentInput>(emptyForm);

  const {
    recruitments,
    createRecruitment,
    updateRecruitment,
    deleteRecruitment,
    isFetchingRecruitments,
  } = useRecruitmentContext();

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (item: Recruitment) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description,
      start_date: new Date(item.start_date),
      end_date: new Date(item.end_date),
      status: item.status,
      requirements: item.requirements || [],
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
    try {
      const parsed = CreateRecruitmentSchema.parse(form);

      if (editing) {
        await updateRecruitment({
          id: editing.id,
          data: parsed,
        });
      } else {
        await createRecruitment(parsed);
      }

      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (err: any) {
      if (err.name === "ZodError") {
        toast.error(err.errors[0].message);
        return;
      }
      toast.error("Gagal menyimpan rekrutmen");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;

    try {
      await deleteRecruitment(deleting.id);
      toast.success("Rekrutmen dihapus");
      setDeleteOpen(false);
    } catch (err: any) {
      toast.error(err.response?.error || "Gagal menghapus rekrutmen");
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
  const pastRecruitments = recruitments.filter((r) => r.status !== "closed");

  // Custom mock data for dashboard stats
  const totalApplicants = 342;
  const pendingReviews = 156;

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-background-light dark:bg-background-dark min-h-screen text-text-light dark:text-text-dark font-sans">
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
              Total Applicants
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {totalApplicants}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Users className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-subtext-light dark:text-subtext-dark">
              Pending Reviews
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {pendingReviews}
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
                          recruitment.start_date,
                        ).toLocaleDateString()}{" "}
                        - {new Date(recruitment.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-primary dark:text-blue-400 mb-2">
                      {recruitment.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm max-w-2xl line-clamp-2">
                      {recruitment.description || "Tidak ada deskripsi."}
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

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">
                      Applicants
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                      128
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">
                      Screened
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                      45
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">
                      Interviewed
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                      12
                    </p>
                  </div>
                  <div className="flex items-end justify-end sm:col-start-4">
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
              <div className="h-1 w-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-1 bg-green-500"
                  style={{ width: "65%" }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Past Recruitments
          </h3>
          <div className="flex items-center bg-card-light dark:bg-card-dark rounded-lg p-1 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1 rounded-md text-sm font-medium shadow-sm transition-colors ${viewMode === "grid" ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 rounded-md text-sm font-medium shadow-sm transition-colors ${viewMode === "list" ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
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
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {pastRecruitments.map((recruitment) => {
              const isDraft = recruitment.status === "draft";
              const badgeBg = isDraft
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";

              return (
                <div
                  key={recruitment.id}
                  className={`bg-card-light dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 ${isDraft ? "border-dashed" : ""} hover:border-primary/50 dark:hover:border-blue-500/50 transition-all duration-200 flex flex-col`}
                >
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeBg}`}
                      >
                        {recruitment.status.charAt(0).toUpperCase() +
                          recruitment.status.slice(1)}
                      </span>
                      <div className="relative group">
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
                      {recruitment.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      {new Date(recruitment.start_date).toLocaleDateString()} -{" "}
                      {new Date(recruitment.end_date).toLocaleDateString()}
                    </p>

                    {isDraft ? (
                      <div className="flex items-center justify-center h-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 border-dashed">
                        <span className="text-xs text-gray-400">
                          No applicants yet
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex -space-x-2 overflow-hidden">
                          <img
                            alt=""
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800"
                            src="https://ui-avatars.com/api/?name=User+A&background=random"
                          />
                          <img
                            alt=""
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800"
                            src="https://ui-avatars.com/api/?name=User+B&background=random"
                          />
                          <img
                            alt=""
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800"
                            src="https://ui-avatars.com/api/?name=User+C&background=random"
                          />
                          <div className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                            +0
                          </div>
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Applicants
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 rounded-b-xl flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {isDraft ? "Draft details" : "Archived"}
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
        form={form}
        setForm={setForm}
        onSubmit={handleSave}
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
