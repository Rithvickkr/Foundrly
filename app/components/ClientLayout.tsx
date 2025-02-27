"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showLayout = pathname !== "/"; // Hide Navbar & Sidebar on homepage

  return (
    <SidebarProvider>
      {showLayout && <Navbar />}
      <div className="flex">
        {showLayout && <AppSidebar />}
        <main className={`p-4 ${showLayout ? "ml-[250px]" : ""}`}>{children}</main>
      </div>
    </SidebarProvider>
  );
}
