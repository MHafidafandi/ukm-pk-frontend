"use client";

import { useMemo, useState } from "react";
import { Archive, CheckCircle2, ExternalLink, Trash2 } from "lucide-react";
import { useDocumentationContext } from "../contexts/DocumentationContext";
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
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import { Documentation } from "../services/documentationService";

type Props = {
  documents: Documentation[];
};

export const DocumentTable = ({ documents }: Props) => {
  const {
    deleteDocument,
    archiveDocument,
    activateDocument,
    selectedIds,
    setSelectedIds,
    bulkArchiveDocuments,
    bulkDeleteDocuments,
  } = useDocumentationContext();

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const formatSize = (size?: number) => {
    if (!size) return "-";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getCategoryLabel = (type: string) => {
    switch (type) {
      case "laporan_kegiatan":
        return "Laporan Kegiatan";
      case "surat_keluar":
        return "Surat Keluar";
      case "surat_masuk":
        return "Surat Masuk";
      case "proposal":
        return "Proposal";
      case "sop":
        return "SOP";
      case "template":
        return "Template";
      case "panduan":
        return "Panduan";
      case "laporan":
        return "Laporan";
      default:
        return "Lainnya";
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? documents.map((document) => document.id) : []);
  };

  const toggleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((current) =>
      checked
        ? Array.from(new Set([...current, id]))
        : current.filter((item) => item !== id),
    );
  };

  const handleDelete = () => {
    if (!deleteId) return;
    void deleteDocument(deleteId);
    setDeleteId(null);
  };

  const handleBulkArchive = () => {
    if (!selectedIds.length) return;
    void bulkArchiveDocuments(selectedIds);
  };

  const handleBulkDelete = () => {
    if (!selectedIds.length) return;
    void bulkDeleteDocuments(selectedIds);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <button
          type="button"
          onClick={handleBulkArchive}
          disabled={!selectedIds.length}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Archive className="size-4" />
          Archive Selected
        </button>
        <button
          type="button"
          onClick={handleBulkDelete}
          disabled={!selectedIds.length}
          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <Trash2 className="size-4" />
          Delete Selected
        </button>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="min-w-200 w-full border-collapse text-left">
          <thead>
<<<<<<< HEAD
            <tr className="border-b border-gray-100  dark:border-gray-700 bg-slate-50 dark:bg-slate-900">
              <th className="p-4 w-10 sticky left-0 bg-slate-50 dark:bg-slate-900 z-10">
=======
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
              <th className="sticky left-0 z-10 w-10 bg-slate-50 p-4 dark:bg-slate-950">
>>>>>>> d1006d5a3f81168775557fa0498b538d3dcbbd83
                <input
                  className="rounded border-gray-300 text-primary focus:ring-primary bg-white dark:bg-gray-900"
                  type="checkbox"
                  checked={
                    documents.length > 0 &&
                    selectedIds.length === documents.length
                  }
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                />
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">
                Title
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">
                Type
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">
                Activity
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">
                Creator
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-center text-gray-600 dark:text-gray-300">
                Drive
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-center text-gray-600 dark:text-gray-300">
                File
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-center text-gray-600 dark:text-gray-300">
                Status
              </th>
              <th className="p-4 pr-8 text-end text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700 dark:divide-gray-800/60 dark:text-gray-300">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-500">
                  No documents found
                </td>
              </tr>
            ) : (
              documents.map((document) => {
                const active = document.status === "aktif";

                return (
                  <tr
                    key={document.id}
                    className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="sticky left-0 z-10 bg-white p-4 group-hover:bg-slate-50/80 dark:bg-slate-900 dark:group-hover:bg-slate-800/40">
                      <input
                        className="rounded border-gray-300 text-primary focus:ring-primary bg-white dark:bg-gray-900"
                        type="checkbox"
                        checked={selectedSet.has(document.id)}
                        onChange={(e) =>
                          toggleSelectOne(document.id, e.target.checked)
                        }
                      />
                    </td>
                    <td className="p-4 max-w-75">
                      <div className="min-w-0">
                        <div
                          className="truncate font-bold text-gray-900 dark:text-white"
                          title={document.judul}
                        >
                          {document.judul}
                        </div>
                        <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {document.deskripsi || "No description"}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {getCategoryLabel(document.tipe_dokumen)}
                      </span>
                    </td>
                    <td className="p-4 max-w-45">
                      <div className="truncate text-sm text-slate-600 dark:text-slate-300">
                        {document.activity_id || "General Documentation"}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                          {document.dibuat_oleh
                            ? document.dibuat_oleh.substring(0, 2).toUpperCase()
                            : "AD"}
                        </div>
                        <span className="max-w-30 truncate text-sm font-semibold">
                          {document.dibuat_oleh || "Admin User"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {document.link_gdrive ? (
                        <a
                          href={document.link_gdrive}
                          target="_blank"
                          rel="noreferrer"
                          className="mx-auto inline-flex size-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition-all hover:border-green-200 hover:bg-green-50 hover:text-green-600 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-900 dark:hover:bg-green-900/20 dark:hover:text-green-400"
                          title="Open in Drive"
                        >
                          <ExternalLink className="size-4" />
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center text-xs text-gray-600 dark:text-gray-300">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="truncate">
                          {document.nama_file || "-"}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {formatSize(document.ukuran_file)} ·{" "}
                          {document.tipe_file || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${
                          active
                            ? "border-green-200 bg-green-100 text-green-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                        }`}
                      >
                        {document.status}
                      </span>
                    </td>
                    <td className="p-4 pr-8">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {active ? (
                          <PermissionGate
                            permission={PERMISSIONS.ARCHIVE_DOCUMENTATIONS}
                          >
                            <button
                              type="button"
                              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700"
                              title="Archive"
                              onClick={() => archiveDocument(document.id)}
                            >
                              <Archive className="size-4" />
                            </button>
                          </PermissionGate>
                        ) : (
                          <PermissionGate
                            permission={PERMISSIONS.EDIT_DOCUMENTATIONS}
                          >
                            <button
                              type="button"
                              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700"
                              title="Activate"
                              onClick={() => activateDocument(document.id)}
                            >
                              <CheckCircle2 className="size-4" />
                            </button>
                          </PermissionGate>
                        )}

                        <PermissionGate
                          permission={PERMISSIONS.DELETE_DOCUMENTS}
                        >
                          <button
                            type="button"
                            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                            title="Delete"
                            onClick={() => setDeleteId(document.id)}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </PermissionGate>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              Hapus Dokumentasi?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Dokumentasi akan dihapus dari
              sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-red-500 text-white shadow-sm shadow-red-500/20 hover:bg-red-600"
              onClick={handleDelete}
            >
              Hapus Permanen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
