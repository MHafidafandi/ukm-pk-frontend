/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Users, LayoutGrid, TrendingUp, Search } from "lucide-react";

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
const emptyForm: CreateDivisionInput = { nama_divisi: "", deskripsi: "" };

export const DivisionsList = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Division | null>(null);
  const [deleting, setDeleting] = useState<Division | null>(null);
  const [form, setForm] = useState<CreateDivisionInput>(emptyForm);

  const {
    divisions,
    divisionStats,
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

  const statCards = [
    {
      label: "Total Divisi",
      value: divisionStats?.total_divisions ?? 0,
      icon: LayoutGrid,
    },
    {
      label: "Total Anggota",
      value: divisionStats?.total_users ?? 0,
      icon: Users,
    },
    {
      label: "Rata-rata per Divisi",
      value:
        (divisionStats?.total_divisions ?? 0) > 0
          ? Math.round(
              (divisionStats?.total_users ?? 0) /
                (divisionStats?.total_divisions ?? 1),
            )
          : 0,
      icon: TrendingUp,
    },
  ];

  return (
    <>
      {/* ── Page Header ── */}
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-['Manrope'] text-3xl font-bold text-on-surface tracking-tight">
            Division Portfolio
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Kelola struktur organisasi dan alokasi sumber daya.
          </p>
        </div>
        <PermissionGate permission={PERMISSIONS.CREATE_DIVISIONS}>
          <button
            onClick={openAdd}
            className="bg-primary-gradient text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-ambient hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            Divisi Baru
          </button>
        </PermissionGate>
      </header>

      {/* ── Stats ── */}
      {isFetchingStats ? (
        <div className="flex justify-center py-8">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-surface-container-lowest rounded-2xl p-6 flex items-center gap-4 shadow-ambient"
              >
                <div className="h-12 w-12 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-on-secondary-container" />
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
      )}

      {/* ── Search ── */}
      <div className="relative w-full md:w-96 mb-6">
        <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-6 bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant outline-none transition-all"
          placeholder="Cari divisi..."
          type="text"
        />
      </div>

      {/* ── Division Grid ── */}
      {isFetchingDivisions ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
      ) : divisions.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-12 flex flex-col items-center justify-center shadow-ambient">
          <div className="h-16 w-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
            <LayoutGrid className="h-8 w-8 text-on-surface-variant" />
          </div>
          <p className="font-['Manrope'] font-bold text-lg text-on-surface">
            Tidak Ada Divisi
          </p>
          <p className="text-sm text-on-surface-variant mt-1">
            {search
              ? "Tidak ada divisi yang cocok."
              : "Buat divisi pertama untuk memulai."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {divisions.map((division, index) => {
            const statEntry = divisionStats?.divisions?.find(
              (s) => s.division_id === division.id,
            );
            return (
              <DivisionCard
                key={division.id}
                division={{
                  division_id: division.id,
                  nama_divisi: division.nama_divisi,
                  user_count: statEntry?.user_count ?? 0,
                  percentage: statEntry?.percentage ?? 0,
                }}
                index={index}
                onEdit={openEdit}
                onDelete={openDelete}
              />
            );
          })}
        </div>
      )}

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
    </>
  );
};
