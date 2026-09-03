import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Copy, Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMe } from "@/lib/app.functions";

export const Route = createFileRoute("/_authenticated/referrals")({
  head: () => ({
    meta: [
      { title: "Referrals — SyncEarn" },
      { name: "description", content: "Earn 5%, 2% and 1% commission across three referral tiers." },
      { property: "og:title", content: "Referrals — SyncEarn" },
      { property: "og:description", content: "Earn 5%, 2% and 1% commission across three referral tiers." },
    ],
  }),
  component: ReferralsPage,
});

const TIERS = [
  { tier: "Tier 1", rate: "5%", text: "People who join with your link." },
  { tier: "Tier 2", rate: "2%", text: "People their referrals bring in." },
  { tier: "Tier 3", rate: "1%", text: "One more level down the chain." },
];

function ReferralsPage() {
  const { data } = useQuery({ queryKey: ["me"], queryFn: () => getMe() });
  const code = data?.profile?.referral_code ?? "";
  const link =
    typeof window !== "undefined" ? `${window.location.origin}/auth?mode=register&r=${code}` : "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Referrals</h1>
        <p className="text-sm text-muted-foreground">
          Commission is credited automatically every time your network earns.
        </p>
      </div>

      <div className="glow-card rounded-xl p-5">
        <h2 className="text-lg font-semibold">Your referral link</h2>
        <div className="mt-3 flex gap-2">
          <Input readOnly value={link} />
          <Button
            onClick={() => {
              navigator.clipboard.writeText(link);
              toast.success("Link copied!");
            }}
          >
            <Copy className="size-4" />
          </Button>
        </div>
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="size-4 text-primary" />
          {data?.profile?.referral_count ?? 0} direct referrals
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {TIERS.map((t) => (
          <div key={t.tier} className="glow-card rounded-xl p-5">
            <p className="text-3xl font-bold text-gradient-money">{t.rate}</p>
            <p className="mt-2 font-semibold">{t.tier}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
