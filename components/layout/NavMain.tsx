"use client";

import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup className="py-2">
      <SidebarGroupLabel className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        Menu
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-0.5">
        {items.map((item) => {
          let isActive = false;
          if (item.url === "/dashboard") {
            isActive = pathname === "/dashboard";
          } else {
            isActive = pathname.startsWith(item.url);
          }

          return (
            <SidebarMenuItem key={item.title}>
              <Link
                href={item.url}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary text-on-primary font-semibold"
                      : "text-on-surface-variant font-medium hover:bg-surface-container hover:text-on-surface"
                  }
                `}
              >
                {item.icon && (
                  <item.icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? "text-on-primary" : "text-on-surface-variant"
                    }`}
                  />
                )}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
