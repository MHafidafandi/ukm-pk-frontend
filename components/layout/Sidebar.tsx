"use client";

import { Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { usePermission } from "@/hooks/usePermission";
import {
  getLandingPageContents,
  resolveMediaUrl,
} from "@/features/landing-page/services/landingPageService";
import type { LandingContent } from "@/features/landing-page/types";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { NavUser } from "./NavUser";
import { NavMain } from "./NavMain";
import { MENU_ITEMS } from "@/configs/menu";

function findActiveOrganization(contents: LandingContent[]) {
  return (
    contents.find(
      (content) => content.type === "organization" && content.active,
    ) ?? null
  );
}

export function AppSidebar() {
  const { currentUser, logout } = useAuth();
  const { userPermissions } = usePermission();

  const { data } = useQuery({
    queryKey: ["sidebar", "organization"],
    queryFn: () =>
      getLandingPageContents({ type: "organization", active: true }),
    staleTime: 5 * 60_000,
  });

  const handleLogout = async () => logout();

  const org = findActiveOrganization(data?.data ?? []);
  const orgName = org?.title ?? "SIPEDULI";
  const orgLogo = org?.image ? resolveMediaUrl(org.image) : null;

  const filteredMenuItems = MENU_ITEMS.filter((item) =>
    !item.permission ? true : userPermissions.includes(item.permission),
  );

  return (
    <Sidebar className="border-none">
      <div className="flex flex-col h-full glass">
        {/* Header */}
        <SidebarHeader className="px-6 py-6 border-none">
          <div className="flex items-center gap-3">
            {orgLogo ? (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary p-1 shadow-sm overflow-hidden">
                <Image
                  src={orgLogo}
                  alt={orgName}
                  width={36}
                  height={36}
                  className="h-full w-full object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
                <Heart className="h-4 w-4 text-on-primary" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-['Manrope'] text-lg font-extrabold tracking-tight text-primary">
                {orgName}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
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
