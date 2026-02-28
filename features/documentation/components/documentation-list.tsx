"use client";

import { useState } from "react";
import { useDocumentationContext } from "../contexts/DocumentationContext";
import { DocumentTable } from "./document-table";
import { DocumentUploadDialog } from "./document-upload-dialog";
import { Spinner } from "@/components/ui/spinner";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";

export const DocumentationList = () => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const {
    documents,
    isFetchingDocuments: isLoading,
    search,
    setSearch,
  } = useDocumentationContext();

  // Statistics Calculation
  const totalDocuments = documents.length;
  // Based on current DocumentCategory: "laporan_kegiatan" | "surat_keluar" | "surat_masuk" | "proposal" | "lainnya"
  const totalSOPs = documents.filter(
    (doc) =>
      doc.judul.toLowerCase().includes("sop") ||
      doc.judul.toLowerCase().includes("panduan"),
  ).length;
  const totalReports = documents.filter(
    (doc) => doc.kategori === "laporan_kegiatan",
  ).length;

  if (isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark font-display relative -m-8 p-8">
      {/* Header Area is handled by standard page layouts, but we add page title styling here if needed */}
      <div className="flex flex-col mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Documentation Management
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
          Manage and organize organizational documents with Google Drive
          integration.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto w-full no-scrollbar pb-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
          <div className="bg-card-light dark:bg-card-dark rounded-2xl p-6 shadow-sm flex items-center gap-5 border-l-4 border-primary dark:border-primary-light">
            <div className="p-4 bg-primary/10 rounded-full shrink-0">
              <svg
                className="w-8 h-8 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                Total Documents
              </p>
              <h3 className="text-3xl font-extrabold text-gray-800 dark:text-white mt-1">
                {totalDocuments}
              </h3>
            </div>
          </div>
          <div className="bg-card-light dark:bg-card-dark rounded-2xl p-6 shadow-sm flex items-center gap-5 border-l-4 border-blue-500 dark:border-blue-400">
            <div className="p-4 bg-blue-500/10 rounded-full shrink-0">
              <svg
                className="w-8 h-8 text-blue-500"
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
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                SOPs & Guides
              </p>
              <h3 className="text-3xl font-extrabold text-gray-800 dark:text-white mt-1">
                {totalSOPs}
              </h3>
            </div>
          </div>
          <div className="bg-card-light dark:bg-card-dark rounded-2xl p-6 shadow-sm flex items-center gap-5 border-l-4 border-orange-500 dark:border-orange-400">
            <div className="p-4 bg-orange-500/10 rounded-full shrink-0">
              <svg
                className="w-8 h-8 text-orange-500"
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
                <path d="m9 15 2 2 4-4" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                Activity Reports
              </p>
              <h3 className="text-3xl font-extrabold text-gray-800 dark:text-white mt-1">
                {totalReports}
              </h3>
            </div>
          </div>
        </div>

        {/* Repository Section */}
        <div className="bg-card-light dark:bg-card-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col flex-1 min-h-[500px]">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 shrink-0">
            <h3 className="text-lg font-extrabold text-gray-800 dark:text-white">
              Document Repository
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search by title, creator..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700/60 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full sm:w-64 outline-none transition-all placeholder:text-gray-400"
                />
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-2 border border-gray-200 dark:border-gray-700/60 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors">
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
                    <line x1="4" y1="21" x2="4" y2="14" />
                    <line x1="4" y1="10" x2="4" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12" y2="3" />
                    <line x1="20" y1="21" x2="20" y2="16" />
                    <line x1="20" y1="12" x2="20" y2="3" />
                    <line x1="1" y1="14" x2="7" y2="14" />
                    <line x1="9" y1="8" x2="15" y2="8" />
                    <line x1="17" y1="16" x2="23" y2="16" />
                  </svg>
                  <span className="hidden sm:inline">Filter</span>
                </button>
              </div>

              <PermissionGate permission={PERMISSIONS.CREATE_DOCUMENTS}>
                <button
                  onClick={() => setUploadOpen(true)}
                  className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm shadow-primary/30 transition-colors"
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
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Documentation
                </button>
              </PermissionGate>
            </div>
          </div>

          {/* Table Integration */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <DocumentTable documents={documents} />
          </div>
        </div>
      </div>

      <DocumentUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
};
