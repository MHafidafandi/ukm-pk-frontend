"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  Clock3,
  FolderOpen,
  Plus,
  Search,
  UserRound,
} from "lucide-react";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import { useDocumentationContext } from "../contexts/DocumentationContext";
import { DocumentTable } from "./document-table";
import { DocumentUploadDialog } from "./document-upload-dialog";
import { DocumentCategory } from "../services/documentationService";

export const DocumentationList = () => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const {
    documents,
    isFetchingDocuments,
    statistics,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    activityFilter,
    setActivityFilter,
    creatorFilter,
    setCreatorFilter,
    viewScope,
    setViewScope,
  } = useDocumentationContext();

  const summary = useMemo(() => {
    const total = statistics?.total_documents ?? documents.length;
    const active =
      statistics?.by_status?.aktif ??
      documents.filter((document) => document.status === "aktif").length;
    const archived =
      statistics?.by_status?.arsip ??
      documents.filter((document) => document.status === "arsip").length;
    const linked = documents.filter((document) =>
      Boolean(document.activity_id),
    ).length;
    return { total, active, archived, linked };
  }, [documents, statistics]);

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-slate-50 text-text-primary-light dark:bg-slate-900 dark:text-text-primary-dark">
      <div className="mb-6 flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          Documentation Management
        </h2>
        <p className="hidden text-sm text-gray-500 dark:text-gray-400 sm:block">
          Kelola dokumentasi umum, filter berdasarkan tipe/status, lihat dokumen
          terbaru, dan mass archive/delete.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
          <div className="mt-2 flex items-center gap-3">
            <FolderOpen className="size-5 text-primary" />
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {summary.total}
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Aktif</p>
          <div className="mt-2 flex items-center gap-3">
            <Clock3 className="size-5 text-emerald-500" />
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {summary.active}
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Arsip</p>
          <div className="mt-2 flex items-center gap-3">
            <Archive className="size-5 text-amber-500" />
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {summary.archived}
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Terkait Activity
          </p>
          <div className="mt-2 flex items-center gap-3">
            <UserRound className="size-5 text-sky-500" />
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {summary.linked}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "recent", "my", "activity", "type", "creator"] as const).map(
          (scope) => (
            <button
              key={scope}
              type="button"
              onClick={() => setViewScope(scope)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                viewScope === scope
                  ? "bg-primary text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {scope === "all"
                ? "All"
                : scope === "recent"
                  ? "Recent"
                  : scope === "my"
                    ? "My Docs"
                    : scope === "activity"
                      ? "By Activity"
                      : scope === "type"
                        ? "By Type"
                        : "By Creator"}
            </button>
          ),
        )}
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search title, description, file, creator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter ?? ""}
            onChange={(e) =>
              setTypeFilter(
                (e.target.value || undefined) as DocumentCategory | undefined,
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="">All Types</option>
            <option value="sop">SOP</option>
            <option value="template">Template</option>
            <option value="panduan">Panduan</option>
            <option value="laporan">Laporan</option>
            <option value="lainnya">Lainnya</option>
          </select>

          <select
            value={statusFilter ?? ""}
            onChange={(e) =>
              setStatusFilter(
                (e.target.value || undefined) as "aktif" | "arsip" | undefined,
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="">All Status</option>
            <option value="aktif">Aktif</option>
            <option value="arsip">Arsip</option>
          </select>

          <input
            type="text"
            placeholder="Activity ID"
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value)}
            className="w-44 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-950"
          />

          <input
            type="text"
            placeholder="Creator ID"
            value={creatorFilter}
            onChange={(e) => setCreatorFilter(e.target.value)}
            className="w-44 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-950"
          />

          <PermissionGate permission={PERMISSIONS.CREATE_DOCUMENTS}>
            <button
              onClick={() => setUploadOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary/90"
            >
              <Plus className="size-4" />
              Add Documentation
            </button>
          </PermissionGate>
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {isFetchingDocuments ? (
          <div className="flex h-48 items-center justify-center text-sm text-slate-400">
            Loading documentation...
          </div>
        ) : (
          <DocumentTable documents={documents} />
        )}
      </div>

      {statistics?.recent_added?.length ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
            Recent Added
          </h3>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {statistics.recent_added.map((document) => (
              <div
                key={document.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900 dark:text-white">
                      {document.judul}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                      {document.deskripsi}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                    {document.tipe_dokumen}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <DocumentUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
};
