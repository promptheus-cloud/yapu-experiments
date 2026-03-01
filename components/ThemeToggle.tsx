"use client";

import {useTheme} from "next-themes";
import {Sun, Moon} from "lucide-react";
import {useEffect, useState} from "react";

export function ThemeToggle({className = ""}: {className?: string}) {
  const {theme, setTheme, resolvedTheme} = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className={`w-8 h-8 ${className}`} />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`p-1.5 rounded transition-colors hover:bg-white/10 ${className}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-current" />
      ) : (
        <Moon className="w-4 h-4 text-current" />
      )}
    </button>
  );
}
