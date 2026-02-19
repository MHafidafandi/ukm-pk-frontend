"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  useProgressReports,
  useCreateProgressReport,
  useUpdateProgressReport,
  useDeleteProgressReport,
  ProgressReport,
} from "../api/progress-reports";
import { ProgressReportFormDialog } from "./progress-report-form-dialog";
import {
  CreateProgressReportInput,
  CreateProgressReportSchema,
} from "@/lib/validations/activity-schema";

type Props = {
  activityId: string;
};

const emptyForm = (activityId: string): CreateProgressReportInput => ({
  activity_id: activityId,
  judul: "",
  deskripsi: "",
  tanggal: new Date(),
});

export const ProgressReportList = ({ activityId }: Props) => {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<ProgressReport | null>(null);
  const [deleting, setDeleting] = useState<ProgressReport | null>(null);
  const [form, setForm] = useState<CreateProgressReportInput>(
    emptyForm(activityId),
  );

  const { data: response } = useProgressReports({ activity_id: activityId });
  const reports = response?.data ?? [];

  const createReport = useCreateProgressReport();
  const updateReport = useUpdateProgressReport();
  const deleteReport = useDeleteProgressReport();

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm(activityId));
    setFormOpen(true);
  };

  const openEdit = (item: ProgressReport) => {
    setEditing(item);
    setForm({
      activity_id: item.activity_id,
      judul: item.judul,
      deskripsi: item.deskripsi,
      tanggal: new Date(item.tanggal),
    });
    setFormOpen(true);
  };

  const openDelete = (item: ProgressReport) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const handleSave = async () => {
    try {
      const parsed = CreateProgressReportSchema.parse(form);

      if (editing) {
        await updateReport.mutateAsync({
          id: editing.id,
          data: parsed,
        });
        toast.success("Laporan progres diperbarui");
      } else {
        await createReport.mutateAsync({
          data: parsed,
        });
        toast.success("Laporan progres dibuat");
      }
      setFormOpen(false);
    } catch (err: any) {
      if (err.name === "ZodError") {
        toast.error(err.errors[0].message);
        return;
      }
      toast.error("Gagal menyimpan laporan");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteReport.mutateAsync({ id: deleting.id });
      toast.success("Laporan dihapus");
      setDeleteOpen(false);
    } catch {
      toast.error("Gagal menghapus laporan");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Laporan Progres</h3>
        <Button size="sm" onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Laporan
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground border rounded-lg border-dashed">
            Belum ada laporan progres.
          </div>
        ) : (
          reports.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-base line-clamp-2">
                      {item.judul}
                    </CardTitle>
                    <CardDescription>
                      {format(new Date(item.tanggal), "dd MMM yyyy", {
                        locale: idLocale,
                      })}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {item.deskripsi}
                </p>
              </CardContent>
              <CardFooter className="justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(item)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => openDelete(item)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <ProgressReportFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        isEdit={!!editing}
        form={form}
        setForm={setForm}
        onSubmit={handleSave}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Laporan?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
