import { ReactNode } from "react";
import { ClientWrapper } from "./ClientWrapper"; // Relative import
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({ children }: { children: ReactNode }) {
  console.log('layout.tsx: ClientWrapper imported:', ClientWrapper);
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-100 dark:bg-black flex">
        <Toaster/>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}