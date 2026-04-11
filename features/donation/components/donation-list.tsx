/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { useDonationContext } from "../contexts/DonationContext";
import { Donation } from "../services/donationService";
import { DonationTable } from "./donation-table";
import { DonationFormDialog } from "./donation-form-dialog";
import { DonationDeleteDialog } from "./donation-delete-dialog";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

  // Derive today's metrics statically if no direct API representation (Fallback)
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

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (donation: Donation) => {
    setEditing(donation);
    setFormOpen(true);
  };

  const openDelete = (donation: Donation) => {
    setDeleting(donation);
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
        toast.success("Donation successfully updated");
      } else {
        await createDonation(formData);
        toast.success("Donation successfully created");
      }

      setFormOpen(false);
      setEditing(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Failed to save donation";
      toast.error(message);
      console.error("[handleSave] error:", err);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteDonation(deleting.id);
      toast.success("Donation deleted");
      setDeleteOpen(false);
    } catch (err: any) {
      toast.error(err.response?.error || "Failed to delete donation");
    }
  };

  const handleVerifyDonation = async (donation: Donation, catatan?: string) => {
    try {
      await verifyDonation({ id: donation.id, catatan });
      toast.success("Donation verified successfully");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Failed to verify donation";
      toast.error(message);
    }
  };

  const handleRejectDonation = async (donation: Donation, catatan: string) => {
    try {
      await rejectDonation({ id: donation.id, catatan });
      toast.success("Donation rejected successfully");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Failed to reject donation";
      toast.error(message);
    }
  };

  const handleCancelDonation = async (donation: Donation) => {
    try {
      await cancelDonation(donation.id);
      toast.success("Donation canceled successfully");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Failed to cancel donation";
      toast.error(message);
    }
  };

  const handleExportCSV = () => {
    if (donations.length === 0) return;

    const headers = [
      "Donatur Name",
      "Amount",
      "Date",
      "Method",
      "Status",
      "Description",
    ];
    const csvRows = [headers.join(",")];

    for (const row of donations) {
      const values = [
        `"${row.nama_donatur.replace(/"/g, '""')}"`,
        row.jumlah,
        `"${new Date(row.tanggal).toLocaleDateString("id-ID")}"`,
        row.metode,
        row.status,
        `"${row.deskripsi?.replace(/"/g, '""') || ""}"`,
      ];
      csvRows.push(values.join(","));
    }

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute(
      "download",
      `Donations_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (isLoadingDonations || isLoadingStats) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  // Currency Formatter
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Pagination helpers
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
    <div className="flex-1 relative -m-8 flex h-full flex-col overflow-hidden bg-slate-50 p-8 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Donation Management
        </h1>
        <PermissionGate permission={PERMISSIONS.CREATE_DONATIONS}>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-primary/20 transition-all hover:bg-indigo-600"
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Donation
          </button>
        </PermissionGate>
      </div>

      <div className="flex-1 overflow-y-auto pb-10 no-scrollbar">
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-300 bg-slate-100 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <span className="rounded-full bg-green-50 px-2 py-1 text-sm font-medium text-green-600 dark:bg-green-900/20 dark:text-green-400">
                {donationStats?.total_donations || 0} Total
              </span>
            </div>
            <h3 className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
              Total Verified Funds
            </h3>
            <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">
              {formatRupiah(donationStats?.verified_amount || 0)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-300 bg-slate-100 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900/30">
                <svg
                  className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 22h14" />
                  <path d="M5 2h14" />
                  <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
                  <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
                </svg>
              </div>
              <span className="rounded-full bg-yellow-50 px-2 py-1 text-sm font-medium text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400">
                Pending Auth
              </span>
            </div>
            <h3 className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
              Pending Verification
            </h3>
            <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">
              {formatRupiah(donationStats?.pending_amount || 0)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-300 bg-slate-100 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                <svg
                  className="h-6 w-6 text-blue-600 dark:text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                  <path d="M8 14h.01" />
                  <path d="M12 14h.01" />
                  <path d="M16 14h.01" />
                  <path d="M8 18h.01" />
                  <path d="M12 18h.01" />
                  <path d="M16 18h.01" />
                </svg>
              </div>
              <span className="rounded-full bg-blue-50 px-2 py-1 text-sm font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                {todaysDonations.length} New
              </span>
            </div>
            <h3 className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
              Today&apos;s Donations
            </h3>
            <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">
              {formatRupiah(todayAmount)}
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 shrink-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-text-secondary-light dark:text-text-secondary-dark"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  className="w-full rounded-xl border border-gray-200 bg-white px-10 pr-4 py-2 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900"
                  placeholder="Search donor or ID..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => setFilterOpen((current) => !current)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="21" x2="14" y1="4" y2="4" />
                  <line x1="10" x2="3" y1="4" y2="4" />
                  <line x1="21" x2="12" y1="12" y2="12" />
                  <line x1="8" x2="3" y1="12" y2="12" />
                  <line x1="21" x2="16" y1="20" y2="20" />
                  <line x1="12" x2="3" y1="20" y2="20" />
                  <line x1="14" x2="14" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="10" y2="14" />
                  <line x1="16" x2="16" y1="18" y2="22" />
                </svg>
                Filter
              </button>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
                {["all", "verified", "pending", "rejected", "canceled"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setActiveFilter(status)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                        activeFilter === status
                          ? "bg-primary text-white shadow-sm"
                          : "text-text-secondary-light hover:bg-gray-100 dark:text-text-secondary-dark dark:hover:bg-gray-700"
                      }`}
                    >
                      {status}
                    </button>
                  ),
                )}
              </div>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-600"
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
                Export CSV
              </button>
            </div>
          </div>

          {filterOpen && (
            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:grid-cols-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
                  Status
                </label>
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="all">Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
                  Metode
                </label>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="all">Semua Metode</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="e_wallet">E-Wallet</option>
                  <option value="qris">QRIS</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div className="flex flex-wrap gap-2 lg:col-span-4 lg:justify-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setFilterOpen(false)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col flex-1 min-h-125">
          <DonationTable
            donations={donations}
            onEdit={openEdit}
            onDelete={openDelete}
            onVerify={handleVerifyDonation}
            onReject={handleRejectDonation}
            onCancel={handleCancelDonation}
          />
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
                    className={`flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      currentPage === p
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
        </div>
      </div>

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
