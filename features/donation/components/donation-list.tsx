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

export const DonationList = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [editing, setEditing] = useState<Donation | null>(null);
  const [deleting, setDeleting] = useState<Donation | null>(null);

  const {
    donations: donationsResponse,
    stats,
    createDonation,
    updateDonation,
    deleteDonation,
    isLoadingDonations,
    isLoadingStats,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
  } = useDonationContext();

  const donations = donationsResponse?.data ?? [];
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

  // Filter functionality
  const filteredDonations = donations.filter((donation) => {
    const matchesSearch =
      donation.nama_donatur.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === "all") return matchesSearch;
    return matchesSearch && donation.status === activeFilter;
  });

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

  const handleSave = async (values: any) => {
    try {
      if (editing) {
        await updateDonation({ id: editing.id, data: values });
      } else {
        await createDonation(values);
      }
      setFormOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteDonation(deleting.id);
      setDeleteOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleExportCSV = () => {
    if (filteredDonations.length === 0) return;

    const headers = [
      "Donatur Name",
      "Amount",
      "Date",
      "Method",
      "Status",
      "Description",
    ];
    const csvRows = [headers.join(",")];

    for (const row of filteredDonations) {
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

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark font-display relative -m-8 p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Donation Management
        </h1>
        <PermissionGate permission={PERMISSIONS.CREATE_DONATIONS}>
          <button
            onClick={openAdd}
            className="px-4 py-2.5 bg-primary hover:bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm shadow-primary/20 transition-all"
          >
            <svg
              className="w-5 h-5"
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

      <div className="flex-1 overflow-y-auto w-full no-scrollbar pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
          <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
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
              <span className="text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                {donationStats?.total_donations || 0} Total
              </span>
            </div>
            <h3 className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">
              Total Verified Funds
            </h3>
            <p className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">
              {formatRupiah(donationStats?.verified_amount || 0)}
            </p>
          </div>
          <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
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
              <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                Pending Auth
              </span>
            </div>
            <h3 className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">
              Pending Verification
            </h3>
            <p className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">
              {formatRupiah(donationStats?.pending_amount || 0)}
            </p>
          </div>
          <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
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
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                {todaysDonations.length} New
              </span>
            </div>
            <h3 className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">
              Today&apos;s Donations
            </h3>
            <p className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">
              {formatRupiah(todayAmount)}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 shrink-0">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <svg
                className="absolute left-3 top-2.5 text-text-secondary-light dark:text-text-secondary-dark w-5 h-5"
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
                className="w-full pl-10 pr-4 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:placeholder-gray-500"
                placeholder="Search donor or ID..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <svg
                className="w-5 h-5"
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
            <div className="flex items-center gap-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-1">
              {["all", "verified", "pending", "rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`capitalize px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    activeFilter === status
                      ? "bg-primary text-white shadow-sm"
                      : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors shadow-sm whitespace-nowrap"
            >
              <svg
                className="w-5 h-5"
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

        <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden flex flex-col flex-1 min-h-[500px]">
          <DonationTable
            donations={filteredDonations}
            onEdit={openEdit}
            onDelete={openDelete}
          />
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
