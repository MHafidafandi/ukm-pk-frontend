import { DocumentationList } from "@/features/documentation/components/documentation-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dokumentasi - SI-PEDULI",
  description: "Arsip dokumen dan laporan",
};

export default function DocumentationPage() {
  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <DocumentationList />
    </div>
  );
}
