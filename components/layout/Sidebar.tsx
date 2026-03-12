
import { Heart, LucideIcon } from "lucide-react";

import { useAuth } from "@/features/auth/contexts/AuthContext";
import { usePermission } from "@/hooks/usePermission";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";

import { NavUser } from "./NavUser";
import { NavMain } from "./NavMain";
import { MENU_ITEMS } from "@/configs/menu";

// =======================
// Menu Config
// =======================

export function AppSidebar() {
  const menuItems = MENU_ITEMS;
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    logout();
  };

  // Filter menu items based on permissions
  const { userPermissions } = usePermission();

  const filteredMenuItems = menuItems.filter((item) => {
    // If no permission required, show it (or default to show)
    if (!item.permission) return true;
    return userPermissions.includes(item.permission);
  });

  return (
    <Sidebar>
      {/* Header */}
      <SidebarHeader className="p-4 pb-6 border-b border-sidebar-border/50 mb-1">
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary backdrop-blur-sm ring-1 ring-primary/20 shadow-sm">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>

          <div className="flex flex-col truncate">
            <span className="text-xl font-bold tracking-wider text-sidebar-foreground">
              SIPEDULI
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/70">
              Admin Portal
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <NavMain items={filteredMenuItems} />
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-4">
        <NavUser user={currentUser} logout={handleLogout} />
      </SidebarFooter>
    </Sidebar>
  );
}
