"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  Clock3,
  FolderOpen,
  Plus,
  Search,
  Users,
  Activity,
  BookOpen,
} from "lucide-react";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import { useDocumentationContext } from "../contexts/DocumentationContext";
import { DocumentTable } from "./document-table";
import { DocumentUploadDialog } from "./document-upload-dialog";
import { DocumentCategory } from "../services/documentationService";
import { usePermission } from "@/hooks/usePermission";

// ── Stat Card ──────────────────────────────────────────────────────────────
// Fix: pisahkan iconBg dari accentBar agar bg-opacity tidak conflict

const StatCard = ({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  barColor,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string; // bg warna muted untuk icon wrapper
  barColor: string; // warna solid untuk accent bar kanan
}) => (
  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    {/* Accent bar kanan — solid color */}
    <div className={`absolute right-0 top-0 h-full w-1 ${barColor}`} />
    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <div className="mt-2 flex items-end justify-between">
      <span className="text-3xl font-black text-slate-900 dark:text-white">
        {value}
      </span>
      {/* Icon wrapper pakai bg muted terpisah — bukan opacity trick */}
      <div className={`rounded-xl p-2.5 ${iconBg}`}>
        <Icon className={`size-5 ${iconColor}`} />
      </div>
    </div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────

export const DocumentationList = () => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { can } = usePermission();

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
  } = useDocumentationContext();

  const canViewAll = can(PERMISSIONS.VIEW_ALL_DOCUMENTATIONS);

  const summary = useMemo(() => {
    const total = statistics?.total_documents ?? documents.length;
    const active =
      statistics?.by_status?.aktif ??
      documents.filter((d) => d.status === "aktif").length;
    const archived =
      statistics?.by_status?.arsip ??
      documents.filter((d) => d.status === "arsip").length;
    const linked = documents.filter((d) => Boolean(d.activity_id)).length;
    return { total, active, archived, linked };
  }, [documents, statistics]);

  return (
    <div className="flex h-full flex-1 flex-col gap-6 overflow-hidden bg-slate-50 p-4 text-text-primary-light dark:bg-slate-900 dark:text-text-primary-dark md:p-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Documentation Management
          </h2>
          <p className="mt-0.5 hidden text-sm text-gray-500 dark:text-gray-400 sm:block">
            Manage and organize organizational documents with Google Drive
            integration.
          </p>
        </div>
        <PermissionGate permission={PERMISSIONS.CREATE_DOCUMENTATIONS}>
          <button
            onClick={() => setUploadOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
          >
            <Plus className="size-4" />
            Add Document
          </button>
        </PermissionGate>
      </div>

      {/* ── Stat Cards ── */}
      {canViewAll && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Total Dokumen"
            value={summary.total}
            icon={FolderOpen}
            iconColor="text-violet-600"
            iconBg="bg-violet-100 dark:bg-violet-900/30"
            barColor="bg-violet-500"
          />
          <StatCard
            label="Aktif"
            value={summary.active}
            icon={BookOpen}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-100 dark:bg-emerald-900/30"
            barColor="bg-emerald-500"
          />
          <StatCard
            label="Diarsipkan"
            value={summary.archived}
            icon={Archive}
            iconColor="text-amber-600"
            iconBg="bg-amber-100 dark:bg-amber-900/30"
            barColor="bg-amber-500"
          />
          <StatCard
            label="Terkait Aktivitas"
            value={summary.linked}
            icon={Activity}
            iconColor="text-sky-600"
            iconBg="bg-sky-100 dark:bg-sky-900/30"
            barColor="bg-sky-500"
          />
        </div>
      )}

      {/* ── Filter Bar ── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Search row */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari judul, deskripsi, file..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
        </div>

        {/* Filters row — scrollable horizontal di mobile */}
        {canViewAll && (
          <div className="flex items-center gap-2 overflow-x-auto p-3 scrollbar-none">
            {/* Type */}
            <select
              value={typeFilter ?? ""}
              onChange={(e) =>
                setTypeFilter(
                  (e.target.value || undefined) as DocumentCategory | undefined,
                )
              }
              className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">Semua Tipe</option>
              <option value="sop">SOP</option>
              <option value="template">Template</option>
              <option value="panduan">Panduan</option>
              <option value="laporan">Laporan</option>
              <option value="lainnya">Lainnya</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter ?? ""}
              onChange={(e) =>
                setStatusFilter(
                  (e.target.value || undefined) as
                    | "aktif"
                    | "arsip"
                    | undefined,
                )
              }
              className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="arsip">Arsip</option>
            </select>

            {/* Activity ID */}
            <div className="relative shrink-0">
              <Activity className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ID Aktivitas..."
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
                className="w-40 rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950"
              />
            </div>

            {/* Creator ID */}
            <div className="relative shrink-0">
              <Users className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ID Pembuat..."
                value={creatorFilter}
                onChange={(e) => setCreatorFilter(e.target.value)}
                className="w-40 rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
          </div>
        )}

        {/* Status-only filter untuk non-admin */}
        {!canViewAll && (
          <div className="flex items-center gap-2 p-3">
            <select
              value={statusFilter ?? ""}
              onChange={(e) =>
                setStatusFilter(
                  (e.target.value || undefined) as
                    | "aktif"
                    | "arsip"
                    | undefined,
                )
              }
              className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="arsip">Arsip</option>
            </select>
          </div>
        )}
      </div>

      {/* ── Document Table ── */}
      <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {isFetchingDocuments ? (
          <div className="flex h-48 flex-col items-center justify-center gap-3 text-sm text-slate-400">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Memuat dokumentasi...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-sm text-slate-400">
            <FolderOpen className="size-10 text-slate-300 dark:text-slate-700" />
            <p className="font-medium">Belum ada dokumen</p>
            <p className="text-xs">
              {search
                ? "Tidak ada hasil untuk pencarian ini."
                : "Tambahkan dokumen pertama."}
            </p>
          </div>
        ) : (
          <DocumentTable documents={documents} />
        )}
      </div>

      {/* ── Recent Added — hanya jika canViewAll ── */}
      {canViewAll && statistics?.recent_added?.length ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <Clock3 className="size-4 text-primary" />
            Baru Ditambahkan
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {statistics.recent_added.map((doc) => (
              <div
                key={doc.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-primary/30 hover:shadow-sm dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {doc.judul}
                    </p>
                    {doc.deskripsi && (
                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                        {doc.deskripsi}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                    {doc.tipe_dokumen}
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
