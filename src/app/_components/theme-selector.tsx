"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

/**
 * Theme selector component that allows users to switch between light, dark, and system themes.
 * Handles hydration mismatch by only rendering after client-side mount.
 */
export function ThemeSelector() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, themes } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  // This pattern is necessary to avoid hydration mismatches with next-themes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Required for hydration safety
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder to avoid layout shift
    return (
      <div className="h-9 w-32 rounded-md border border-input bg-background" />
    );
  }

  const themeConfig = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ] as const;

  return (
    <ButtonGroup orientation="horizontal">
      {themeConfig
        .filter((config) => themes.includes(config.value))
        .map(({ value, icon: Icon, label }) => (
          <Button
            key={value}
            variant={theme === value ? "secondary" : "outline"}
            size="default"
            onClick={() => setTheme(value)}
            aria-label={`Switch to ${label.toLowerCase()} theme`}
            aria-pressed={theme === value}
          >
            <Icon className="h-4 w-4" />
            <span className="sr-only">{label}</span>
          </Button>
        ))}
    </ButtonGroup>
  );
}
