import { createFileRoute, Link } from "@tanstack/react-router";
import { Coins, Gem, Gift, ShieldCheck, Users, Video } from "lucide-react";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SyncEarn — Earn Free Robux with Offers & Videos" },
      {
        name: "description",
        content:
          "Complete offerwalls, open mystery boxes, refer friends and post videos to earn Robux. Fast manual Robux payouts.",
      },
      { property: "og:title", content: "SyncEarn — Earn Free Robux with Offers & Videos" },
      {
        property: "og:description",
        content:
          "Complete offerwalls, open mystery boxes, refer friends and post videos to earn Robux on SyncEarn.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Coins, title: "Offerwalls", text: "Torox, Bitcotask and CPX Research offers credit Robux instantly." },
  { icon: Gem, title: "Diamonds", text: "Earn 100 Robux in 24h and collect a free Diamond." },
  { icon: Gift, title: "Mystery Boxes", text: "Spend Diamonds on weighted boxes worth 1–10 Robux." },
  { icon: Video, title: "Creator Center", text: "Link your videos and earn per 100 views once approved." },
  { icon: Users, title: "3-Tier Referrals", text: "Take 5% / 2% / 1% of everything your network earns." },
  { icon: ShieldCheck, title: "Manual Payouts", text: "Cash out in Robux, reviewed by a real admin." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Logo size={34} />
        <div className="flex gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/auth" search={{ mode: "register" }}>
              Sign up
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24">
        <section className="py-14 text-center sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Coins className="size-3.5" /> Instant offerwall crediting
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-6xl">
            Earn <span className="text-gradient-money">Robux</span> for the things
            <br className="hidden sm:block" /> you already do online
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
            SyncEarn pays you for completing offers, watching your videos grow and inviting
            friends. Cash out in Robux.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/auth" search={{ mode: "register" }}>
                Start earning free
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth">I already have an account</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="glow-card rounded-2xl p-5">
              <f.icon className="size-6 text-primary" />
              <h2 className="mt-3 text-lg font-semibold">{f.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SyncEarn. Not affiliated with Roblox Corporation.
      </footer>
    </div>
  );
}
