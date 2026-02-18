"use client";

import { Heart, LucideIcon } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";

import { NavMainSub } from "./NavMainSub";
import { NavUser } from "./NavUser";
import { NavMain } from "./NavMain";

// =======================
// Menu Config
// =======================

// =======================
// Types
// =======================
type MenuItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
};

export function AppSidebar({ menuItems }: { menuItems: MenuItem[] }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    logout();
  };

  let navSub: MenuItem[] | undefined;
  let nav: MenuItem[] | undefined;
  menuItems.forEach((menu) => {
    if (menu.items && menu.items.length > 0) {
      navSub = navSub || [];
      navSub.push(menu);
    } else {
      nav = nav || [];
      nav.push(menu);
    }
  });

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
        <NavMain items={nav || []} />
        <NavMainSub items={navSub || []} />
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-4">
        <NavUser user={user} logout={handleLogout} />
      </SidebarFooter>
    </Sidebar>
  );
}
