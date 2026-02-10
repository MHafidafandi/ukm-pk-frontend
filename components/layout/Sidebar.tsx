"use client";

import {
  LayoutDashboard,
  Users,
  Calendar,
  Heart,
  Package,
  FileText,
  UserPlus,
  Building2,
  LogOut,
} from "lucide-react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// =======================
// Menu Config
// =======================

const mainMenu = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  {
    title: "Company Profile",
    icon: Building2,
    url: "/dashboard/company-profile",
  },
];

const managementMenu = [
  { title: "Manajemen Anggota", icon: Users, url: "/dashboard/users" },
  { title: "Rekrutmen", icon: UserPlus, url: "/dashboard/recruitment" },
];

const activityMenu = [
  { title: "Kegiatan", icon: Calendar, url: "/dashboard/activities" },
  { title: "Donasi", icon: Heart, url: "/dashboard/donations" },
];

const assetMenu = [
  { title: "Inventaris", icon: Package, url: "/dashboard/inventory" },
  { title: "Dokumentasi", icon: FileText, url: "/dashboard/documentation" },
];

// =======================
// Types
// =======================

type MenuItem = {
  title: string;
  icon: React.ElementType;
  url: string;
};

// =======================
// Sidebar Nav Group

// =======================

function SidebarNavGroup({
  label,
  items,
}: Readonly<{ label: string; items: MenuItem[] }>) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>

      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.url}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

// =======================
// Main Sidebar Component
// =======================

export function AppSidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <Sidebar>
      {/* Header */}
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <Heart className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-bold text-sidebar-foreground">
              SI-PEDULI
            </span>
            <span className="text-xs text-sidebar-foreground/60">
              UKM Peduli Kemanusiaan
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      {/* Content */}
      <SidebarContent>
        <SidebarNavGroup label="Utama" items={mainMenu} />
        <SidebarNavGroup label="Manajemen" items={managementMenu} />
        <SidebarNavGroup label="Kegiatan & Donasi" items={activityMenu} />
        <SidebarNavGroup label="Aset & Dokumen" items={assetMenu} />
      </SidebarContent>

      <SidebarSeparator />

      {/* Footer */}
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-sidebar-accent text-xs text-sidebar-accent-foreground">
              {user?.name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {user?.name}
            </span>
            <span className="truncate text-xs text-sidebar-foreground/60">
              {user?.role?.replace("_", " ")}
            </span>
          </div>

          <SidebarMenuButton
            onClick={handleLogout}
            className="h-8 w-8 shrink-0 !p-0"
            tooltip="Logout"
          >
            <LogOut className="h-4 w-4" />
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
