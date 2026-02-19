import { RolesList } from "@/features/roles/components/roles-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manajemen Role | UKM Peduli Kemanusiaan",
  description: "Kelola role pengguna",
};

export default function RolesPage() {
  return <RolesList />;
}
