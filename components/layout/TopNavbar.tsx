"use client";

import { Bell, Settings, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/features/auth/contexts/AuthContext";

export function TopNavbar() {
  const { logout } = useAuth();

  return (
    <header
      className="glass-header flex h-16 items-center justify-between px-8 shrink-0 z-40 sticky top-0 transition-colors"
      style={{ boxShadow: "0 1px 0 var(--outline-variant)" }}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-2 text-on-surface-variant hover:text-primary transition-colors" />

        {/* Search */}
        <div className="hidden lg:flex items-center bg-surface-container-low rounded-xl px-3 h-10 gap-2 focus-within:ring-2 focus-within:ring-primary transition-all">
          <Search className="h-4 w-4 text-on-surface-variant" />
          <Input
            className="bg-transparent border-none shadow-none focus-visible:ring-0 w-56 h-8 px-0 text-sm text-on-surface placeholder:text-on-surface-variant"
            placeholder="Search curated database..."
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full border-2 border-white" />
        </Button>

        {/* Settings */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
        >
          <Settings className="h-4 w-4" />
        </Button>

        {/* Divider */}
        <div className="h-6 w-px bg-outline-variant mx-1" />

        {/* Label */}
        <div className="hidden sm:flex flex-col text-right">
          <span className="font-['Manrope'] text-xs font-bold text-on-surface">
            Admin Portal
          </span>
          <span className="text-[10px] text-on-surface-variant font-medium">
            UKM Dashboard
          </span>
        </div>
      </div>
    </header>
  );
}
