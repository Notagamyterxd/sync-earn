import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMe, getMyActivity, requestWithdrawal } from "@/lib/app.functions";

export const Route = createFileRoute("/_authenticated/withdraw")({
  head: () => ({
    meta: [
      { title: "Withdraw — SyncEarn" },
      { name: "description", content: "Cash out your Robux balance via Robux, Litecoin or Solana." },
      { property: "og:title", content: "Withdraw — SyncEarn" },
      { property: "og:description", content: "Cash out your Robux balance via Robux, Litecoin or Solana." },
    ],
  }),
  component: WithdrawPage,
});

const METHODS = [
  { id: "robux", label: "Robux", hint: "Roblox username or gamepass link" },
  { id: "ltc", label: "Litecoin (LTC)", hint: "Your LTC wallet address" },
  { id: "sol", label: "Solana (SOL)", hint: "Your SOL wallet address" },
] as const;

const STATUS_TONE = {
  pending: "secondary",
  approved: "default",
  denied: "destructive",
} as const;

function WithdrawPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["me"], queryFn: () => getMe() });
  const { data: activity } = useQuery({ queryKey: ["activity"], queryFn: () => getMyActivity() });
  const [method, setMethod] = useState<string>("robux");
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const current = METHODS.find((m) => m.id === method)!;

  const submit = useMutation({
    mutationFn: () =>
      requestWithdrawal({ data: { method, amount: Number(amount), destination } }),
    onSuccess: (res) => {
      if (res.ok) {
        toast.success(res.message);
        setAmount("");
        setDestination("");
        qc.invalidateQueries();
      } else toast.error(res.message);
    },
    onError: () => toast.error("Could not submit your request."),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Withdraw</h1>
        <p className="text-sm text-muted-foreground">
          Balance: {Number(data?.profile?.robux ?? 0).toFixed(2)} R$ — all payouts are reviewed
          manually by an admin.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" />
        <p>All other cryptocurrencies are handled via Discord — open a support ticket and our team will arrange it.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glow-card space-y-4 rounded-xl p-5">
          <div className="grid grid-cols-3 gap-2">
            {METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
                  method === m.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount (Robux)</Label>
            <Input
              id="amount"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="destination">{current.hint}</Label>
            <Input
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
          <Button className="w-full" onClick={() => submit.mutate()} disabled={submit.isPending}>
            Request withdrawal
          </Button>
        </div>

        <div className="glow-card rounded-xl p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold">Transaction history</h2>
          <div className="mt-3 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(activity?.withdrawals ?? []).map((w) => (
                  <TableRow key={w.id}>
                    <TableCell>{Number(w.amount).toFixed(2)} R$</TableCell>
                    <TableCell className="uppercase">{w.method}</TableCell>
                    <TableCell>{new Date(w.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={STATUS_TONE[w.status]}>{w.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {!activity?.withdrawals.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-sm text-muted-foreground">
                      No withdrawals yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
