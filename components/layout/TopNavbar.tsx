"use client";

import { Search, Bell, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { ModeToggle } from "@/components/ui/ThemeToggle";
import { format } from "date-fns";

export function TopNavbar() {
  const { logout } = useAuth(); // or just leave it empty if not needed

  return (
    <header className="flex h-20 items-center justify-between border-b border-border bg-card px-8 shadow-sm shrink-0 z-10 transition-colors">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-3 text-muted-foreground hover:text-foreground transition-colors" />
        <div className="hidden sm:flex flex-col">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back! 👋
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden lg:flex items-center bg-muted/50 rounded-xl px-3 py-1.5 border border-transparent focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all h-11">
          <Search className="h-4 w-4 text-muted-foreground mr-2" />
          <Input
            className="bg-transparent border-none shadow-none focus-visible:ring-0 w-48 lg:w-64 h-8 px-0"
            placeholder="Search..."
          />
        </div>

        {/* Date / Calendar */}
        <div className="hidden md:flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors h-11">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {format(new Date(), "MMM dd, yyyy")}
          </span>
        </div>

        <ModeToggle />

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:bg-muted text-muted-foreground h-11 w-11 transition-colors"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 bg-destructive rounded-full border-2 border-card" />
        </Button>
      </div>
    </header>
  );
}
