"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

function FontSizeApplier() {
  useEffect(() => {
    const size = localStorage.getItem("edv_fontSize");
    if (size) document.documentElement.style.fontSize = `${size}px`;
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <FontSizeApplier />
        {children}
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      </ThemeProvider>
    </SessionProvider>
  );
}
