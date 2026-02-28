"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAssetContext } from "../contexts/AssetContext";
import { LoanTable } from "./loan-table";
import { AssetFormDialog } from "./asset-form-dialog";
import { LoanFormDialog } from "./loan-form-dialog";
import { Spinner } from "@/components/ui/spinner";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";

export const InventoryList = () => {
  const [activeTab, setActiveTab] = useState("assets");
  const [assetFormOpen, setAssetFormOpen] = useState(false);
  const [loanFormOpen, setLoanFormOpen] = useState(false);

  // Asset Split-Screen States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCondition, setFilterCondition] = useState("all");
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [assetDetailTab, setAssetDetailTab] = useState("specs");

  const { assets, loans, isFetchingAssets, isFetchingLoans } =
    useAssetContext();

  if (isFetchingAssets || isFetchingLoans) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  // Filter Assets Logic
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

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
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
                onClick={() => setAssetFormOpen(true)}
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

      {/* Main Tabs Container */}
      <Tabs
        defaultValue="assets"
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col flex-1 min-h-0"
      >
        <div className="flex justify-between items-center mb-4 shrink-0">
          <TabsList className="grid w-full grid-cols-2 lg:w-[300px] h-11 p-1 bg-muted/50 rounded-lg">
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
              Loans History
            </TabsTrigger>
          </TabsList>
        </div>

        {/* --- LOANS TAB --- */}
        <TabsContent
          value="loans"
          className="flex-1 mt-0 outline-none overflow-y-auto"
        >
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden p-1">
            <LoanTable loans={loans} />
          </div>
        </TabsContent>

        {/* --- ASSETS SPLIT SCREEN TAB --- */}
        <TabsContent
          value="assets"
          className="flex-1 mt-0 outline-none flex flex-col md:flex-row gap-6 h-full min-h-0"
        >
          {/* Left Column: Asset List */}
          <div className="w-full md:w-1/3 lg:w-80 flex flex-col gap-4 h-full shrink-0">
            {/* Search and Filter */}
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
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-surface-light dark:bg-surface-dark rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  onClick={() => setFilterCondition("all")}
                  className={
                    "px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap " +
                    (filterCondition === "all"
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "bg-surface-light text-text-secondary-light border border-gray-200 hover:bg-gray-50 dark:bg-surface-dark dark:border-gray-700")
                  }
                >
                  All
                </button>
                <button
                  onClick={() => setFilterCondition("available")}
                  className={
                    "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap " +
                    (filterCondition === "available"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-surface-light text-text-secondary-light border border-gray-200 hover:bg-gray-50 dark:bg-surface-dark dark:border-gray-700")
                  }
                >
                  Available
                </button>
                <button
                  onClick={() => setFilterCondition("in_use")}
                  className={
                    "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap " +
                    (filterCondition === "in_use"
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "bg-surface-light text-text-secondary-light border border-gray-200 hover:bg-gray-50 dark:bg-surface-dark dark:border-gray-700")
                  }
                >
                  In Use
                </button>
                <button
                  onClick={() => setFilterCondition("maintenance")}
                  className={
                    "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap " +
                    (filterCondition === "maintenance"
                      ? "bg-orange-100 text-orange-700 border border-orange-200"
                      : "bg-surface-light text-text-secondary-light border border-gray-200 hover:bg-gray-50 dark:bg-surface-dark dark:border-gray-700")
                  }
                >
                  Maintenance
                </button>
              </div>
            </div>

            {/* List Container */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex-1 overflow-y-auto w-full flex flex-col custom-scrollbar">
              {filteredAssets.map((asset, idx) => {
                const isActive = selectedAsset?.id === asset.id;
                const isAvailable =
                  asset.kondisi === "baik" && asset.available > 0;
                const isMaintenance =
                  asset.kondisi === "dalam_perbaikan" ||
                  asset.kondisi === "rusak_ringan" ||
                  asset.kondisi === "rusak_berat";
                const isInUse = asset.kondisi === "dipinjam";

                return (
                  <button
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className={
                      "flex items-center gap-4 p-4 border-l-4 transition-colors w-full text-left group " +
                      (isActive
                        ? "border-primary bg-primary/5 dark:bg-primary/10"
                        : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50") +
                      (idx !== filteredAssets.length - 1
                        ? " border-b border-gray-100 dark:border-gray-800"
                        : "")
                    }
                  >
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-700 overflow-hidden">
                      {asset.foto_url ? (
                        <img
                          src={asset.foto_url}
                          alt={asset.nama}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg
                          className="w-6 h-6 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                          />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span
                        className={
                          "text-sm font-bold truncate " +
                          (isActive
                            ? "text-primary dark:text-primary-light"
                            : "text-text-primary-light dark:text-text-primary-dark")
                        }
                      >
                        {asset.nama}
                      </span>
                      <span className="text-xs text-text-secondary-light mt-0.5">
                        {asset.kode}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span
                          className={
                            "w-2 h-2 rounded-full " +
                            (isAvailable
                              ? "bg-green-500"
                              : isInUse
                                ? "bg-blue-500"
                                : isMaintenance
                                  ? "bg-orange-500"
                                  : "bg-red-500")
                          }
                        ></span>
                        <span
                          className={
                            "text-[10px] uppercase font-bold tracking-wide " +
                            (isAvailable
                              ? "text-green-600"
                              : isInUse
                                ? "text-blue-600"
                                : isMaintenance
                                  ? "text-orange-600"
                                  : "text-red-600")
                          }
                        >
                          {isAvailable
                            ? "Available"
                            : isInUse
                              ? "In Use"
                              : isMaintenance
                                ? "Maintenance"
                                : asset.kondisi}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
              {filteredAssets.length === 0 && (
                <div className="p-8 text-center text-sm text-text-secondary-light my-auto">
                  No assets found.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Asset Detail */}
          <div className="w-full md:flex-1 flex flex-col gap-4 h-full animate-in fade-in duration-300">
            {selectedAsset ? (
              <>
                <div className="flex items-center justify-between mb-1 h-8 shrink-0">
                  {/* Breadcrumbs */}
                  <div className="flex items-center text-sm font-medium text-text-secondary-light gap-2">
                    <span>Assets</span>
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
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    <span className="text-primary font-bold">
                      {selectedAsset.nama}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <PermissionGate permission={PERMISSIONS.EDIT_ASSETS}>
                      <button className="p-2 bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg text-text-secondary-light hover:text-primary transition-colors hover:border-primary/30">
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
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                      </button>
                    </PermissionGate>
                    <PermissionGate permission={PERMISSIONS.DELETE_ASSETS}>
                      <button className="p-2 bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg text-text-secondary-light hover:text-red-500 transition-colors hover:border-red-200">
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
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </PermissionGate>
                  </div>
                </div>

                {/* Content Card Container */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col flex-1 min-h-0 overflow-hidden">
                  {/* Top Detail Header */}
                  <div className="p-6 md:p-8 flex flex-col xl:flex-row gap-8 border-b border-gray-100 dark:border-gray-800 shrink-0">
                    {/* Image */}
                    <div className="w-full xl:w-56 h-48 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center shrink-0 relative overflow-hidden group">
                      {selectedAsset.foto_url ? (
                        <img
                          src={selectedAsset.foto_url}
                          alt={selectedAsset.nama}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <>
                          <svg
                            className="w-10 h-10 text-gray-300 mb-2"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect
                              x="3"
                              y="3"
                              width="18"
                              height="18"
                              rx="2"
                              ry="2"
                            />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                          <span className="text-xs text-gray-400 font-medium">
                            No Image Uploaded
                          </span>
                        </>
                      )}
                      <PermissionGate permission={PERMISSIONS.EDIT_ASSETS}>
                        <button className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-sm">
                          <svg
                            className="w-4 h-4 mr-2"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>{" "}
                          Upload Photo
                        </button>
                      </PermissionGate>
                    </div>

                    {/* Info */}
                    <div className="flex flex-col flex-1 justify-center">
                      <div className="flex justify-between items-start w-full">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] font-bold uppercase tracking-wider border border-gray-200 dark:border-gray-700">
                              QTY: {selectedAsset.available} /{" "}
                              {selectedAsset.jumlah}
                            </span>
                          </div>
                          <h2 className="text-2xl font-extrabold text-text-primary-light dark:text-text-primary-dark mb-1">
                            {selectedAsset.nama}
                          </h2>
                          <p className="text-sm font-medium text-text-secondary-light">
                            SKU: {selectedAsset.kode}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-y-4 gap-x-8">
                        <div className="flex flex-col">
                          <span className="text-xs text-text-secondary-light mb-1">
                            Condition
                          </span>
                          <span className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark capitalize">
                            {selectedAsset.kondisi.replace("_", " ")}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-text-secondary-light mb-1">
                            Location
                          </span>
                          <span className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                            {selectedAsset.lokasi}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-text-secondary-light mb-1">
                            Purchase Date
                          </span>
                          <span className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                            {new Date(
                              selectedAsset.tanggal,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 flex gap-3">
                        <Button
                          variant="outline"
                          className="h-9 px-4 text-xs font-bold gap-2"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                          </svg>
                          Update Condition
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Info Tabs */}
                  <div className="flex border-b border-gray-100 dark:border-gray-800 px-6 shrink-0">
                    <button
                      onClick={() => setAssetDetailTab("specs")}
                      className={
                        "px-4 py-4 text-sm " +
                        (assetDetailTab === "specs"
                          ? "font-bold text-primary border-b-2 border-primary -mb-px"
                          : "font-semibold text-text-secondary-light hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary/50")
                      }
                    >
                      Specifications
                    </button>
                    <button
                      onClick={() => setAssetDetailTab("loans")}
                      className={
                        "px-4 py-4 text-sm " +
                        (assetDetailTab === "loans"
                          ? "font-bold text-primary border-b-2 border-primary -mb-px"
                          : "font-semibold text-text-secondary-light hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary/50")
                      }
                    >
                      Loan History
                    </button>
                  </div>

                  {/* Tab Content: Details */}
                  <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
                    {assetDetailTab === "specs" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs font-bold text-text-secondary-light uppercase tracking-wider mb-2">
                              Description
                            </h4>
                            <p className="text-sm text-text-primary-light dark:text-text-primary-dark leading-relaxed whitespace-pre-wrap">
                              {selectedAsset.deskripsi ||
                                "No description provided."}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {assetDetailTab === "loans" && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-text-secondary-light uppercase tracking-wider mb-2">
                          Recent Loans
                        </h4>
                        {selectedAsset.loans &&
                        selectedAsset.loans.length > 0 ? (
                          <ul className="space-y-3">
                            {selectedAsset.loans.map((loan: any) => (
                              <li
                                key={loan.id}
                                className="text-sm flex p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30"
                              >
                                <div className="flex flex-col gap-1 w-1/3">
                                  <span className="font-semibold">
                                    {new Date(
                                      loan.tanggal_pinjam,
                                    ).toLocaleDateString()}
                                  </span>
                                  <span className="text-xs text-text-secondary-light">
                                    {loan.user?.nama || "Unknown User"}
                                  </span>
                                </div>
                                <div className="w-1/3 flex items-center">
                                  <span className="text-primary font-medium">
                                    {loan.status}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-text-secondary-light">
                            This asset has no loan history.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-text-secondary-light dark:text-text-secondary-dark border-2 border-dashed rounded-xl border-gray-200 dark:border-gray-800 bg-surface-light/50 dark:bg-surface-dark/50">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                </div>
                <p className="font-semibold text-lg text-text-primary-light dark:text-text-primary-dark">
                  No Asset Selected
                </p>
                <p className="text-sm mt-1">
                  Select an asset from the inventory list to view its details,
                  history, and specifications.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <AssetFormDialog open={assetFormOpen} onOpenChange={setAssetFormOpen} />
      <LoanFormDialog
        open={loanFormOpen}
        onOpenChange={setLoanFormOpen}
        assets={assets}
      />
    </div>
  );
};
