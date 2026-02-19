"use client";

import { Button } from "@/components/ui/button";
import { Plus, Trash2, FileCheck } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
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

import { useLpjByActivity, useCreateLpj, useDeleteLpj, LPJ } from "../api/lpj";
import { useState } from "react";

type Props = {
  activityId: string;
};

export const LpjViewer = ({ activityId }: Props) => {
  const { data: response, isLoading } = useLpjByActivity(activityId);
  const lpjList = response?.lpj ?? [];
  const lpj = lpjList.length > 0 ? lpjList[0] : null; // Assuming one LPJ per activity for now

  const createLpj = useCreateLpj();
  const deleteLpj = useDeleteLpj();
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Since LPJ creation seems to be just tagging the activity as having LPJ and maybe a date?
  // The API spec: ActivityID, Tanggal.
  const handleCreate = async () => {
    try {
      await createLpj.mutateAsync({
        data: {
          activity_id: activityId,
          tanggal: new Date(),
        },
      });
      toast.success("LPJ berhasil dibuat/ditandai");
    } catch {
      toast.error("Gagal membuat LPJ");
    }
  };

  const handleDelete = async () => {
    if (!lpj) return;
    try {
      await deleteLpj.mutateAsync({ id: lpj.id });
      toast.success("LPJ dihapus");
      setDeleteOpen(false);
    } catch {
      toast.error("Gagal menghapus LPJ");
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Laporan Pertanggungjawaban (LPJ)
        </h3>
        {!lpj && (
          <Button size="sm" onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Buat LPJ
          </Button>
        )}
      </div>

      {!lpj ? (
        <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
          Belum ada LPJ untuk kegiatan ini.
        </div>
      ) : (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-green-600" />
              <CardTitle className="text-base font-semibold text-green-700 dark:text-green-400">
                LPJ Tersedia
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-green-600/80 dark:text-green-400/80">
              LPJ telah dibuat pada{" "}
              {new Date(lpj.created_at).toLocaleDateString()}.
            </CardDescription>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus LPJ?</AlertDialogTitle>
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
