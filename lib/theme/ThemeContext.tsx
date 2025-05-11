"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "light" | "dark" | "black";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Initialize theme on client-side
    const savedTheme = localStorage.getItem("theme") || 
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(savedTheme as Theme);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Update <html> classes and persist theme
    const html = document.documentElement;
    html.classList.remove("light", "dark", "black");
    if (theme === "dark") html.classList.add("dark");
    else if (theme === "black") html.classList.add("black");
    localStorage.setItem("theme", theme);
  }, [theme, isMounted]);

  if (!isMounted) {
    // Fallback UI during SSR/hydration
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}