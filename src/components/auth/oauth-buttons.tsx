"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/src/components/ui/button";

type OAuthAvailability = {
  google: boolean;
  discord: boolean;
  facebook: boolean;
};

const PROVIDERS: { id: "google" | "discord" | "facebook"; label: string }[] = [
  { id: "google", label: "Google" },
  { id: "discord", label: "Discord" },
  { id: "facebook", label: "Facebook" },
];

export function OAuthButtons({ oauth }: { oauth: OAuthAvailability }) {
  const available = PROVIDERS.filter((p) => oauth[p.id]);

  if (available.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-xs text-muted">
        <div className="h-px flex-1 bg-foreground/10" />
        hoặc tiếp tục với
        <div className="h-px flex-1 bg-foreground/10" />
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${available.length}, minmax(0, 1fr))` }}>
        {available.map((provider) => (
          <Button
            key={provider.id}
            type="button"
            variant="glass"
            onClick={() => signIn(provider.id, { redirectTo: "/dashboard" })}
          >
            {provider.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
