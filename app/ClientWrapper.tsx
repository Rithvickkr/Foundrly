"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Navbar } from "./components/navbar";
import { AppSidebar } from "@/components/app-sidebar";
import { themeManager } from "../lib/theme/ThemeManager";

export function ClientWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login";
  const isplayground = pathname.startsWith("/Slideplayground/") || pathname.startsWith("/Slideplayground");

  useEffect(() => {
    // Ensure ThemeManager is initialized
    console.log('ClientWrapper: Initializing ThemeManager');
    themeManager.getTheme(); // Trigger initialization
  }, []);

  console.log('ClientWrapper: Rendering, isAuthPage:', isAuthPage);
  console.log('ClientWrapper: Rendering, isplayground:', isplayground);
  return (
    <SidebarProvider>
      {(!isAuthPage && !isplayground) && <AppSidebar />}
      <div className="flex flex-col w-full transition-all">
        {!isAuthPage && <Navbar />}
        <main >{children}</main>
      </div>
    </SidebarProvider>
  );
}