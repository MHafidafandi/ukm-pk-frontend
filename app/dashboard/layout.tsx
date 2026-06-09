"use client";

import { AppSidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { Guard } from "@/components/guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Guard redirectTo="/login">
      <SidebarProvider>
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden w-full relative">
          <TopNavbar />
          <main className="w-full flex-1 overflow-y-auto overflow-x-hidden bg-surface">
            <div className="mx-auto w-full p-6 lg:p-8 min-h-full">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </Guard>
  );
}
