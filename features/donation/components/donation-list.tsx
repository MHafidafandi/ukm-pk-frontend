"use client";

import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    createDonation,
    updateDonation,
    deleteDonation,
    isLoadingDonations,
  } = useDonationContext();

  const donations = donationsResponse?.data ?? [];

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
      // handled by hook toast
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

  if (isLoadingDonations) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Donation Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage incoming donations and payment statuses.
          </p>
        </div>
        <PermissionGate permission={PERMISSIONS.CREATE_DONATIONS}>
          <Button
            onClick={openAdd}
            className="bg-primary hover:bg-primary/90 text-white shadow-sm inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-semibold transition-all"
          >
            <Plus className="h-5 w-5" /> Add Donation
          </Button>
        </PermissionGate>
      </div>

      {/* Filters & Search */}
      <div className="mb-8 flex flex-col gap-4 rounded-xl bg-card border border-border p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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
          </div>
          <input
            className="block w-full rounded-lg border-0 bg-muted/50 py-2.5 pl-10 pr-4 text-foreground ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all"
            placeholder="Search donations by donor name..."
            type="text"
          />
        </div>
        <div className="flex w-full flex-wrap gap-2 lg:w-auto">
          <button className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm">
            All Status
          </button>
          <button className="inline-flex items-center justify-center rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80">
            Terverifikasi
          </button>
          <button className="inline-flex items-center justify-center rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80">
            Menunggu
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden p-1">
        <DonationTable
          donations={donations}
          onEdit={openEdit}
          onDelete={openDelete}
        />
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
