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

type Props = { documents: Documentation[] };

const getCategoryLabel = (type: string) => {
  const map: Record<string, string> = {
    laporan_kegiatan: "Laporan Kegiatan",
    surat_keluar: "Surat Keluar",
    surat_masuk: "Surat Masuk",
    proposal: "Proposal",
    sop: "SOP",
    template: "Template",
    panduan: "Panduan",
    laporan: "Laporan",
  };
  return map[type] ?? "Lainnya";
};

const formatSize = (size?: number) => {
  if (!size) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
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

  const toggleSelectAll = (checked: boolean) =>
    setSelectedIds(checked ? documents.map((d) => d.id) : []);
  const toggleSelectOne = (id: string, checked: boolean) =>
    setSelectedIds((cur) =>
      checked ? Array.from(new Set([...cur, id])) : cur.filter((i) => i !== id),
    );
  const handleDelete = () => {
    if (!deleteId) return;
    void deleteDocument(deleteId);
    setDeleteId(null);
  };

  return (
    <>
      {/* Bulk actions */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-outline-variant/10">
        <button
          onClick={() => void bulkArchiveDocuments(selectedIds)}
          disabled={!selectedIds.length}
          className=" inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Archive className="h-4 w-4" />
          Arsipkan Terpilih
        </button>
        <button
          onClick={() => void bulkDeleteDocuments(selectedIds)}
          disabled={!selectedIds.length}
          className=" inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-destructive bg-destructive/5 hover:bg-destructive/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 className="h-4 w-4" />
          Hapus Terpilih
        </button>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="min-w-[900px] w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-container-high">
              <th className="w-10 px-4 py-4">
                <input
                  type="checkbox"
                  className="rounded border-outline-variant text-primary focus:ring-primary"
                  checked={
                    documents.length > 0 &&
                    selectedIds.length === documents.length
                  }
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                />
              </th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant ">
                Judul
              </th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant ">
                Tipe
              </th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant ">
                Aktivitas
              </th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant ">
                Pembuat
              </th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant  text-center">
                Drive
              </th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant  text-center">
                File
              </th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant  text-center">
                Status
              </th>
              <th className="px-4 py-4 pr-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant  text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {documents.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-12 text-center  text-sm text-on-surface-variant"
                >
                  Tidak ada dokumen
                </td>
              </tr>
            ) : (
              documents.map((doc) => {
                const active = doc.status === "aktif";
                return (
                  <tr
                    key={doc.id}
                    className="group hover:bg-surface transition-colors"
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-outline-variant text-primary focus:ring-primary"
                        checked={selectedSet.has(doc.id)}
                        onChange={(e) =>
                          toggleSelectOne(doc.id, e.target.checked)
                        }
                      />
                    </td>
                    <td className="px-4 py-4 max-w-[200px]">
                      <p
                        className=" font-bold text-sm text-on-surface truncate"
                        title={doc.judul}
                      >
                        {doc.judul}
                      </p>
                      <p className=" text-xs text-on-surface-variant truncate">
                        {doc.deskripsi || "Tidak ada deskripsi"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span className=" inline-flex rounded-full bg-secondary-container text-on-secondary-container px-3 py-1 text-xs font-bold">
                        {getCategoryLabel(doc.tipe_dokumen)}
                      </span>
                    </td>
                    <td className="px-4 py-4 max-w-[160px]">
                      <p className=" text-sm text-on-surface-variant truncate">
                        {doc.activity_id || "Umum"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {doc.dibuat_oleh
                            ? doc.dibuat_oleh.substring(0, 2).toUpperCase()
                            : "AD"}
                        </div>
                        <span className=" text-sm text-on-surface max-w-[100px] truncate font-semibold">
                          {doc.dibuat_oleh || "Admin"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {doc.link_gdrive ? (
                        <a
                          href={doc.link_gdrive}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-on-surface-variant hover:bg-primary-fixed hover:text-on-primary-fixed-variant transition-colors mx-auto"
                          title="Buka di Drive"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-on-surface-variant/40 text-xs">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className=" text-xs text-on-surface truncate max-w-[80px]">
                          {doc.nama_file || "—"}
                        </span>
                        <span className=" text-[11px] text-on-surface-variant">
                          {formatSize(doc.ukuran_file)} · {doc.tipe_file || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={` inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${active ? "bg-primary-fixed text-on-primary-fixed-variant" : "bg-tertiary-fixed text-on-tertiary-fixed-variant"}`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 pr-6">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {active ? (
                          <PermissionGate
                            permission={PERMISSIONS.ARCHIVE_DOCUMENTATIONS}
                          >
                            <button
                              onClick={() => archiveDocument(doc.id)}
                              title="Arsipkan"
                              className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                            >
                              <Archive className="h-4 w-4" />
                            </button>
                          </PermissionGate>
                        ) : (
                          <PermissionGate
                            permission={PERMISSIONS.EDIT_DOCUMENTATIONS}
                          >
                            <button
                              onClick={() => activateDocument(doc.id)}
                              title="Aktifkan"
                              className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          </PermissionGate>
                        )}
                        <PermissionGate
                          permission={PERMISSIONS.DELETE_DOCUMENTS}
                        >
                          <button
                            onClick={() => setDeleteId(doc.id)}
                            title="Hapus"
                            className="rounded-lg p-1.5 text-on-surface-variant hover:bg-destructive/5 hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
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
        <AlertDialogContent className="bg-surface-container-lowest p-0 rounded-2xl overflow-hidden">
          <div className="px-8 pt-8 pb-6 bg-surface-container-low">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-['Manrope'] text-xl font-bold text-destructive">
                Hapus Dokumentasi?
              </AlertDialogTitle>
              <AlertDialogDescription className=" text-sm text-on-surface-variant">
                Tindakan ini tidak dapat dibatalkan. Dokumentasi akan dihapus
                dari sistem.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <div className="px-8 py-5 flex justify-end gap-3">
            <AlertDialogCancel className=" px-5 py-2.5 text-sm font-medium text-primary border border-outline/20 rounded-xl hover:bg-surface-container transition-colors bg-transparent">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className=" font-bold px-6 py-2.5 text-sm text-white bg-destructive rounded-xl hover:opacity-90 active:scale-95 transition-all"
            >
              Hapus Permanen
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
