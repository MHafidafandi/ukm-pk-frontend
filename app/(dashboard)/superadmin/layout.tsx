"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  HeartHandshake,
  Package,
  FileText,
} from "lucide-react";
import { useEffect } from "react";
import { Guard } from "@/components/guard";

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },

  {
    title: "Manage User",
    url: "#",
    icon: Users,
    items: [
      {
        title: "Manage Division",
        url: "/superadmin/users/divisions",
      },
      {
        title: "Manage Role",
        url: "/superadmin/users/roles",
      },
      {
        title: "Manage User",
        url: "/superadmin/users",
      },
    ],
  },
  {
    title: "Donasi",
    url: "/donation",
    icon: HeartHandshake,
  },
  {
    title: "Inventaris",
    url: "/inventory",
    icon: Package,
  },
  {
    title: "Dokumentasi",
    url: "/documentation",
    icon: FileText,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) return null; // atau spinner

  if (!isAuthenticated) return null;

  return (
    <SidebarProvider>
      <AppSidebar menuItems={navMain} />
      <SidebarInset>
        <TopNavbar />
        <Guard role="super_admin">
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </Guard>
      </SidebarInset>
    </SidebarProvider>
  );
}
