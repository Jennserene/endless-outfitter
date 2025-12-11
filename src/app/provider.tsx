"use client";

import { ThemeProvider } from "next-themes";

/**
 * Global providers wrapper component.
 *
 * This Client Component wraps all global context providers for the application.
 * Add future providers (theme, app state, etc.) here as needed.
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
