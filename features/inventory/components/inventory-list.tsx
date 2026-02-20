"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAssets, useLoans } from "../hooks";
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

  const assetsQuery = useAssets();
  const loansQuery = useLoans();

  const assets = assetsQuery.data?.data ?? [];
  const loans = loansQuery.data?.data ?? [];

  if (assetsQuery.isLoading || loansQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Manajemen Inventaris
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola aset barang dan pencatatan peminjaman
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === "assets" && (
            <PermissionGate permission={PERMISSIONS.CREATE_ASSETS}>
              {/* Note: Permission for inventory creation not explicitly defined, using role or maybe generic permission */}
              {/* Actually I should check permissions. Let's assume roles:create / manage for now or add new permissions later */}
              <Button onClick={() => setAssetFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Tambah Aset
              </Button>
            </PermissionGate>
          )}
          {activeTab === "loans" && (
            <PermissionGate permission={PERMISSIONS.CREATE_LOANS}>
              <Button onClick={() => setLoanFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Catat Peminjaman
              </Button>
            </PermissionGate>
          )}
        </div>
      </div>

      <Tabs defaultValue="assets" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="assets">Daftar Aset</TabsTrigger>
          <TabsTrigger value="loans">Peminjaman</TabsTrigger>
        </TabsList>
        <TabsContent value="assets" className="mt-6">
          <AssetTable assets={assets} />
        </TabsContent>
        <TabsContent value="loans" className="mt-6">
          <LoanTable loans={loans} />
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
