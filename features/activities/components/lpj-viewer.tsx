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

import { useActivityContext } from "../contexts/ActivityContext";
import { LPJ } from "../services/activityService";
import { useState } from "react";

type Props = {
  activityId: string;
};

export const LpjViewer = ({ activityId }: Props) => {
  const {
    lpjList,
    createLpj,
    deleteLpj,
    isFetchingLpj: isLoading,
  } = useActivityContext();
  const lpj = lpjList.length > 0 ? lpjList[0] : null; // Assuming one LPJ per activity for now
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Since LPJ creation seems to be just tagging the activity as having LPJ and maybe a date?
  // The API spec: ActivityID, Tanggal.
  const handleCreate = async () => {
    try {
      await createLpj({
        activity_id: activityId,
        tanggal: new Date(),
      });
      toast.success("LPJ berhasil dibuat/ditandai");
    } catch {
      toast.error("Gagal membuat LPJ");
    }
  };

  const handleDelete = async () => {
    if (!lpj) return;
    try {
      await deleteLpj(lpj.id);
      toast.success("LPJ dihapus");
      setDeleteOpen(false);
    } catch {
      toast.error("Gagal menghapus LPJ");
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-primary">
          upload_file
        </span>
        Final Report (LPJ)
      </h2>
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 h-full flex flex-col">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Upon activity completion, please upload your Accountability Report
          (Laporan Pertanggungjawaban) here.
        </p>

        {!lpj ? (
          <>
            <div
              onClick={handleCreate}
              className="flex-1 min-h-[200px] border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/50 transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center group"
            >
              <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-3xl">
                  cloud_upload
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary mb-1">
                Click to Create/Upload LPJ Marker
              </h4>
              <p className="text-xs text-slate-400">
                Creates an LPJ timestamp directly for now.
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Uploaded Files</span>
                <span>0/1</span>
              </div>
              <div className="text-center py-2 text-sm text-slate-400 italic">
                No files uploaded yet.
              </div>
            </div>

            <button className="w-full mt-4 py-2.5 bg-slate-900 dark:bg-slate-700 text-white text-sm font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors opacity-50 cursor-not-allowed">
              Submit LPJ
            </button>
          </>
        ) : (
          <>
            <div className="flex-1 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-xl p-6 flex flex-col items-center text-center">
              <div className="size-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl">
                  check_circle
                </span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                LPJ Uploaded
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                LPJ marked as completed on{" "}
                {new Date(lpj.created_at).toLocaleDateString()}.
              </p>

              <button
                onClick={() => setDeleteOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 transition-colors text-sm font-bold rounded-lg"
              >
                <span className="material-symbols-outlined text-lg">
                  delete
                </span>
                Remove LPJ
              </button>
            </div>
          </>
        )}
      </div>

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
    </>
  );
};
