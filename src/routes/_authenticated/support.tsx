import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { LifeBuoy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createTicket, getMyTickets, replyTicket } from "@/lib/app.functions";

export const Route = createFileRoute("/_authenticated/support")({
  head: () => ({
    meta: [
      { title: "Support — SyncEarn" },
      { name: "description", content: "Open a support ticket for account, payout or offerwall issues on SyncEarn." },
      { property: "og:title", content: "Support — SyncEarn" },
      { property: "og:description", content: "Get help with your SyncEarn account, withdrawals and offers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["tickets"], queryFn: () => getMyTickets() });
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [replies, setReplies] = useState<Record<string, string>>({});

  const open = useMutation({
    mutationFn: () => createTicket({ data: { subject, body } }),
    onSuccess: (res) => {
      if (!res.ok) { toast.error(res.message); return; }
      toast.success(res.message);
      setSubject("");
      setBody("");
      qc.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  const reply = useMutation({
    mutationFn: (v: { ticketId: string; body: string }) => replyTicket({ data: v }),
    onSuccess: (res, v) => {
      if (!res.ok) { toast.error(res.message); return; }
      toast.success(res.message);
      setReplies((r) => ({ ...r, [v.ticketId]: "" }));
      qc.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  const tickets = data?.tickets ?? [];
  const messages = data?.messages ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <LifeBuoy className="size-6 text-primary" /> Support
        </h1>
        <p className="text-sm text-muted-foreground">
          Payments, bans, offerwall credits or other crypto withdrawals — open a ticket and our team replies here.
        </p>
      </div>

      <Card className="glow-card">
        <CardHeader>
          <CardTitle>New ticket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Textarea
            placeholder="Describe your issue"
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <Button onClick={() => open.mutate()} disabled={open.isPending}>
            {open.isPending ? "Sending…" : "Open ticket"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {tickets.length === 0 && <p className="text-sm text-muted-foreground">No tickets yet.</p>}
        {tickets.map((t) => (
          <Card key={t.id}>
            <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
              <CardTitle className="text-base">{t.subject}</CardTitle>
              <Badge variant={t.status === "open" ? "default" : "secondary"}>{t.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {messages
                  .filter((m) => m.ticket_id === t.id)
                  .map((m) => (
                    <div
                      key={m.id}
                      className={`rounded-lg border p-3 text-sm ${
                        m.is_admin ? "border-primary/40 bg-primary/5" : "border-border/60"
                      }`}
                    >
                      <div className="mb-1 text-xs text-muted-foreground">
                        {m.is_admin ? "SyncEarn Team" : "You"} · {new Date(m.created_at).toLocaleString()}
                      </div>
                      {m.body}
                    </div>
                  ))}
              </div>
              {t.status === "open" && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Reply…"
                    value={replies[t.id] ?? ""}
                    onChange={(e) => setReplies((r) => ({ ...r, [t.id]: e.target.value }))}
                  />
                  <Button
                    onClick={() => reply.mutate({ ticketId: t.id, body: replies[t.id] ?? "" })}
                    disabled={reply.isPending}
                  >
                    Send
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
