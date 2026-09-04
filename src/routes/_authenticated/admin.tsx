import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Shield, Users as UsersIcon, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  adminAdjustBalance,
  adminBanIp,
  adminModerateVideo,
  adminOverview,
  adminProcessWithdrawal,
  adminReplyTicket,
  adminSavePromo,
  adminSetStatus,
  adminTickets,
  adminUsers,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — SyncEarn" },
      { name: "description", content: "SyncEarn staff console: users, IP checks, withdrawals, videos and promos." },
      { property: "og:title", content: "Admin Panel — SyncEarn" },
      { property: "og:description", content: "Manage SyncEarn users, payouts and content." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const qc = useQueryClient();
  const overview = useQuery({ queryKey: ["admin", "overview"], queryFn: () => adminOverview() });
  const [search, setSearch] = useState("");
  const users = useQuery({
    queryKey: ["admin", "users", search],
    queryFn: () => adminUsers({ data: { search } }),
  });
  const tickets = useQuery({ queryKey: ["admin", "tickets"], queryFn: () => adminTickets() });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin"] });
  const done = (res: { ok: boolean; message: string }) => {
    res.ok ? toast.success(res.message) : toast.error(res.message);
    invalidate();
  };

  const adjust = useMutation({
    mutationFn: (v: { userId: string; amount: number; currency: "robux" | "diamond" }) =>
      adminAdjustBalance({ data: v }),
    onSuccess: done,
  });
  const setStatus = useMutation({
    mutationFn: (v: { userId: string; status: "active" | "banned"; banIp?: boolean }) =>
      adminSetStatus({ data: v }),
    onSuccess: done,
  });
  const banIp = useMutation({
    mutationFn: (v: { ip: string }) => adminBanIp({ data: v }),
    onSuccess: done,
  });
  const processWd = useMutation({
    mutationFn: (v: { id: string; action: "approve" | "deny"; note?: string }) =>
      adminProcessWithdrawal({ data: v }),
    onSuccess: done,
  });
  const moderate = useMutation({
    mutationFn: (v: { id: string; status?: "approved" | "rejected"; views?: number }) =>
      adminModerateVideo({ data: v }),
    onSuccess: done,
  });
  const savePromo = useMutation({
    mutationFn: (v: {
      code: string;
      reward_type: "robux" | "diamond";
      amount: number;
      max_uses: number;
      active: boolean;
    }) => adminSavePromo({ data: v }),
    onSuccess: done,
  });
  const replyTicket = useMutation({
    mutationFn: (v: { ticketId: string; body: string; status?: "open" | "closed" }) =>
      adminReplyTicket({ data: v }),
    onSuccess: done,
  });

  const stats = overview.data?.stats;
  const userRows = users.data?.users ?? [];

  const [promo, setPromo] = useState({ code: "", amount: 10, max_uses: 100 });
  const [ticketReply, setTicketReply] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <Shield className="size-6 text-primary" /> Admin Panel
      </h1>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Users", stats?.totalUsers ?? 0],
          ["Robux earned", Math.round(stats?.robuxEarned ?? 0)],
          ["Robux paid out", Math.round(stats?.robuxPaidOut ?? 0)],
          ["Pending payouts", stats?.pendingWithdrawals ?? 0],
        ].map(([label, value]) => (
          <Card key={String(label)} className="glow-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-bold text-primary">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="users">
        <TabsList className="flex-wrap">
          <TabsTrigger value="users">User List</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="promos">Promo Codes</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-3">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <UsersIcon className="size-4 text-primary" /> All SyncEarn users
              </CardTitle>
              <Input
                className="max-w-56"
                placeholder="Search username or IP"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <p className="mb-3 text-xs text-muted-foreground">
                Accounts sharing a signup IP are flagged — likely alts, VPN or proxy abuse.
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Robux</TableHead>
                    <TableHead>Diamonds</TableHead>
                    <TableHead>Earned</TableHead>
                    <TableHead>Refs</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userRows.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.username}</TableCell>
                      <TableCell className="font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          {u.signup_ip ?? "—"}
                          {u.ip_shared_count > 1 && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="size-3" />
                              {u.ip_shared_count} alts
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{Number(u.robux).toFixed(2)}</TableCell>
                      <TableCell>{u.diamonds}</TableCell>
                      <TableCell>{Number(u.total_earned).toFixed(2)}</TableCell>
                      <TableCell>{u.referral_count}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.status === "banned" ? "destructive" : "secondary"}>{u.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const raw = window.prompt("Robux adjustment (use - to remove)", "10");
                              if (raw) adjust.mutate({ userId: u.id, amount: Number(raw), currency: "robux" });
                            }}
                          >
                            ±R$
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const raw = window.prompt("Diamond adjustment", "1");
                              if (raw) adjust.mutate({ userId: u.id, amount: Number(raw), currency: "diamond" });
                            }}
                          >
                            ±💎
                          </Button>
                          {u.status === "banned" ? (
                            <Button size="sm" onClick={() => setStatus.mutate({ userId: u.id, status: "active" })}>
                              Unban
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setStatus.mutate({ userId: u.id, status: "banned", banIp: false })}
                            >
                              Ban
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={!u.signup_ip}
                            onClick={() => u.signup_ip && banIp.mutate({ ip: u.signup_ip })}
                          >
                            Ban IP
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card>
            <CardContent className="overflow-x-auto p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Method</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(overview.data?.withdrawals ?? []).map((w) => (
                    <TableRow key={w.id}>
                      <TableCell className="uppercase">{w.method}</TableCell>
                      <TableCell>{Number(w.amount).toFixed(2)}</TableCell>
                      <TableCell className="max-w-40 truncate font-mono text-xs">{w.destination}</TableCell>
                      <TableCell>
                        <Badge variant={w.status === "pending" ? "secondary" : "default"}>{w.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {w.status === "pending" && (
                          <div className="flex justify-end gap-1">
                            <Button size="sm" onClick={() => processWd.mutate({ id: w.id, action: "approve" })}>
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                processWd.mutate({
                                  id: w.id,
                                  action: "deny",
                                  note: window.prompt("Reason") ?? undefined,
                                })
                              }
                            >
                              Deny
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos">
          <Card>
            <CardContent className="overflow-x-auto p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(overview.data?.videos ?? []).map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>{v.title}</TableCell>
                      <TableCell className="max-w-40 truncate">
                        <a href={v.url} target="_blank" rel="noreferrer" className="text-primary underline">
                          open
                        </a>
                      </TableCell>
                      <TableCell>{v.views}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{v.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const raw = window.prompt("Set view count", String(v.views));
                              if (raw) moderate.mutate({ id: v.id, views: Number(raw), status: "approved" });
                            }}
                          >
                            Set views
                          </Button>
                          <Button size="sm" onClick={() => moderate.mutate({ id: v.id, status: "approved" })}>
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => moderate.mutate({ id: v.id, status: "rejected" })}
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promos" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Create promo code</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Input
                className="max-w-40"
                placeholder="CODE"
                value={promo.code}
                onChange={(e) => setPromo({ ...promo, code: e.target.value })}
              />
              <Input
                className="max-w-28"
                type="number"
                value={promo.amount}
                onChange={(e) => setPromo({ ...promo, amount: Number(e.target.value) })}
              />
              <Input
                className="max-w-28"
                type="number"
                value={promo.max_uses}
                onChange={(e) => setPromo({ ...promo, max_uses: Number(e.target.value) })}
              />
              <Button
                onClick={() =>
                  savePromo.mutate({
                    code: promo.code,
                    reward_type: "robux",
                    amount: promo.amount,
                    max_uses: promo.max_uses,
                    active: true,
                  })
                }
              >
                Save
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="overflow-x-auto p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Uses</TableHead>
                    <TableHead>Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(overview.data?.promos ?? []).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono">{p.code}</TableCell>
                      <TableCell>
                        {p.amount} {p.reward_type}
                      </TableCell>
                      <TableCell>
                        {p.uses}/{p.max_uses}
                      </TableCell>
                      <TableCell>{p.active ? "yes" : "no"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-3">
          {(tickets.data?.tickets ?? []).map((t) => (
            <Card key={t.id}>
              <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
                <CardTitle className="text-base">{t.subject}</CardTitle>
                <Badge variant={t.status === "open" ? "default" : "secondary"}>{t.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                {(tickets.data?.messages ?? [])
                  .filter((m) => m.ticket_id === t.id)
                  .map((m) => (
                    <div
                      key={m.id}
                      className={`rounded-lg border p-2 text-sm ${
                        m.is_admin ? "border-primary/40 bg-primary/5" : "border-border/60"
                      }`}
                    >
                      <span className="mr-2 text-xs text-muted-foreground">{m.is_admin ? "Admin" : "User"}</span>
                      {m.body}
                    </div>
                  ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Reply…"
                    value={ticketReply[t.id] ?? ""}
                    onChange={(e) => setTicketReply((r) => ({ ...r, [t.id]: e.target.value }))}
                  />
                  <Button
                    onClick={() => replyTicket.mutate({ ticketId: t.id, body: ticketReply[t.id] ?? "" })}
                  >
                    Send
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => replyTicket.mutate({ ticketId: t.id, body: "", status: "closed" })}
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {(tickets.data?.tickets ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No tickets.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
