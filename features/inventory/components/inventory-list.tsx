"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAssetContext } from "../contexts/AssetContext";
import { AssetTable } from "./asset-table";
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

  const { assets, loans, isFetchingAssets, isFetchingLoans } =
    useAssetContext();

  if (isFetchingAssets || isFetchingLoans) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
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

      {/* Filters & Search */}
      <div className="mb-8 flex flex-col gap-4 rounded-xl bg-card border border-border p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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
          </div>
          <input
            className="block w-full rounded-lg border-0 bg-muted/50 py-2.5 pl-10 pr-4 text-foreground ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all"
            placeholder="Search assets or loans..."
            type="text"
          />
        </div>

        <Tabs
          defaultValue="assets"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full lg:w-auto"
        >
          <TabsList className="grid w-full grid-cols-2 lg:w-[300px] h-11 p-1 bg-muted/50 rounded-lg">
            <TabsTrigger
              value="assets"
              className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Asset List
            </TabsTrigger>
            <TabsTrigger
              value="loans"
              className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Loans
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden p-1">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="assets" className="mt-0 outline-none">
            <AssetTable assets={assets} />
          </TabsContent>
          <TabsContent value="loans" className="mt-0 outline-none">
            <LoanTable loans={loans} />
          </TabsContent>
        </Tabs>
      </div>

      <AssetFormDialog open={assetFormOpen} onOpenChange={setAssetFormOpen} />
      <LoanFormDialog
        open={loanFormOpen}
        onOpenChange={setLoanFormOpen}
        assets={assets}
      />
    </div>
  );
};
