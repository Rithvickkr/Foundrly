// app/lib/theme/ThemeManager.ts
"use client";

type Theme = "light" | "dark";

class ThemeManager {
  private theme: Theme = "light";
  private listeners: Array<(theme: Theme) => void> = [];

  constructor() {
    // Initialize theme on client-side
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") || 
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      console.log('ThemeManager: Initializing with theme:', savedTheme);
      this.setTheme(savedTheme as Theme);
    }
  }

  getTheme(): Theme {
    return this.theme;
  }

  setTheme(theme: Theme) {
    this.theme = theme;
    if (typeof window !== "undefined") {
      const html = document.documentElement;
      html.classList.remove("light", "dark");
      if (theme === "dark") {
        html.classList.add("dark");
        console.log('ThemeManager: Added dark class to <html>');
      } else {
        console.log('ThemeManager: Set light theme, no class added');
      }
      localStorage.setItem("theme", theme);
      console.log('ThemeManager: Theme set:', theme, 'HTML classes:', html.className);
      this.dispatchThemeChange(theme);
    }
  }

  toggleTheme() {
    const nextTheme = this.theme === "light" ? "dark" : "light";
    console.log('ThemeManager: Toggling to:', nextTheme);
    this.setTheme(nextTheme);
  }

  // Subscribe to theme changes
  subscribe(listener: (theme: Theme) => void) {
    this.listeners.push(listener);
    listener(this.theme); // Call immediately with current theme
    console.log('ThemeManager: Subscribed listener, current theme:', this.theme);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
      console.log('ThemeManager: Unsubscribed listener');
    };
  }

  private dispatchThemeChange(theme: Theme) {
    console.log('ThemeManager: Dispatching theme change:', theme);
    this.listeners.forEach(listener => listener(theme));
  }
}

export const themeManager = new ThemeManager();