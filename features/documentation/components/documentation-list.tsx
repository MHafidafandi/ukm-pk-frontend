"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useDocuments } from "../hooks";
import { DocumentTable } from "./document-table";
import { DocumentUploadDialog } from "./document-upload-dialog";
import { Spinner } from "@/components/ui/spinner";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";

export const DocumentationList = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const { data, isLoading } = useDocuments();

  const documents = data?.data ?? [];

  if (isLoading) {
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
            Dokumentasi & Arsip
          </h1>
          <p className="text-sm text-muted-foreground">
            Penyimpanan dokumen digital, laporan, dan surat
          </p>
        </div>
        <PermissionGate permission={PERMISSIONS.CREATE_DOCUMENTS}>
          {/* Reusing existing permission for now */}
          <Button onClick={() => setUploadOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Unggah Dokumen
          </Button>
        </PermissionGate>
      </div>

      {/* Filter tabs could be added here if needed */}

      <DocumentTable documents={documents} />

      <DocumentUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
};
