"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun, Contrast, Palette } from "lucide-react";

export function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-32 animate-pulse bg-[var(--color-muted)] rounded-md" />;
  }

  const icons: Record<string, React.ReactNode> = {
    light: <Sun className="h-4 w-4" />,
    dark: <Moon className="h-4 w-4" />,
    solarized: <Palette className="h-4 w-4" />,
    "high-contrast": <Contrast className="h-4 w-4" />,
  };

  return (
    <div className="relative group">
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="h-9 w-full appearance-none rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1 pr-8 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-ring)] disabled:cursor-not-allowed disabled:opacity-50 capitalize"
      >
        {themes.map((t) => (
          <option key={t} value={t}>
            {t.replace("-", " ")}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-[var(--color-muted-fg)]">
        {icons[theme as string] || <Monitor className="h-4 w-4" />}
      </div>
    </div>
  );
}
