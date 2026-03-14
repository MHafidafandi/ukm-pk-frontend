"use client";

import { Document } from "../services/documentationService";
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
import { useState } from "react";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";

type Props = {
  documents: Document[];
};

export const DocumentTable = ({ documents }: Props) => {
  const { deleteDocument } = useDocumentationContext();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteId) {
      deleteDocument(deleteId);
      setDeleteId(null);
    }
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case "laporan_kegiatan":
        return {
          icon: "description",
          badgeBg:
            "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
          iconBg: "bg-orange-100 text-orange-600",
          label: "Laporan",
        };
      case "surat_keluar":
      case "surat_masuk":
        return {
          icon: "mail",
          badgeBg:
            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
          iconBg: "bg-green-100 text-green-600",
          label: category.replace("_", " "),
        };
      case "proposal":
        return {
          icon: "folder_zip",
          badgeBg:
            "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
          iconBg: "bg-gray-100 text-gray-600",
          label: "Proposal",
        };
      default:
        // Assume 'lainnya' / SOP format
        return {
          icon: "gavel",
          badgeBg:
            "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
          iconBg: "bg-purple-100 text-purple-600",
          label: "SOP / Lainnya",
        };
    }
  };

  return (
    <>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700 bg-slate-50 dark:bg-slate-900">
              <th className="p-4 w-10 sticky left-0 bg-slate-50 dark:bg-slate-900 z-10">
                <input
                  className="rounded border-gray-300 text-primary focus:ring-primary bg-white dark:bg-gray-900"
                  type="checkbox"
                />
              </th>
              <th className="p-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">
                Document Title
              </th>
              <th className="p-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">
                Type
              </th>
              <th className="p-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">
                Creator
              </th>
              <th className="p-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest text-center">
                G-Drive
              </th>
              <th className="p-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest text-center">
                Status
              </th>
              <th className="p-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest items-end justify-end text-end pr-8">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700 dark:text-gray-300 divide-y divide-gray-100 dark:divide-gray-800/60">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg
                      className="w-12 h-12 text-gray-300 dark:text-gray-600"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                    <p>No documents found</p>
                  </div>
                </td>
              </tr>
            ) : (
              documents.map((doc) => {
                const styles = getCategoryStyles(doc.kategori);

                return (
                  <tr
                    key={doc.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors group"
                  >
                    <td className="p-4 sticky left-0 bg-white group-hover:bg-gray-50/80 dark:bg-card-dark dark:group-hover:bg-gray-800/40 z-10 transition-colors">
                      <input
                        className="rounded border-gray-300 text-primary focus:ring-primary bg-white dark:bg-gray-900"
                        type="checkbox"
                      />
                    </td>
                    <td className="p-4 max-w-[300px]">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl flex-shrink-0 ${styles.iconBg}`}
                        >
                          {/* Fallback to simple icon map since we don't have Material Symbols preloaded properly */}
                          {styles.icon === "mail" && (
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
                              <rect width="20" height="16" x="2" y="4" rx="2" />
                              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                          )}
                          {styles.icon === "folder_zip" && (
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
                              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                              <path d="M10 10v6" />
                              <path d="M14 10v6" />
                              <path d="M14 10h-4" />
                              <path d="M14 13h-4" />
                              <path d="M14 16h-4" />
                            </svg>
                          )}
                          {styles.icon === "description" && (
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
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <path d="M16 13H8" />
                              <path d="M16 17H8" />
                              <path d="M10 9H8" />
                            </svg>
                          )}
                          {styles.icon === "gavel" && (
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
                              <path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10" />
                              <path d="m16 16 6-6" />
                              <path d="m8 8 6-6" />
                              <path d="m9 7 8 8" />
                              <path d="m21 11-8-8" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div
                            className="font-bold text-gray-900 dark:text-white truncate"
                            title={doc.judul}
                          >
                            {doc.judul}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            {doc.deskripsi || "No description"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${styles.badgeBg} capitalize tracking-wide`}
                      >
                        {styles.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                          {doc.uploaded_by
                            ? doc.uploaded_by.substring(0, 2).toUpperCase()
                            : "AD"}
                        </div>
                        <span className="text-sm font-semibold truncate max-w-[120px]">
                          {doc.uploaded_by || "Admin User"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {doc.file_url ? (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 mx-auto flex items-center justify-center bg-white dark:bg-gray-800 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:border-green-200 dark:hover:border-green-900 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all shadow-sm group-hover:ring-2 ring-transparent group-hover:ring-gray-100 dark:group-hover:ring-gray-800"
                          title="Open in Drive"
                        >
                          <svg
                            className="w-4 h-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21.17 10.3l-5.32-9A2 2 0 0 0 14.12 0H9.88a2 2 0 0 0-1.73 1.3L2.83 10.3a2 2 0 0 0 0 1.96l5.32 9A2 2 0 0 0 9.88 22h4.24a2 2 0 0 0 1.73-1.3l5.32-9a2 2 0 0 0 0-2z" />
                            <path d="M12 7v10" />
                            <path d="M7 12h10" />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-green-200 dark:border-emerald-800">
                        Aktif
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-4">
                        <button
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors"
                          title="Edit"
                        >
                          <svg
                            className="w-4 h-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                          </svg>
                        </button>

                        <PermissionGate
                          permission={PERMISSIONS.DELETE_DOCUMENTS}
                        >
                          <button
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Delete"
                            onClick={() => setDeleteId(doc.id)}
                          >
                            <svg
                              className="w-4 h-4"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
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

      {/* Pagination component logic could go here similar to the HTML structure */}

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              Hapus Dokumen?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Dokumen akan dihapus dari
              sistem Sipeduli.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-sm shadow-red-500/20"
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
