"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Activity,
  ClipboardList,
  FileText,
  HeartHandshake,
  LayoutDashboard,
  Package,
  Users,
} from "lucide-react";
import { useEffect } from "react";

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Manage Landing Page",
    url: "/landing",
    icon: LayoutDashboard,
  },

  {
    title: "Manage User",
    url: "#",
    icon: Users,
    items: [
      {
        title: "Manage Division",
        url: "/users/divisions",
      },
      {
        title: "Manage Role",
        url: "/users/roles",
      },
      {
        title: "Manage User",
        url: "/users",
      },
    ],
  },

  {
    title: "Manage Activity",
    url: "/administrator/activities",
    icon: Activity,
  },

  {
    title: "Manage Inventory",
    url: "/inventory",
    icon: Package,
  },

  {
    title: "Manage Donation",
    url: "/donation",
    icon: HeartHandshake,
  },

  {
    title: "Manage Recruitment",
    url: "/administrator/recruitments",
    icon: ClipboardList,
  },

  {
    title: "Manage Documentation",
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
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
