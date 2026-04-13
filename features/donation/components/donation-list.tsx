/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useDonationContext } from "../contexts/DonationContext";
import { Donation } from "../services/donationService";
import { DonationTable } from "./donation-table";
import { DonationFormDialog } from "./donation-form-dialog";
import { DonationDeleteDialog } from "./donation-delete-dialog";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import { toast } from "sonner";
import {
  BadgeCheck,
  Clock,
  CalendarDays,
  Download,
  Plus,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Stat Card ────────────────────────────────────────────────────────────────
type StatCardProps = {
  label: string;
  value: string;
  Icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  sub?: string;
};

const StatCard = ({
  label,
  value,
  Icon,
  iconBg,
  iconColor,
  sub,
}: StatCardProps) => (
  <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
    <div className="flex items-center gap-4 mb-4">
      <div
        className={`w-11 h-11 rounded-full ${iconBg} flex items-center justify-center shrink-0`}
      >
        <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={2} />
      </div>
      <span className="text-on-surface-variant font-medium text-sm">
        {label}
      </span>
    </div>
    <p className="font-['Manrope'] font-extrabold text-2xl text-on-surface">
      {value}
    </p>
    {sub && <p className="text-xs text-on-surface-variant mt-1.5">{sub}</p>}
  </div>
);

// ─── Filter Pill ─────────────────────────────────────────────────────────────
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
    className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${active
      ? "bg-primary text-on-primary shadow-sm"
      : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high"
      }`}
  >
    {label === "all" ? "Semua" : label}
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const DonationList = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Donation | null>(null);
  const [deleting, setDeleting] = useState<Donation | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const {
    donations,
    stats,
    page,
    setPage,
    pagination,
    createDonation,
    updateDonation,
    deleteDonation,
    isLoadingDonations,
    isLoadingStats,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    methodFilter,
    setMethodFilter,
    startDateFilter,
    setStartDateFilter,
    endDateFilter,
    setEndDateFilter,
    verifyDonation,
    rejectDonation,
    cancelDonation,
  } = useDonationContext();

  const donationStats = stats?.data;

  const todaysDonations = donations.filter((d) => {
    const today = new Date();
    const dDate = new Date(d.tanggal);
    return (
      dDate.getDate() === today.getDate() &&
      dDate.getMonth() === today.getMonth() &&
      dDate.getFullYear() === today.getFullYear()
    );
  });
  const todayAmount = todaysDonations.reduce((acc, obj) => acc + obj.jumlah, 0);

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

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

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (d: Donation) => {
    setEditing(d);
    setFormOpen(true);
  };
  const openDelete = (d: Donation) => {
    setDeleting(d);
    setDeleteOpen(true);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setActiveFilter("all");
    setMethodFilter("all");
    setStartDateFilter("");
    setEndDateFilter("");
  };

  const handleSave = async (formData: FormData) => {
    try {
      if (editing) {
        await updateDonation({ id: editing.id, data: formData });
        toast.success("Donasi berhasil diperbarui");
      } else {
        await createDonation(formData);
        toast.success("Donasi berhasil dicatat");
      }
      setFormOpen(false);
      setEditing(null);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Gagal menyimpan donasi",
      );
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteDonation(deleting.id);
      toast.success("Donasi berhasil dihapus");
      setDeleteOpen(false);
    } catch (err: any) {
      toast.error(err.response?.error || "Gagal menghapus donasi");
    }
  };

  const handleVerify = async (donation: Donation, catatan?: string) => {
    try {
      await verifyDonation({ id: donation.id, catatan });
      toast.success("Donasi berhasil diverifikasi");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? err?.message ?? "Gagal verifikasi",
      );
    }
  };

  const handleReject = async (donation: Donation, catatan: string) => {
    try {
      await rejectDonation({ id: donation.id, catatan });
      toast.success("Donasi berhasil ditolak");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? err?.message ?? "Gagal menolak donasi",
      );
    }
  };

  const handleCancel = async (donation: Donation) => {
    try {
      await cancelDonation(donation.id);
      toast.success("Donasi berhasil dibatalkan");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ??
        err?.message ??
        "Gagal membatalkan donasi",
      );
    }
  };

  const handleExportCSV = () => {
    if (donations.length === 0) return;
    const headers = [
      "Nama Donatur",
      "Jumlah",
      "Tanggal",
      "Metode",
      "Status",
      "Deskripsi",
    ];
    const rows = donations.map((d) => [
      `"${d.nama_donatur.replace(/"/g, '""')}"`,
      d.jumlah,
      `"${new Date(d.tanggal).toLocaleDateString("id-ID")}"`,
      d.metode,
      d.status,
      `"${d.deskripsi?.replace(/"/g, '""') || ""}"`,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `Donations_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (isLoadingDonations || isLoadingStats) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-on-surface-variant font-medium">
            Memuat data donasi...
          </p>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col gap-8 bg-surface min-h-full">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Manrope'] font-bold text-3xl text-on-surface">
            Donation Tracking
          </h1>
          <p className="text-on-surface-variant text-sm mt-1 max-w-xl">
            Kelola dan verifikasi seluruh catatan donasi organisasi dalam satu
            tempat.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface-variant text-sm font-medium hover:bg-surface-container-high transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <PermissionGate permission={PERMISSIONS.CREATE_DONATIONS}>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white text-sm font-bold shadow-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Catat Donasi
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          label="Total Dana Terverifikasi"
          value={formatRupiah(donationStats?.verified_amount || 0)}
          Icon={BadgeCheck}
          iconBg="bg-primary-fixed"
          iconColor="text-on-primary-fixed-variant"
          sub={`${donationStats?.total_donations || 0} total transaksi`}
        />
        <StatCard
          label="Menunggu Verifikasi"
          value={formatRupiah(donationStats?.pending_amount || 0)}
          Icon={Clock}
          iconBg="bg-tertiary-fixed"
          iconColor="text-on-tertiary-fixed-variant"
          sub="Perlu ditinjau secara manual"
        />
        <StatCard
          label="Donasi Hari Ini"
          value={formatRupiah(todayAmount)}
          Icon={CalendarDays}
          iconBg="bg-secondary-container"
          iconColor="text-on-secondary-container"
          sub={`${todaysDonations.length} transaksi baru`}
        />
      </div>

      {/* ── Table Workspace ── */}
      <div className="bg-surface-container-low rounded-2xl overflow-hidden flex flex-col flex-1 min-h-[400px]">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-5">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input
              type="text"
              placeholder="Cari donatur atau ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-lowest rounded-full py-2.5 pl-10 pr-4 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              {["all", "verified", "pending", "rejected", "canceled"].map(
                (s) => (
                  <FilterPill
                    key={s}
                    label={s}
                    active={activeFilter === s}
                    onClick={() => setActiveFilter(s)}
                  />
                ),
              )}
            </div>
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filterOpen
                ? "bg-primary text-on-primary"
                : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high"
                }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {filterOpen && (
          <div className="mx-6 mb-4 p-5 bg-surface-container-lowest rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Metode
              </label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant rounded-t-lg px-3 py-2 text-sm text-on-surface outline-none focus:border-primary transition-colors"
              >
                <option value="all">Semua Metode</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Tunai (Cash)</option>
                <option value="e_wallet">E-Wallet</option>
                <option value="qris">QRIS</option>
                <option value="other">Lainnya</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant rounded-t-lg px-3 py-2 text-sm text-on-surface outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant rounded-t-lg px-3 py-2 text-sm text-on-surface outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={resetFilters}
                className="flex-1 py-2 px-4 rounded-xl border border-outline-variant text-on-surface-variant text-sm font-medium hover:bg-surface-container-high transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setFilterOpen(false)}
                className="flex-1 py-2 px-4 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 transition-opacity"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          <DonationTable
            donations={donations}
            onEdit={openEdit}
            onDelete={openDelete}
            onVerify={handleVerify}
            onReject={handleReject}
            onCancel={handleCancel}
          />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant/10">
            <p className="text-xs text-on-surface-variant">
              Halaman {currentPage} dari {totalPages}
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
                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${currentPage === p
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
      </div>

      {/* Dialogs */}
      <DonationFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        isEdit={!!editing}
        baseData={editing}
        onSubmit={handleSave}
      />
      <DonationDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        donation={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};
