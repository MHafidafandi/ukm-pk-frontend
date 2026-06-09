/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { useAssetContext } from "../contexts/AssetContext";
import { Asset, type AssetFilters } from "../services/assetService";
import { LoanTable } from "./loan-table";
import { AssetTable } from "./asset-table";
import { AssetFormDialog } from "./asset-form-dialog";
import { LoanFormDialog, LoanFormValues } from "./loan-form-dialog";
import { AssetsStats } from "./assets-stats";
import { LoanStats } from "./loan-stats";
import { Spinner } from "@/components/ui/spinner";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import { toast } from "sonner";
import { env } from "@/configs/env";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react";

const MEDIA_BASE_URL = env.MEDIA_URL;

// ── Filter Pill ───────────────────────────────────────────────────────────────
const FilterPill = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${active
      ? "bg-primary text-on-primary shadow-sm"
      : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high"
      }`}
  >
    {label}
  </button>
);

// ── Condition config for asset list ──────────────────────────────────────────
const getConditionMeta = (kondisi: string, available: number) => {
  if (kondisi === "baik" && available > 0)
    return { label: "Tersedia", dot: "bg-primary", text: "text-primary" };
  if (kondisi === "dipinjam")
    return {
      label: "Dipinjam",
      dot: "bg-secondary",
      text: "text-secondary",
    };
  if (
    kondisi === "rusak_ringan" ||
    kondisi === "rusak_berat" ||
    kondisi === "dalam_perbaikan"
  )
    return {
      label: "Perbaikan",
      dot: "bg-tertiary",
      text: "text-tertiary",
    };
  return {
    label: kondisi.replace(/_/g, " "),
    dot: "bg-error",
    text: "text-error",
  };
};

// ── Main Component ────────────────────────────────────────────────────────────
export const InventoryList = () => {
  const [activeTab, setActiveTab] = useState<"assets" | "loans">("assets");
  const [assetFormOpen, setAssetFormOpen] = useState(false);
  const [loanFormOpen, setLoanFormOpen] = useState(false);
  const [isSubmittingLoan, setIsSubmittingLoan] = useState(false);
  const [activeLoanFilter, setActiveLoanFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCondition, setFilterCondition] = useState("all");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [assetDetailTab, setAssetDetailTab] = useState<"specs" | "loans">(
    "specs",
  );

  const photoInputRef = useRef<HTMLInputElement>(null);

  const {
    assets,
    availableAssets,
    loans,
    pagination,
    filters,
    setFilters,
    loanFilters,
    setLoanFilters,
    loanPagination,
    isFetchingAssets,
    isFetchingLoans,
    createAsset,
    activeLoans,
    overdueLoans,
    updateAsset,
    deleteAsset,
    stats: statsData,
    loanStatsData,
    createLoan,
    returnLoan,
    markLoanAsLost,
  } = useAssetContext();
  const assetFilters: AssetFilters = filters ?? {};

  // ── Sync selectedAsset setelah refetch ───────────────────────────────────
  useEffect(() => {
    if (selectedAsset) {
      const fresh = assets.find((a) => a.id === selectedAsset.id);
      if (fresh && JSON.stringify(fresh) !== JSON.stringify(selectedAsset)) {
        setSelectedAsset(fresh);
      }
    }
  }, [assets, selectedAsset]);

  // ── Stats memo ────────────────────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      total_assets: statsData?.total_assets ?? 0,
      total_loans: statsData?.total_loans ?? 0,
      active_loans: statsData?.active_loans ?? 0,
      available_assets: statsData?.available_assets ?? 0,
      condition_summary: statsData?.condition_summary ?? [],
      loan_status_summary: statsData?.loan_status_summary ?? [],
    }),
    [statsData],
  );

  const loanStats = useMemo(
    () => ({
      total_all: loanStatsData?.total_all ?? 0,
      total_dipinjam: loanStatsData?.total_dipinjam ?? 0,
      total_overdue: loanStatsData?.total_overdue ?? 0,
      total_rusak: loanStatsData?.total_rusak ?? 0,
    }),
    [loanStatsData],
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setEditingAsset(null);
    setAssetFormOpen(true);
  };

  const handleOpenEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setAssetFormOpen(true);
  };

  const handleDeleteAsset = async (asset: Asset) => {
    if (
      !window.confirm(
        `Hapus aset "${asset.nama}"? Tindakan ini tidak dapat dibatalkan.`,
      )
    )
      return;
    try {
      await deleteAsset(asset.id);
      if (selectedAsset?.id === asset.id) setSelectedAsset(null);
      toast.success("Aset berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus aset");
    }
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedAsset) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file foto maksimal 2MB");
      if (photoInputRef.current) photoInputRef.current.value = "";
      return;
    }
    try {
      await updateAsset({ id: selectedAsset.id, data: { foto: file } });
      toast.success("Foto berhasil diperbarui");
    } catch {
      toast.error("Gagal mengunggah foto");
    } finally {
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const handleLoanSubmit = async (data: LoanFormValues) => {
    setIsSubmittingLoan(true);
    try {
      await createLoan(data);
      await updateAsset({ id: data.asset_id, data: { kondisi: "dipinjam" } });
      setLoanFormOpen(false);
      toast.success("Peminjaman berhasil dicatat");
    } catch {
      toast.error("Gagal mencatat peminjaman");
    } finally {
      setIsSubmittingLoan(false);
    }
  };

  const handleReturn = async (loanId: string, data: any) => {
    try {
      await returnLoan({ id: loanId, data });
      if (data.asset_id) {
        await updateAsset({
          id: data.asset_id,
          data: { kondisi: data.kondisi },
        });
      }
      toast.success("Aset berhasil dikembalikan");
    } catch {
      toast.error("Gagal memproses pengembalian");
    }
  };

  const handleMarkLost = async (loanId: string, data: any) => {
    if (
      !window.confirm(
        "Tandai aset ini sebagai hilang? Tindakan ini tidak dapat dibatalkan.",
      )
    )
      return;
    try {
      await markLoanAsLost({ id: loanId, catatan: data.catatan });
      if (data.asset_id) {
        await updateAsset({ id: data.asset_id, data: { kondisi: "hilang" } });
      }
      toast.success("Aset ditandai hilang");
    } catch {
      toast.error("Gagal memperbarui status");
    }
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filteredAssets = assets.filter((asset) => {
    const matchSearch =
      asset.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.kode.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;
    if (filterCondition === "available")
      return asset.kondisi === "baik" && asset.available > 0;
    if (filterCondition === "in_use") return asset.kondisi === "dipinjam";
    if (filterCondition === "maintenance")
      return ["dalam_perbaikan", "rusak_ringan", "rusak_berat"].includes(
        asset.kondisi,
      );
    return true;
  });

  const filteredLoans = useMemo(() => {
    let base = loans ?? [];
    if (activeLoanFilter === "active") base = activeLoans ?? [];
    else if (activeLoanFilter === "overdue") base = overdueLoans ?? [];
    return base.filter(
      (loan) =>
        loan.asset?.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.user?.nama.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [loans, activeLoans, overdueLoans, searchQuery, activeLoanFilter]);

  const assetTotalPages = pagination?.total_pages ?? 1;
  const loanTotalPages = loanPagination?.total_pages ?? 1;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isFetchingAssets || isFetchingLoans) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-['Manrope'] font-bold text-3xl text-on-surface tracking-tight">
            Inventaris & Aset
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Kelola aset fisik organisasi dan pantau peminjaman secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === "loans" && (
            <PermissionGate permission={PERMISSIONS.CREATE_LOANS}>
              <button
                onClick={() => setLoanFormOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface text-sm font-medium hover:bg-surface-container-high transition-colors"
              >
                <Plus className="w-4 h-4" />
                Catat Peminjaman
              </button>
            </PermissionGate>
          )}
          {activeTab === "assets" && (
            <PermissionGate permission={PERMISSIONS.CREATE_ASSETS}>
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-br from-primary to-primary-container text-white text-sm font-bold shadow-lg hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Tambah Aset
              </button>
            </PermissionGate>
          )}
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {activeTab === "assets" && <AssetsStats stats={stats} />}
        {activeTab === "loans" && <LoanStats loanStats={loanStats} />}
      </div>

      {/* ── Tab Bar ─────────────────────────────────────────────────────── */}
      <div className="bg-surface-container-low rounded-2xl overflow-hidden">
        {/* Tab Switcher */}
        <div className="flex items-center gap-1 px-6 pt-5 pb-0">
          {(["assets", "loans"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSearchQuery("");
              }}
              className={`px-6 py-2.5 rounded-t-xl text-sm font-bold transition-all ${activeTab === tab
                ? "bg-surface-container-lowest text-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                }`}
            >
              {tab === "assets" ? "Katalog Aset" : "Riwayat Peminjaman"}
            </button>
          ))}
        </div>

        {/* ── Toolbar ─────────────────────────────────────────────────── */}
        <div className="bg-surface-container-lowest mx-0 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input
              type="text"
              placeholder={
                activeTab === "assets"
                  ? "Cari nama atau kode aset..."
                  : "Cari aset atau peminjam..."
              }
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);
                setFilters({ ...filters, search: value || undefined, page: 1 });
                setLoanFilters({
                  ...loanFilters,
                  search: value || undefined,
                  page: 1,
                });
              }}
              className="w-full bg-surface-container-low rounded-full py-2.5 pl-10 pr-4 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {activeTab === "assets" &&
              [
                { id: "all", label: "Semua" },
                { id: "available", label: "Tersedia" },
                { id: "in_use", label: "Dipinjam" },
                { id: "maintenance", label: "Perbaikan" },
              ].map((f) => (
                <FilterPill
                  key={f.id}
                  label={f.label}
                  active={filterCondition === f.id}
                  onClick={() => setFilterCondition(f.id)}
                />
              ))}

            {activeTab === "loans" &&
              [
                { id: "all", label: "Semua" },
                { id: "active", label: "Aktif" },
                { id: "overdue", label: "Terlambat" },
              ].map((f) => (
                <FilterPill
                  key={f.id}
                  label={f.label}
                  active={activeLoanFilter === f.id}
                  onClick={() => setActiveLoanFilter(f.id)}
                />
              ))}

            <select
              value={
                activeTab === "assets"
                  ? assetFilters.sort || "created_at"
                  : loanFilters.sort || "created_at"
              }
              onChange={(e) => {
                const value = e.target.value;
                if (activeTab === "assets") {
                  setFilters({ ...assetFilters, sort: value, page: 1 });
                } else {
                  setLoanFilters({ ...loanFilters, sort: value, page: 1 });
                }
              }}
              className="bg-surface-container-lowest border-0 border-b-2 border-outline-variant rounded-t-lg px-3 py-2 text-xs font-medium text-on-surface-variant outline-none focus:border-primary transition-colors"
            >
              <option value="created_at">Urut: Dibuat</option>
              <option value="nama">Urut: Nama</option>
              <option value="kode">Urut: Kode</option>
              <option value="tanggal_pinjam">Urut: Tgl Pinjam</option>
              <option value="status">Urut: Status</option>
            </select>

            <button
              onClick={() => {
                if (activeTab === "assets") {
                  setFilters({
                    ...assetFilters,
                    order: assetFilters.order === "ASC" ? "DESC" : "ASC",
                    page: 1,
                  });
                } else {
                  setLoanFilters({
                    ...loanFilters,
                    order: loanFilters.order === "ASC" ? "DESC" : "ASC",
                    page: 1,
                  });
                }
              }}
              className="px-3 py-2 rounded-xl bg-surface-container-lowest text-on-surface-variant text-xs font-bold hover:bg-surface-container-high transition-colors"
            >
              {(activeTab === "assets"
                ? assetFilters.order
                : loanFilters.order) === "ASC"
                ? "Asc"
                : "Desc"}
            </button>
          </div>
        </div>

        {/* ── Tab Content ─────────────────────────────────────────────── */}

        {/* LOANS TAB */}
        {activeTab === "loans" && (
          <div className="bg-surface-container-lowest">
            <LoanTable
              loans={filteredLoans}
              onReturn={handleReturn}
              onMarkLost={handleMarkLost}
            />
            {activeLoanFilter === "all" && loanPagination && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant/10">
                <p className="text-xs text-on-surface-variant">
                  Halaman {loanFilters.page ?? 1} dari {loanTotalPages}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    disabled={(loanFilters.page ?? 1) <= 1}
                    onClick={() =>
                      setLoanFilters({
                        ...loanFilters,
                        page: Math.max(1, (loanFilters.page ?? 1) - 1),
                      })
                    }
                    className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-highest transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={(loanFilters.page ?? 1) >= loanTotalPages}
                    onClick={() =>
                      setLoanFilters({
                        ...loanFilters,
                        page: Math.min(
                          loanTotalPages,
                          (loanFilters.page ?? 1) + 1,
                        ),
                      })
                    }
                    className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-highest transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ASSETS TAB — Split Screen */}
        {activeTab === "assets" && (
          <div className="bg-surface-container-lowest flex flex-col md:flex-row min-h-130">
            {/* Left: Asset List */}
            <div className="w-full md:w-72 lg:w-80 shrink-0 border-r border-outline-variant/10 flex flex-col overflow-y-auto max-h-150">
              {filteredAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 p-8 text-on-surface-variant gap-3">
                  <Search className="w-8 h-8 opacity-40" />
                  <p className="text-sm font-medium">
                    Tidak ada aset ditemukan.
                  </p>
                </div>
              ) : (
                filteredAssets.map((asset) => {
                  const meta = getConditionMeta(asset.kondisi, asset.available);
                  const isSelected = selectedAsset?.id === asset.id;
                  return (
                    <button
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      className={`w-full text-left px-5 py-4 flex items-center gap-4 transition-colors border-b border-outline-variant/5 ${isSelected
                        ? "bg-primary-fixed/30"
                        : "hover:bg-surface-container-low"
                        }`}
                    >
                      {/* Thumbnail */}
                      <div className="w-10 h-10 rounded-xl bg-surface-container shrink-0 overflow-hidden">
                        {asset.foto_url ? (
                          <img
                            src={
                              asset.foto_url.startsWith("http")
                                ? asset.foto_url
                                : `${MEDIA_BASE_URL}${asset.foto_url}`
                            }
                            alt={asset.nama}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageOff className="w-4 h-4 text-outline" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-on-surface truncate">
                          {asset.nama}
                        </p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">
                          {asset.kode}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${meta.dot}`}
                          />
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wide ${meta.text}`}
                          >
                            {meta.label}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <ChevronRight className="w-4 h-4 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Right: Asset Detail */}
            <div className="flex-1 flex flex-col min-h-0">
              {selectedAsset ? (
                <>
                  {/* Detail Header */}
                  <div className="p-6 lg:p-8 border-b border-outline-variant/10 flex flex-col xl:flex-row gap-6">
                    {/* Photo */}
                    <div className="w-full xl:w-52 h-44 rounded-2xl bg-surface-container shrink-0 relative overflow-hidden group">
                      {selectedAsset.foto_url ? (
                        <img
                          src={
                            selectedAsset.foto_url.startsWith("http")
                              ? selectedAsset.foto_url
                              : `${MEDIA_BASE_URL}${selectedAsset.foto_url}`
                          }
                          alt={selectedAsset.nama}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-outline">
                          <ImageOff className="w-8 h-8" />
                          <span className="text-xs font-medium">
                            Belum ada foto
                          </span>
                        </div>
                      )}
                      <PermissionGate permission={PERMISSIONS.EDIT_ASSETS}>
                        <button
                          onClick={() => photoInputRef.current?.click()}
                          className="absolute inset-0 bg-on-surface/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white"
                        >
                          <Upload className="w-5 h-5" />
                          <span className="text-xs font-bold">Ganti Foto</span>
                        </button>
                      </PermissionGate>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold uppercase tracking-wide mb-3">
                            {selectedAsset.available} / {selectedAsset.jumlah}{" "}
                            tersedia
                          </span>
                          <h2 className="font-['Manrope'] font-extrabold text-2xl text-on-surface">
                            {selectedAsset.nama}
                          </h2>
                          <p className="text-sm text-on-surface-variant mt-0.5">
                            SKU: {selectedAsset.kode}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <PermissionGate permission={PERMISSIONS.EDIT_ASSETS}>
                            <button
                              onClick={() => handleOpenEdit(selectedAsset)}
                              className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary-fixed/30 transition-colors"
                              title="Edit aset"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </PermissionGate>
                          <PermissionGate
                            permission={PERMISSIONS.DELETE_ASSETS}
                          >
                            <button
                              onClick={() => handleDeleteAsset(selectedAsset)}
                              className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors"
                              title="Hapus aset"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </PermissionGate>
                        </div>
                      </div>

                      {/* Meta Grid */}
                      <div className="mt-5 grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          {
                            label: "Kondisi",
                            value: selectedAsset.kondisi.replace(/_/g, " "),
                          },
                          { label: "Lokasi", value: selectedAsset.lokasi },
                          ...(selectedAsset.tanggal
                            ? [
                              {
                                label: "Tgl Pengadaan",
                                value: new Date(
                                  selectedAsset.tanggal,
                                ).toLocaleDateString("id-ID"),
                              },
                            ]
                            : []),
                        ].map((m) => (
                          <div key={m.label}>
                            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">
                              {m.label}
                            </p>
                            <p className="text-sm font-semibold text-on-surface capitalize">
                              {m.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Detail Tabs */}
                  <div className="flex border-b border-outline-variant/10 px-6">
                    {(["specs", "loans"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setAssetDetailTab(t)}
                        className={`px-5 py-4 text-sm border-b-2 transition-colors font-medium ${assetDetailTab === t
                          ? "border-primary text-primary font-bold"
                          : "border-transparent text-on-surface-variant hover:text-on-surface"
                          }`}
                      >
                        {t === "specs" ? "Spesifikasi" : "Riwayat Pinjam"}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="p-6 lg:p-8 flex-1 overflow-y-auto">
                    {assetDetailTab === "specs" && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">
                          Deskripsi
                        </p>
                        <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                          {selectedAsset.deskripsi || "Tidak ada deskripsi."}
                        </p>
                      </div>
                    )}

                    {assetDetailTab === "loans" && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">
                          Riwayat Peminjaman
                        </p>
                        {selectedAsset.loans &&
                          selectedAsset.loans.length > 0 ? (
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          selectedAsset.loans.map((loan: any) => (
                            <div
                              key={loan.id}
                              className="flex items-center justify-between p-4 rounded-xl bg-surface-container"
                            >
                              <div>
                                <p className="text-sm font-semibold text-on-surface">
                                  {loan.user?.nama || "Tidak diketahui"}
                                </p>
                                <p className="text-xs text-on-surface-variant mt-0.5">
                                  {new Date(
                                    loan.tanggal_pinjam,
                                  ).toLocaleDateString("id-ID")}
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${loan.status === "dikembalikan"
                                  ? "bg-secondary-fixed text-on-secondary-fixed-variant"
                                  : loan.status === "hilang"
                                    ? "bg-error-container text-on-error-container"
                                    : "bg-primary-fixed text-on-primary-fixed-variant"
                                  }`}
                              >
                                {loan.status}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-on-surface-variant">
                            Aset ini belum pernah dipinjam.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Empty State */
                <div className="flex-1 flex flex-col items-center justify-center p-10 text-on-surface-variant gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center">
                    <ImageOff className="w-7 h-7 text-outline" />
                  </div>
                  <div className="text-center">
                    <p className="font-['Manrope'] font-bold text-on-surface text-lg">
                      Pilih Aset
                    </p>
                    <p className="text-sm mt-1 max-w-xs">
                      Klik salah satu aset dari daftar untuk melihat detail,
                      spesifikasi, dan riwayat peminjaman.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {activeTab === "assets" && assetTotalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-xs text-on-surface-variant">
            Halaman {assetFilters.page ?? 1} dari {assetTotalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={(assetFilters.page ?? 1) <= 1}
              onClick={() =>
                setFilters({
                  ...assetFilters,
                  page: Math.max(1, (assetFilters.page ?? 1) - 1),
                })
              }
              className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-highest transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={(assetFilters.page ?? 1) >= assetTotalPages}
              onClick={() =>
                setFilters({
                  ...assetFilters,
                  page: Math.min(assetTotalPages, (assetFilters.page ?? 1) + 1),
                })
              }
              className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-highest transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Hidden photo input */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUploadPhoto}
      />

      {/* Dialogs */}
      <AssetFormDialog
        open={assetFormOpen}
        onOpenChange={setAssetFormOpen}
        asset={editingAsset}
        onSuccess={() => setEditingAsset(null)}
      />
      <LoanFormDialog
        open={loanFormOpen}
        onOpenChange={setLoanFormOpen}
        assets={availableAssets}
        onSubmit={handleLoanSubmit}
        isLoading={isSubmittingLoan}
      />
    </div>
  );
};
