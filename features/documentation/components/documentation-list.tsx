"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  FolderOpen,
  Plus,
  Search,
  Users,
  Activity,
  Clock3,
  BookOpen,
} from "lucide-react";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import {
  useActivitiesSelect,
  useUsersSelect,
} from "@/lib/services/selectService";
import { useDocumentationContext } from "../contexts/DocumentationContext";
import { DocumentTable } from "./document-table";
import { DocumentUploadDialog } from "./document-upload-dialog";
import { DocumentCategory } from "../services/documentationService";
import { usePermission } from "@/hooks/usePermission";

export const DocumentationList = () => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any>(null);
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
    creatorFilter,
    setCreatorFilter,
    activityFilter,
    setActivityFilter,
  } = useDocumentationContext();

  const { data: activities = [], isLoading: loadingActivities } =
    useActivitiesSelect();
  const { data: users = [], isLoading: loadingUsers } = useUsersSelect();

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

  const statCards = [
    {
      label: "Total Dokumen",
      value: summary.total,
      icon: FolderOpen,
      bg: "bg-secondary-container",
      color: "text-on-secondary-container",
    },
    {
      label: "Aktif",
      value: summary.active,
      icon: BookOpen,
      bg: "bg-primary-fixed",
      color: "text-on-primary-fixed-variant",
    },
    {
      label: "Diarsipkan",
      value: summary.archived,
      icon: Archive,
      bg: "bg-tertiary-fixed",
      color: "text-on-tertiary-fixed-variant",
    },
    {
      label: "Terkait Aktivitas",
      value: summary.linked,
      icon: Activity,
      bg: "bg-secondary-fixed",
      color: "text-on-secondary-fixed-variant",
    },
  ];

  return (
    <>
      {/* ── Header ── */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-['Manrope'] text-3xl font-bold text-on-surface tracking-tight">
            Documentation
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Kelola dan organisasi dokumen dengan integrasi Google Drive.
          </p>
        </div>
        <PermissionGate permission={PERMISSIONS.CREATE_DOCUMENTATIONS}>
          <button
            onClick={() => {
              setEditingDoc(null);
              setUploadOpen(true);
            }}
            className="bg-primary-gradient text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-ambient hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            Tambah Dokumen
          </button>
        </PermissionGate>
      </header>

      {/* ── Stats ── */}
      {canViewAll && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-surface-container-lowest rounded-2xl p-6 flex items-center gap-4 shadow-ambient"
              >
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${card.bg}`}
                >
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">
                    {card.label}
                  </p>
                  <p className="font-['Manrope'] text-2xl font-bold text-on-surface">
                    {card.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Filter Bar ── */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-ambient mb-6 overflow-hidden">
        {/* Search */}
        <div className="px-6 py-4 border-b border-outline-variant/10">
          <div className="relative">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Cari judul, deskripsi, file..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-6 bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm text-on-surface placeholder:text-on-surface-variant outline-none transition-all"
            />
          </div>
        </div>

        {/* Filters */}
        {canViewAll ? (
          <div className="flex items-center gap-3 overflow-x-auto px-6 py-4">
            <select
              value={typeFilter ?? ""}
              onChange={(e) =>
                setTypeFilter(
                  (e.target.value || undefined) as DocumentCategory | undefined,
                )
              }
              className="shrink-0 bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface py-2 pl-3 pr-8 rounded-xl text-sm cursor-pointer outline-none transition-all appearance-none"
            >
              <option value="">Semua Tipe</option>
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
                  (e.target.value || undefined) as
                    | "aktif"
                    | "arsip"
                    | undefined,
                )
              }
              className="shrink-0 bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface py-2 pl-3 pr-8 rounded-xl text-sm cursor-pointer outline-none transition-all appearance-none"
            >
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="arsip">Arsip</option>
            </select>

            <div className="relative shrink-0">
              <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-on-surface-variant z-10" />
              <select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
                className="w-44 bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 py-2 pl-8 pr-8 rounded-xl text-sm text-on-surface cursor-pointer outline-none transition-all appearance-none"
              >
                <option value="">
                  {loadingActivities ? "Memuat..." : "Semua Aktivitas"}
                </option>
                {activities.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative shrink-0">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-on-surface-variant z-10" />
              <select
                value={creatorFilter}
                onChange={(e) => setCreatorFilter(e.target.value)}
                className="w-44 bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 py-2 pl-8 pr-8 rounded-xl text-sm text-on-surface cursor-pointer outline-none transition-all appearance-none"
              >
                <option value="">
                  {loadingUsers ? "Memuat..." : "Semua Pembuat"}
                </option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="px-6 py-4">
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
              className="bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface py-2 pl-3 pr-8 rounded-xl text-sm cursor-pointer outline-none transition-all appearance-none"
            >
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="arsip">Arsip</option>
            </select>
          </div>
        )}
      </div>

      {/* ── Document Table ── */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-ambient overflow-hidden">
        {isFetchingDocuments ? (
          <div className="flex h-48 flex-col items-center justify-center gap-3 text-sm text-on-surface-variant">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="font-interface">Memuat dokumentasi...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2">
            <FolderOpen className="h-10 w-10 text-on-surface-variant/30" />
            <p className="font-medium text-sm text-on-surface-variant">
              Belum ada dokumen
            </p>
            <p className="text-xs text-on-surface-variant">
              {search
                ? "Tidak ada hasil untuk pencarian ini."
                : "Tambahkan dokumen pertama."}
            </p>
          </div>
        ) : (
          <DocumentTable
            documents={documents}
            onEdit={(doc) => {
              setEditingDoc(doc);
              setUploadOpen(true);
            }}
          />
        )}
      </div>

      {/* ── Recent Added ── */}
      {canViewAll && statistics?.recent_added?.length ? (
        <div className="mt-6 bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
          <h3 className="font-['Manrope'] text-base font-bold text-on-surface mb-4 flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-primary" />
            Baru Ditambahkan
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {statistics.recent_added.map((doc) => (
              <div
                key={doc.id}
                className="rounded-xl bg-surface-container-low p-4 hover:bg-surface-container transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-on-surface truncate">
                      {doc.judul}
                    </p>
                    {doc.deskripsi && (
                      <p className="mt-0.5 text-xs text-on-surface-variant truncate">
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

      <DocumentUploadDialog
        open={uploadOpen}
        onOpenChange={(op) => {
          setUploadOpen(op);
          if (!op) setTimeout(() => setEditingDoc(null), 300);
        }}
        isEdit={!!editingDoc}
        initialData={editingDoc}
      />
    </>
  );
};
