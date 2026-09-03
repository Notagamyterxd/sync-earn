import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Coins, Gem, Gift, TicketPercent, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMe, getMyActivity, redeemPromo } from "@/lib/app.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SyncEarn" },
      { name: "description", content: "Track your Robux, Diamonds, referrals and recent earnings." },
      { property: "og:title", content: "Dashboard — SyncEarn" },
      { property: "og:description", content: "Track your Robux, Diamonds, referrals and recent earnings." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["me"], queryFn: () => getMe() });
  const { data: activity } = useQuery({ queryKey: ["activity"], queryFn: () => getMyActivity() });
  const [code, setCode] = useState("");
  const profile = data?.profile;

  const promo = useMutation({
    mutationFn: (c: string) => redeemPromo({ data: { code: c } }),
    onSuccess: (res) => {
      if (res.ok) {
        toast.success(res.message);
        setCode("");
        qc.invalidateQueries();
      } else toast.error(res.message);
    },
    onError: () => toast.error("Could not redeem that code."),
  });

  const cards = [
    { label: "Robux balance", value: Number(profile?.robux ?? 0).toFixed(2), icon: Coins, tone: "text-primary" },
    { label: "Diamonds", value: profile?.diamonds ?? 0, icon: Gem, tone: "text-diamond" },
    { label: "Total earned", value: Number(profile?.total_earned ?? 0).toFixed(2), icon: TrendingUp, tone: "text-accent" },
    { label: "Referrals", value: profile?.referral_count ?? 0, icon: Users, tone: "text-foreground" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, <span className="text-gradient-money">{profile?.username ?? "earner"}</span>
        </h1>
        <p className="text-sm text-muted-foreground">Here's how your account is doing.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="glow-card rounded-xl p-4">
            <c.icon className={`size-5 ${c.tone}`} />
            <p className="mt-3 text-2xl font-bold">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glow-card rounded-xl p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold">Recent activity</h2>
          <div className="mt-3 divide-y divide-border/60">
            {(activity?.transactions ?? []).slice(0, 10).map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium">{t.description ?? t.kind}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(t.created_at).toLocaleString()}
                  </p>
                </div>
                <span className={Number(t.amount) >= 0 ? "text-primary" : "text-destructive"}>
                  {Number(t.amount) >= 0 ? "+" : ""}
                  {Number(t.amount).toFixed(2)} {t.currency === "diamond" ? "💎" : "R$"}
                </span>
              </div>
            ))}
            {!activity?.transactions.length && (
              <p className="py-6 text-sm text-muted-foreground">
                No activity yet — start with an offerwall.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glow-card rounded-xl p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <TicketPercent className="size-5 text-accent" /> Promo code
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">Redeem a code for Robux or Diamonds.</p>
            <div className="mt-3 flex gap-2">
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="SYNC100" />
              <Button onClick={() => promo.mutate(code)} disabled={promo.isPending}>
                Redeem
              </Button>
            </div>
          </div>
          <div className="glow-card rounded-xl p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Gift className="size-5 text-primary" /> Quick links
            </h2>
            <div className="mt-3 grid gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/earn">Complete offers</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/rewards">Open a mystery box</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/withdraw">Withdraw earnings</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
