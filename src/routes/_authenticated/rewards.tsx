import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Gem, Gift } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getMe, getMyActivity, openMysteryBox } from "@/lib/app.functions";

export const Route = createFileRoute("/_authenticated/rewards")({
  head: () => ({
    meta: [
      { title: "Mystery Boxes — SyncEarn" },
      { name: "description", content: "Spend Diamonds on weighted mystery boxes and win up to 10 Robux." },
      { property: "og:title", content: "Mystery Boxes — SyncEarn" },
      { property: "og:description", content: "Spend Diamonds on weighted mystery boxes and win up to 10 Robux." },
    ],
  }),
  component: RewardsPage,
});

function RewardsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["me"], queryFn: () => getMe() });
  const { data: activity } = useQuery({ queryKey: ["activity"], queryFn: () => getMyActivity() });
  const [spinning, setSpinning] = useState(false);
  const [won, setWon] = useState<number | null>(null);

  const open = useMutation({
    mutationFn: () => openMysteryBox(),
    onMutate: () => {
      setWon(null);
      setSpinning(true);
    },
    onSuccess: async (res) => {
      await new Promise((r) => setTimeout(r, 900));
      setSpinning(false);
      if (res.ok) {
        setWon(res.reward);
        toast.success(res.message);
        qc.invalidateQueries();
      } else toast.error(res.message);
    },
    onError: () => {
      setSpinning(false);
      toast.error("Could not open the box.");
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mystery Boxes</h1>
        <p className="text-sm text-muted-foreground">
          Every 100 Robux you earn in 24 hours gives you a Diamond. Spend Diamonds here.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glow-card flex flex-col items-center rounded-2xl p-8 text-center">
          <div
            className={`flex size-32 items-center justify-center rounded-3xl bg-primary/10 ring-1 ring-primary/30 ${
              spinning ? "animate-bounce" : ""
            }`}
          >
            <Gift className="size-14 text-primary" />
          </div>
          <p className="mt-5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Gem className="size-4 text-diamond" /> You have {data?.profile?.diamonds ?? 0} Diamonds
          </p>
          {won !== null && (
            <p className="mt-3 text-xl font-bold text-gradient-money">You won {won} Robux!</p>
          )}
          <Button
            className="mt-5"
            size="lg"
            onClick={() => open.mutate()}
            disabled={open.isPending || spinning}
          >
            {spinning ? "Opening…" : "Open box (1 Diamond)"}
          </Button>
        </div>

        <div className="glow-card rounded-2xl p-5">
          <h2 className="text-lg font-semibold">Your last openings</h2>
          <div className="mt-3 divide-y divide-border/60">
            {(activity?.boxes ?? []).map((b) => (
              <div key={b.id} className="flex justify-between py-2.5 text-sm">
                <span className="text-muted-foreground">
                  {new Date(b.created_at).toLocaleString()}
                </span>
                <span className="font-medium text-primary">+{Number(b.reward)} R$</span>
              </div>
            ))}
            {!activity?.boxes.length && (
              <p className="py-6 text-sm text-muted-foreground">No boxes opened yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
