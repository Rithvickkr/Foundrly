"use client";

import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";
import { Navbar } from "./components/navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isAuthPage = pathname === "/login"; // Check if on login page

  return (
    <html lang="en">
      <body className="bg-gray-100 flex">
        <SidebarProvider>
          {!isAuthPage && <AppSidebar />} {/* Hide Sidebar on login */}
          <div className="flex flex-col w-full transition-all">
            {!isAuthPage && <Navbar />} {/* Hide Navbar on login */}
            <main className="p-4">{children}</main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
