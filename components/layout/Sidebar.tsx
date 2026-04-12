"use client";

import { Heart } from "lucide-react";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { usePermission } from "@/hooks/usePermission";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { NavUser } from "./NavUser";
import { NavMain } from "./NavMain";
import { MENU_ITEMS } from "@/configs/menu";

export function AppSidebar() {
  const { currentUser, logout } = useAuth();
  const { userPermissions } = usePermission();

  const handleLogout = async () => logout();

  const filteredMenuItems = MENU_ITEMS.filter((item) =>
    !item.permission ? true : userPermissions.includes(item.permission),
  );

  return (
    <Sidebar className="border-none">
      <div className="flex flex-col h-full glass">
        {/* Header */}
        <SidebarHeader className="px-6 py-6 border-none">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] shadow-sm">
              <Heart className="h-4 w-4 text-on-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-['Manrope'] text-lg font-extrabold tracking-tight text-[var(--primary)]">
                SIPEDULI
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">
                Admin Portal
              </span>
            </div>
          </div>
        </SidebarHeader>

        {/* Nav */}
        <SidebarContent className="px-2 border-none">
          <NavMain items={filteredMenuItems} />
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="px-4 py-4 border-t border-outline-variant">
          <NavUser user={currentUser} logout={handleLogout} />
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
