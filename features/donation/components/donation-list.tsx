"use client";

import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  useDonations,
  useCreateDonation,
  useUpdateDonation,
  useDeleteDonation,
} from "../hooks";
import { Donation } from "../types";
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

  const donationsQuery = useDonations();
  const createDonation = useCreateDonation();
  const updateDonation = useUpdateDonation();
  const deleteDonation = useDeleteDonation();

  const donations = donationsQuery.data?.data ?? [];

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
        await updateDonation.mutateAsync({ id: editing.id, data: values });
      } else {
        await createDonation.mutateAsync(values);
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
      await deleteDonation.mutateAsync(deleting.id);
      setDeleteOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (donationsQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Manajemen Donasi
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola data donasi masuk dan status pembayaran
          </p>
        </div>
        <PermissionGate permission={PERMISSIONS.CREATE_DONATIONS}>
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" /> Catat Donasi
          </Button>
        </PermissionGate>
      </div>

      <DonationTable
        donations={donations}
        onEdit={openEdit}
        onDelete={openDelete}
      />

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
