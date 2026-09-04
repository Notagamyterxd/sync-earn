import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, ExternalLink, ShieldCheck, Timer, Coins } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCpxWall } from "@/lib/cpx.functions";

export const Route = createFileRoute("/_authenticated/surveys")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Paid Surveys — Earn Robux — SyncEarn" },
      {
        name: "description",
        content:
          "Answer CPX Research paid surveys and get Robux credited to your SyncEarn balance automatically.",
      },
      { property: "og:title", content: "Paid Surveys — Earn Robux — SyncEarn" },
      {
        property: "og:description",
        content: "Answer CPX Research paid surveys and get Robux credited automatically.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SurveysPage,
});

const PERKS = [
  { icon: Coins, title: "Instant Robux", text: "Rewards land the second CPX confirms your survey." },
  { icon: Timer, title: "2–20 minutes", text: "Short profiling surveys up to longer high payers." },
  { icon: ShieldCheck, title: "Verified payouts", text: "Every completion is signature-checked." },
];

function SurveysPage() {
  const { data, isLoading } = useQuery({ queryKey: ["cpx-wall"], queryFn: () => getCpxWall() });

  return (
    <div className="space-y-6">
      <div className="glow-card rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/15 via-background to-background p-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-400/40 bg-lime-400/10 px-3 py-1 text-xs font-semibold text-lime-300">
          <ClipboardList className="size-3.5" /> CPX Research
        </span>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
          Paid <span className="text-gradient-money">Surveys</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Share your opinion, get paid in Robux. Surveys are matched to your profile and credited to
          your account automatically once CPX verifies the completion.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {PERKS.map((p) => (
          <div key={p.title} className="glow-card rounded-xl border border-primary/15 p-4">
            <p.icon className="size-5 text-primary" />
            <h2 className="mt-2 text-sm font-semibold">{p.title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{p.text}</p>
          </div>
        ))}
      </div>

      <div className="glow-card overflow-hidden rounded-xl border border-primary/20">
        <div className="flex items-center justify-between gap-3 border-b border-primary/20 bg-primary/5 px-4 py-3">
          <h2 className="font-semibold">Survey Wall</h2>
          {data?.url && (
            <Button asChild size="sm" variant="outline">
              <a href={data.url} target="_blank" rel="noreferrer noopener">
                Open in new tab <ExternalLink className="ml-1.5 size-3.5" />
              </a>
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex h-[620px] items-center justify-center text-sm text-muted-foreground">
            Loading your surveys…
          </div>
        ) : data?.url ? (
          <iframe
            src={data.url}
            title="CPX Research paid surveys"
            className="h-[620px] w-full border-0 bg-white"
            allow="clipboard-write; fullscreen"
          />
        ) : (
          <div className="flex h-[320px] items-center justify-center p-6 text-center text-sm text-muted-foreground">
            Surveys are temporarily unavailable. Please try again shortly.
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Do not use a VPN or provide dishonest answers — CPX reverses those completions and the Robux
        is removed from your balance.
      </p>
    </div>
  );
}
