import { DivisionsList } from "@/features/divisions/components/divisions-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manajemen Divisi | UKM Peduli Kemanusiaan",
  description: "Kelola data divisi",
};

export default function DivisionsPage() {
  return <DivisionsList />;
}
