"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Navbar } from "./components/navbar";
import { AppSidebar } from "@/components/app-sidebar";
import { themeManager } from "../lib/theme/ThemeManager";

export function ClientWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isslashpage = pathname === "/";
  const isAuthPage = pathname === "/login";
  const isLandingPage = pathname === "/home";
  const isplayground = pathname.startsWith("/Slideplayground/") || pathname.startsWith("/Slideplayground");

  useEffect(() => {
    // Ensure ThemeManager is initialized
    console.log('ClientWrapper: Initializing ThemeManager');
    themeManager.getTheme(); // Trigger initialization
  }, []);
  
  return (
    <SidebarProvider>
      {(!isAuthPage && !isplayground && !isLandingPage && !isslashpage) && <AppSidebar />}
      <div className="flex flex-col w-full transition-all">
        {(!isAuthPage && !isLandingPage && !isslashpage) && <Navbar />}
        <main >{children}</main>
      </div>
    </SidebarProvider>
  );
}