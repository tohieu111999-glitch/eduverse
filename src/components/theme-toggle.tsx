"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Theme is unknown on the server, so the icon must stay neutral until
    // after hydration to avoid a light/dark mismatch flash.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-10 w-10 rounded-full glass" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Chuyển giao diện sáng/tối"
      className="flex h-10 w-10 items-center justify-center rounded-full glass transition hover:scale-105"
    >
      {isDark ? <Sun className="h-5 w-5 text-cyber-blue" /> : <Moon className="h-5 w-5 text-primary" />}
    </button>
  );
}
