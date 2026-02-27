import { AppSidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <TopNavbar />
      <main className="w-full flex-1 overflow-hidden bg-sidebar-accent/10">
        <div className="h-full w-full overflow-auto">{children}</div>
      </main>
    </SidebarProvider>
  );
}
