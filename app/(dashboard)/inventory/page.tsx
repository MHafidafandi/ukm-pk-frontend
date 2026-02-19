import { InventoryList } from "@/features/inventory/components/inventory-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manajemen Inventaris - SI-PEDULI",
  description: "Kelola aset dan peminjaman barang",
};

export default function InventoryPage() {
  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <InventoryList />
    </div>
  );
}
