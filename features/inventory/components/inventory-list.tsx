"use client";

import { useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAssetContext } from "../contexts/AssetContext";
import { Asset } from "../services/assetService";
import { LoanTable } from "./loan-table";
import { AssetFormDialog } from "./asset-form-dialog";
import { LoanFormDialog, LoanFormValues } from "./loan-form-dialog";
import { Spinner } from "@/components/ui/spinner";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import { toast } from "sonner";
import { useEffect } from "react";

const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_URL ?? "";

export const InventoryList = () => {
  const [activeTab, setActiveTab] = useState("assets");
  const [assetFormOpen, setAssetFormOpen] = useState(false);
  const [loanFormOpen, setLoanFormOpen] = useState(false);
  const [isSubmittingLoan, setIsSubmittingLoan] = useState(false);

  // Asset split-screen state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCondition, setFilterCondition] = useState("all");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [assetDetailTab, setAssetDetailTab] = useState("specs");

  // Hidden file input ref for photo upload
  const photoInputRef = useRef<HTMLInputElement>(null);

  const {
    assets,
    loans,
    isFetchingAssets,
    isFetchingLoans,
    createAsset,
    updateAsset,
    deleteAsset,
    uploadAssetImage,
    createLoan,
    returnLoan,
    markLoanAsLost,
  } = useAssetContext();

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleOpenAdd = () => {
    setEditingAsset(null);
    setAssetFormOpen(true);
  };

  const handleOpenEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setAssetFormOpen(true);
    toast.success("Asset successfully updated");
  };

  // Coba sinkronkan ulang selectedAsset dari array 'assets' kalau direfetch (create/edit success)
  useEffect(() => {
    if (selectedAsset) {
      const freshAsset = assets.find((a) => a.id === selectedAsset.id);
      if (freshAsset && JSON.stringify(freshAsset) !== JSON.stringify(selectedAsset)) {
        setSelectedAsset(freshAsset);
      }
    }
  }, [assets, selectedAsset]);

  const handleDeleteAsset = async (asset: Asset) => {
    const confirmed = window.confirm(
      `Hapus aset "${asset.nama}"? Tindakan ini tidak dapat dibatalkan.`
    );
    if (!confirmed) return;
    try {
      await deleteAsset(asset.id);
      if (selectedAsset?.id === asset.id) setSelectedAsset(null);
    } catch {
      // Error sudah ditangani di context
    }
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedAsset) return;
    try {
      await uploadAssetImage({ id: selectedAsset.id, file });
    } catch {
      // Error sudah ditangani di context
    } finally {
      // Reset input agar file yang sama bisa dipilih ulang
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const handleLoanSubmit = async (data: LoanFormValues) => {
    setIsSubmittingLoan(true);
    try {
      await createLoan(data);
      await updateAsset({
        id: data.asset_id,
        data: {
          kondisi: "dipinjam",
        },
      });
      setLoanFormOpen(false);
    } catch {
      // Error sudah ditangani di context
    } finally {
      setIsSubmittingLoan(false);
    }
  };

  const handleReturn = async (loanId: string, data: any) => {
    try {
      await returnLoan({
        id: loanId,
        data: {
          tanggal_kembali: data.tanggal_kembali,
          kondisi: data.kondisi,
          catatan: data.catatan,
        },
      });

      if (data.asset_id) {
        await updateAsset({
          id: data.asset_id,
          data: {
            kondisi: data.kondisi, // Will be "baik" by default from loan-table.tsx
          },
        });
      }
    } catch {
      // Error handled in context
    }
  };

  const handleMarkLost = async (loanId: string, data: any) => {
    const confirmed = window.confirm(
      `Mark this loan as lost? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await markLoanAsLost({
        id: loanId,
        catatan: data.catatan,
      });

      if (data.asset_id) {
        await updateAsset({
          id: data.asset_id,
          data: {
            kondisi: "hilang",
          },
        });
      }
    } catch {
      // Error handled in context
    }
  };

  // ── Filter ────────────────────────────────────────────────────────────────

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.kode.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesCondition = true;
    if (filterCondition === "available") {
      matchesCondition = asset.kondisi === "baik" && asset.available > 0;
    } else if (filterCondition === "in_use") {
      matchesCondition = asset.kondisi === "dipinjam";
    } else if (filterCondition === "maintenance") {
      matchesCondition =
        asset.kondisi === "dalam_perbaikan" ||
        asset.kondisi === "rusak_ringan" ||
        asset.kondisi === "rusak_berat";
    }

    return matchesSearch && matchesCondition;
  });

  // ── Render ────────────────────────────────────────────────────────────────

  if (isFetchingAssets || isFetchingLoans) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Asset Inventory
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage organization assets, equipment, and track loans.
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === "assets" && (
            <PermissionGate permission={PERMISSIONS.CREATE_ASSETS}>
              <Button
                onClick={handleOpenAdd}
                className="bg-primary hover:bg-primary/90 text-white shadow-sm inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-semibold transition-all"
              >
                <Plus className="h-5 w-5" /> Add Asset
              </Button>
            </PermissionGate>
          )}
          {activeTab === "loans" && (
            <PermissionGate permission={PERMISSIONS.CREATE_LOANS}>
              <Button
                onClick={() => setLoanFormOpen(true)}
                className="bg-primary hover:bg-primary/90 text-white shadow-sm inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-semibold transition-all"
              >
                <Plus className="h-5 w-5" /> Record Loan
              </Button>
            </PermissionGate>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs
        defaultValue="assets"
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col flex-1 min-h-0"
      >
        <div className="flex justify-between items-center mb-4 shrink-0">
          <TabsList className="grid w-full grid-cols-2 lg:w-[320px] h-11 p-1 bg-muted/50 rounded-lg">
            <TabsTrigger
              value="assets"
              className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm font-semibold"
            >
              Assets
            </TabsTrigger>
            <TabsTrigger
              value="loans"
              className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm font-semibold"
            >
              Loan History
            </TabsTrigger>
          </TabsList>
        </div>

        {/* LOANS TAB */}
        <TabsContent value="loans" className="flex-1 mt-0 outline-none overflow-y-auto">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden p-1">
            <LoanTable loans={loans} onReturn={handleReturn} onMarkLost={handleMarkLost} />
          </div>
        </TabsContent>

        {/* ASSETS SPLIT SCREEN TAB */}
        <TabsContent
          value="assets"
          className="flex-1 mt-0 outline-none flex flex-col md:flex-row gap-6 h-full min-h-0"
        >
          {/* Left: Asset List */}
          <div className="w-full md:w-1/3 lg:w-80 flex flex-col gap-4 h-full shrink-0">
            {/* Search & Filter */}
            <div className="flex flex-col gap-3 shrink-0">
              <div className="relative">
                <svg
                  className="absolute left-3 top-2.5 text-gray-400 w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  placeholder="Cari aset..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {[
                  { id: "all", label: "All" },
                  { id: "available", label: "Available" },
                  { id: "in_use", label: "In Use" },
                  { id: "maintenance", label: "Maintenance" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterCondition(f.id)}
                    className={
                      "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors " +
                      (filterCondition === f.id
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-white dark:bg-gray-900 text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-50")
                    }
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex-1 overflow-y-auto flex flex-col">
              {filteredAssets.map((asset, idx) => {
                const isActive = selectedAsset?.id === asset.id;
                const isAvailable = asset.kondisi === "baik" && asset.available > 0;
                const isMaintenance =
                  asset.kondisi === "dalam_perbaikan" ||
                  asset.kondisi === "rusak_ringan" ||
                  asset.kondisi === "rusak_berat";
                const isInUse = asset.kondisi === "dipinjam";

                return (
                  <button
                    key={asset.id}
                    onClick={() => {
                      setSelectedAsset(asset);
                      setAssetDetailTab("specs");
                    }}
                    className={
                      "flex items-center gap-4 p-4 border-l-4 transition-colors w-full text-left " +
                      (isActive
                        ? "border-primary bg-primary/5 dark:bg-primary/10"
                        : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50") +
                      (idx !== filteredAssets.length - 1
                        ? " border-b border-gray-100 dark:border-gray-800"
                        : "")
                    }
                  >
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                      {asset.foto_url ? (
                        <img src={`${MEDIA_BASE_URL}${asset.foto_url}`} alt={asset.nama} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-6 h-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className={"text-sm font-bold truncate " + (isActive ? "text-primary" : "text-foreground")}>
                        {asset.nama}
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5">{asset.kode}</span>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className={"w-2 h-2 rounded-full " + (isAvailable ? "bg-green-500" : isInUse ? "bg-blue-500" : isMaintenance ? "bg-orange-500" : "bg-red-500")} />
                        <span className={"text-[10px] uppercase font-bold tracking-wide " + (isAvailable ? "text-green-600" : isInUse ? "text-blue-600" : isMaintenance ? "text-orange-600" : "text-red-600")}>
                          {isInUse ? "Borrowed" : isAvailable ? "Available" : isMaintenance ? "Maintenence" : asset.kondisi}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
              {filteredAssets.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground my-auto">
                  No assets found.
                </div>
              )}
            </div>
          </div>

          {/* Right: Asset Detail */}
          <div className="w-full md:flex-1 flex flex-col gap-4 h-full animate-in fade-in duration-300">
            {selectedAsset ? (
              <>
                {/* Breadcrumb + Action Buttons */}
                <div className="flex items-center justify-between h-8 shrink-0">
                  <div className="flex items-center text-sm font-medium text-muted-foreground gap-2">
                    <span>Assets</span>
                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    <span className="text-primary font-bold">{selectedAsset.nama}</span>
                  </div>
                  <div className="flex gap-2">
                    <PermissionGate permission={PERMISSIONS.EDIT_ASSETS}>
                      <button
                        onClick={() => handleOpenEdit(selectedAsset)}
                        className="p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                        title="Edit aset"
                      >
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                      </button>
                    </PermissionGate>
                    <PermissionGate permission={PERMISSIONS.DELETE_ASSETS}>
                      <button
                        onClick={() => handleDeleteAsset(selectedAsset)}
                        className="p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-muted-foreground hover:text-red-500 hover:border-red-200 transition-colors"
                        title="Hapus aset"
                      >
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </PermissionGate>
                  </div>
                </div>

                {/* Detail Card */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col flex-1 min-h-0 overflow-hidden">
                  {/* Header: Image + Info */}
                  <div className="p-6 md:p-8 flex flex-col xl:flex-row gap-8 border-b border-gray-100 dark:border-gray-800 shrink-0">
                    {/* Image */}
                    <div className="w-full xl:w-56 h-48 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center shrink-0 relative overflow-hidden group">
                      {selectedAsset.foto_url ? (
                        <img src={`${MEDIA_BASE_URL}${selectedAsset.foto_url}`} alt={selectedAsset.nama} className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <svg className="w-10 h-10 text-gray-300 mb-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                          <span className="text-xs text-gray-400 font-medium">Belum Ada Foto</span>
                        </>
                      )}
                      <PermissionGate permission={PERMISSIONS.EDIT_ASSETS}>
                        <button
                          onClick={() => photoInputRef.current?.click()}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-2 backdrop-blur-sm"
                        >
                          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          Upload Photo
                        </button>
                      </PermissionGate>
                    </div>

                    {/* Info */}
                    <div className="flex flex-col flex-1 justify-center">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] font-bold uppercase tracking-wider border border-gray-200 dark:border-gray-700">
                          QTY: {selectedAsset.available} / {selectedAsset.jumlah}
                        </span>
                      </div>
                      <h2 className="text-2xl font-extrabold text-foreground mb-1">{selectedAsset.nama}</h2>
                      <p className="text-sm font-medium text-muted-foreground">SKU: {selectedAsset.kode}</p>
                      <div className="mt-6 flex flex-wrap gap-y-4 gap-x-8">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground mb-1">Condition</span>
                          <span className="text-sm font-bold text-foreground capitalize">
                            {selectedAsset.kondisi.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground mb-1">Location</span>
                          <span className="text-sm font-bold text-foreground">{selectedAsset.lokasi}</span>
                        </div>
                        {selectedAsset.tanggal && (
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground mb-1">Purchase Date</span>
                            <span className="text-sm font-bold text-foreground">
                              {new Date(selectedAsset.tanggal).toLocaleDateString("id-ID")}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-6">
                        <PermissionGate permission={PERMISSIONS.EDIT_ASSETS}>
                          <Button
                            variant="outline"
                            className="h-9 px-4 text-xs font-bold gap-2"
                            onClick={() => handleOpenEdit(selectedAsset)}
                          >
                            <svg className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                            </svg>
                            Edit Asset
                          </Button>
                        </PermissionGate>
                      </div>
                    </div>
                  </div>

                  {/* Detail Tabs */}
                  <div className="flex border-b border-gray-100 dark:border-gray-800 px-6 shrink-0">
                    {[
                      { id: "specs", label: "Specification" },
                      { id: "loans", label: "Loan History" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setAssetDetailTab(tab.id)}
                        className={
                          "px-4 py-4 text-sm border-b-2 transition-colors " +
                          (assetDetailTab === tab.id
                            ? "font-bold text-primary border-primary -mb-px"
                            : "font-semibold text-muted-foreground border-transparent hover:text-primary hover:border-primary/50")
                        }
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                    {assetDetailTab === "specs" && (
                      <div>
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                          Description
                        </h4>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                          {selectedAsset.deskripsi || "No description."}
                        </p>
                      </div>
                    )}
                    {assetDetailTab === "loans" && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                          Loan History
                        </h4>
                        {selectedAsset.loans && selectedAsset.loans.length > 0 ? (
                          <ul className="space-y-3">
                            {selectedAsset.loans.map((loan: any) => (
                              <li key={loan.id} className="text-sm flex p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                                <div className="flex flex-col gap-1 w-1/3">
                                  <span className="font-semibold">
                                    {new Date(loan.tanggal_pinjam).toLocaleDateString("id-ID")}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {loan.user?.nama || "Unknown"}
                                  </span>
                                </div>
                                <div className="w-1/3 flex items-center">
                                  <span className="text-primary font-medium">{loan.status}</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">This asset has never been borrowed.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-muted-foreground border-2 border-dashed rounded-xl border-gray-200 dark:border-gray-800">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                  <svg className="w-8 h-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                </div>
                <p className="font-semibold text-lg text-foreground">No Asset Selected</p>
                <p className="text-sm mt-1 text-center">
                  Select an asset from the list on the left to view details, history, and specifications.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Hidden input for photo upload */}
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
        onSuccess={() => {
          setEditingAsset(null);
        }}
      />
      <LoanFormDialog
        open={loanFormOpen}
        onOpenChange={setLoanFormOpen}
        assets={assets}
        onSubmit={handleLoanSubmit}
        isLoading={isSubmittingLoan}
      />
    </div>
  );
};