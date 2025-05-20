"use client";

import { useState, useEffect } from "react";
import { themeManager } from "@/lib/theme/ThemeManager";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { Sidebar, Sun, Moon, Sparkles } from "lucide-react";
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
    <nav className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-900 dark:to-indigo-950 text-white h-14 shadow-lg transition-colors duration-300">
      <div className="flex items-center space-x-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={toggleSidebar}
            className="p-2 rounded-full text-white hover:bg-white/10 transition-all duration-200 ease-in-out transform hover:scale-110"
            aria-label="Toggle sidebar"
          >
            <Sidebar className="h-5 w-5" />
          </Button>
          {/* <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-white" />
            <span className="font-bold text-lg hidden sm:inline">FounderGPT</span>
          </div> */}
        </div>
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
            className="p-2 rounded-full text-white hover:bg-white/10 transition-all duration-200 ease-in-out"
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
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </motion.div>
            </AnimatePresence>
          </Button>
        </motion.div>
        {/* {user ? (
          <Button
            variant="outline"
            onClick={handleLogout}
            className="px-4 py-1 h-9 rounded-full font-medium border border-white/30 text-white hover:bg-white/10 transition-all duration-200 ease-in-out"
          >
            Log out
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => router.push("/login")}
            className="px-4 py-1 h-9 rounded-full font-medium border border-white/30 text-white hover:bg-white/10 transition-all duration-200 ease-in-out"
          >
            Login
          </Button>
        )} */}
      </div>
    </nav>
  );
}