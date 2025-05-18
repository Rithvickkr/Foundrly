"use client";

import { useState, useEffect } from "react";
import { themeManager } from "@/lib/theme/ThemeManager";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { Sidebar, Sun, Moon } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const router = useRouter();
  const { toggleSidebar } = useSidebar();

  useEffect(() => {
    // Subscribe to theme changes
    const unsubscribe = themeManager.subscribe(newTheme => {
      console.log('Navbar: Theme updated:', newTheme);
      setTheme(newTheme);
    });

    // Fetch user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ?? null);
    };
    getUser();

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  const handleThemeChange = () => {
    console.log('Navbar: Triggering theme toggle, current theme:', theme);
    themeManager.toggleTheme();
  };

  return (
    <nav className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-teal-950 text-gray-900 dark:text-gray-100 h-14 shadow-lg transition-colors duration-300">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          onClick={toggleSidebar}
          className="p-2 rounded-full text-blue-600 dark:text-teal-400 hover:bg-blue-100 dark:hover:bg-teal-900/50 hover:text-blue-800 dark:hover:text-teal-200 transition-all duration-200 ease-in-out transform hover:scale-110"
          aria-label="Toggle sidebar"
        >
          <Sidebar className="h-6 w-6" />
        </Button>
      </div>
      <div className="flex items-center space-x-3">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Button
            variant="ghost"
            onClick={handleThemeChange}
            className="p-2 rounded-full text-blue-600 dark:text-teal-400 hover:bg-blue-100 dark:hover:bg-teal-900/50 hover:text-blue-800 dark:hover:text-teal-200 transition-all duration-200 ease-in-out"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {theme === "light" ? (
                  <Sun className="h-6 w-6" />
                ) : (
                  <Moon className="h-6 w-6" />
                )}
              </motion.div>
            </AnimatePresence>
          </Button>
        </motion.div>
        {user ? (
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="px-4 py-2 rounded-md text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 ease-in-out"
          >
            Log out
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={() => router.push("/login")}
            className="px-4 py-2 rounded-md text-blue-600 dark:text-teal-400 hover:bg-blue-100 dark:hover:bg-teal-900/50 hover:text-blue-800 dark:hover:text-teal-200 transition-all duration-200 ease-in-out"
          >
            Login
          </Button>
        )}
      </div>
    </nav>
  );
}