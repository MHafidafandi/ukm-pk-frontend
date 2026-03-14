"use client";

import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  LayoutGrid,
  UserCheck,
  GraduationCap,
  TrendingUp,
  Search,
} from "lucide-react";

import { useDivisionContext } from "@/features/divisions/contexts/DivisionContext";
import { Division } from "@/features/divisions/services/divisionService";
import { z } from "zod";

import { DivisionFormDialog } from "./division-form-dialog";
import { DivisionDeleteDialog } from "./division-delete-dialog";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import { DivisionCard } from "./division-table";

const createDivisionSchema = z.object({
  nama_divisi: z.string().min(1, "Nama divisi wajib diisi"),
  deskripsi: z.string().optional(),
});

type CreateDivisionInput = z.infer<typeof createDivisionSchema>;

const emptyForm: CreateDivisionInput = {
  nama_divisi: "",
  deskripsi: "",
};

// ── Stat Card ──────────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bg: string;
}) => (
  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-800 p-5 flex items-center gap-4 shadow-sm">
    <div className={`p-3 rounded-xl ${bg}`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <div>
      <p className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
        {value}
      </p>
      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
        {label}
      </p>
    </div>
  </div>
);

// ── Division Card ──────────────────────────────────────────────────────────

// ── Main Component ─────────────────────────────────────────────────────────

export const DivisionsList = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Division | null>(null);
  const [deleting, setDeleting] = useState<Division | null>(null);
  const [form, setForm] = useState<CreateDivisionInput>(emptyForm);

  const {
    divisions,
    stats,
    search,
    setSearch,
    createDivision,
    updateDivision,
    deleteDivision,
    isFetchingDivisions,
    isFetchingStats,
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
        await updateDivision({ id: editing.id, data: parsed });
        toast.success("Divisi berhasil diperbarui");
      } else {
        await createDivision(parsed);
        toast.success("Divisi berhasil ditambahkan");
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

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light dark:bg-slate-900 min-h-[calc(100vh-4rem)] font-display text-text-primary-light dark:text-text-primary-dark">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
              Manajemen Divisi
            </h1>
            <p className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Kelola data divisi dan departemen organisasi
            </p>
          </div>
          <PermissionGate permission={PERMISSIONS.CREATE_DIVISIONS}>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="h-5 w-5" />
              Tambah Divisi
            </button>
          </PermissionGate>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {isFetchingStats ? (
            <div className="col-span-full flex justify-center py-6">
              <Spinner className="h-6 w-6" />
            </div>
          ) : (
            <>
              <StatCard
                label="Total Divisi"
                value={stats?.total_divisions ?? 0}
                icon={LayoutGrid}
                color="text-purple-600"
                bg="bg-purple-50 dark:bg-purple-900/20"
              />
              <StatCard
                label="Total Anggota"
                value={stats?.total_users ?? 0}
                icon={Users}
                color="text-blue-600"
                bg="bg-blue-50 dark:bg-blue-900/20"
              />
              <StatCard
                label="Rata-rata per Divisi"
                value={
                  (stats?.total_divisions ?? 0) > 0
                    ? Math.round(
                      (stats?.total_users ?? 0) /
                      (stats?.total_divisions ?? 1),
                    )
                    : 0
                }
                icon={TrendingUp}
                color="text-emerald-600"
                bg="bg-emerald-50 dark:bg-emerald-900/20"
              />
            </>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-400 h-4 w-4" />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
            placeholder="Cari divisi..."
            type="text"
          />
        </div>

        {/* Grid */}
        {isFetchingDivisions ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-8 w-8" />
          </div>
        ) : divisions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 ...">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
              <LayoutGrid className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-semibold text-lg ...">
              Belum Ada Divisi
            </p>
            <p className="text-sm mt-1">
              {search
                ? "Tidak ada divisi yang cocok dengan pencarian."
                : "Tambahkan divisi pertama organisasi Anda."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {divisions.map((division, index) => (
              <DivisionCard
                key={division.id}
                division={division}
                index={index}
                onEdit={openEdit}
                onDelete={openDelete}
              />
            ))}
          </div>
        )}
      </div>

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
