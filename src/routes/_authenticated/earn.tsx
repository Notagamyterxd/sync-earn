import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Coins, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCpxWall } from "@/lib/cpx.functions";
import { getMe } from "@/lib/app.functions";

export const Route = createFileRoute("/_authenticated/earn")({
  head: () => ({
    meta: [
      { title: "Earn Robux — Offerwalls — SyncEarn" },
      { name: "description", content: "Complete Monlix, Bitcotask and CPX Research offers to earn Robux instantly." },
      { property: "og:title", content: "Earn Robux — Offerwalls — SyncEarn" },
      { property: "og:description", content: "Complete Monlix, Bitcotask and CPX Research offers to earn Robux instantly." },
    ],
  }),
  component: EarnPage,
});

const WALLS = [
  {
    id: "monlix",
    name: "Monlix",
    blurb: "High-paying app installs, surveys and sign-up offers.",
  },
  {
    id: "bitcotask",
    name: "Bitcotask",
    blurb: "Micro tasks and quick offers that credit within minutes.",
  },
  {
    id: "cpx",
    name: "CPX Research",
    blurb: "Paid surveys with the best rates on the platform.",
  },
] as const;

function EarnPage() {
  const { data } = useQuery({ queryKey: ["me"], queryFn: () => getMe() });
  const { data: cpx } = useQuery({ queryKey: ["cpx-wall"], queryFn: () => getCpxWall(), staleTime: 60_000 });
  const [active, setActive] = useState<string | null>(null);
  const wall = WALLS.find((w) => w.id === active);

  const wallUrl = (id: string) => {
    if (id === "cpx") return cpx?.url ?? "";
    return "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Offerwalls</h1>
        <p className="text-sm text-muted-foreground">
          Robux is credited automatically the moment a provider confirms your completion.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {WALLS.map((w) => (
          <button
            key={w.id}
            onClick={() => setActive(w.id)}
            className={`glow-card rounded-xl p-5 text-left transition ${
              active === w.id ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/40"
            }`}
          >
            <Coins className="size-5 text-primary" />
            <h2 className="mt-3 font-semibold">{w.name}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{w.blurb}</p>
          </button>
        ))}
      </div>

      {wall && (
        <div className="glow-card overflow-hidden rounded-xl">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <h2 className="font-semibold">{wall.name}</h2>
            {wall.id === "cpx" && wallUrl("cpx") && (
              <Button asChild size="sm">
                <a href={wallUrl("cpx")} target="_blank" rel="noreferrer noopener">
                  Start Surveys <ExternalLink className="ml-1.5 size-3.5" />
                </a>
              </Button>
            )}
          </div>
          <div className="p-4">
            {wall.id === "cpx" ? (
              <div className="flex h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-primary/30 bg-primary/5 p-6 text-center">
                <p className="font-medium text-primary">{wall.name} is ready</p>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Click the button above to open the CPX Research survey wall in a new tab. Your
                  completions are tracked to your account and Robux is credited automatically.
                </p>
              </div>
            ) : (
              <div className="flex h-[520px] items-center justify-center rounded-lg border border-dashed border-border bg-secondary/40 p-6 text-center">
                <div>
                  <p className="font-medium">{wall.name} is not configured yet</p>
                  <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    Add your publisher ID for {wall.name} and this slot will load the live wall.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
