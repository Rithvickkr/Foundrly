"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { Sidebar } from "lucide-react";
import { Moon, Sun } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const router = useRouter();
  const { toggleSidebar } = useSidebar();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ?? null);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    document.body.classList.toggle("dark", !isDarkTheme);
  };

  return (
    <nav className="flex items-center justify-between p-2 bg-black text-white h-12">
      <div className="flex items-center space-x-2">
        <button onClick={toggleSidebar} className="hover:underline">
          <Sidebar className="h-5 w-5" />
        </button>
        <Button onClick={toggleTheme} className="text-sm hover:underline">
          {isDarkTheme ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        {user ? (
          <>
            <Button onClick={handleLogout} className="text-red-500 text-sm">
              Log out
            </Button>
          </>
        ) : (
          <Button onClick={() => router.push("/login")} className="text-sm hover:underline">
            Login
          </Button>
        )}
      </div>
    </nav>
  );
}
