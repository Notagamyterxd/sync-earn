import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  LayoutDashboard,
  Coins,
  Gift,
  Video,
  Wallet,
  Users,
  MessageSquare,
  LifeBuoy,
  Shield,
  LogOut,
  Menu,
  X,
  Gem,
} from "lucide-react";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getMe } from "@/lib/app.functions";
import { cn } from "@/lib/utils";

export const meQueryOptions = {
  queryKey: ["me"],
  queryFn: () => getMe(),
  staleTime: 10_000,
};

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/earn", label: "Earn", icon: Coins },
  { to: "/rewards", label: "Mystery Boxes", icon: Gift },
  { to: "/videos", label: "Creator Center", icon: Video },
  { to: "/withdraw", label: "Withdraw", icon: Wallet },
  { to: "/referrals", label: "Referrals", icon: Users },
  { to: "/chat", label: "Global Chat", icon: MessageSquare },
  { to: "/support", label: "Support", icon: LifeBuoy },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useQuery(meQueryOptions);
  const profile = data?.profile;

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          activeProps={{ className: "bg-sidebar-accent text-foreground font-medium" }}
        >
          <item.icon className="size-4" />
          {item.label}
        </Link>
      ))}
      {data?.isAdmin && (
        <Link
          to="/admin"
          onClick={() => setOpen(false)}
          className="mt-2 flex items-center gap-3 rounded-lg border border-primary/30 px-3 py-2.5 text-sm text-primary transition-colors hover:bg-primary/10"
          activeProps={{ className: "bg-primary/10 font-medium" }}
        >
          <Shield className="size-4" />
          Admin Panel
        </Link>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2">
            <button
              className="rounded-md p-2 text-muted-foreground lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <Link to="/dashboard">
              <Logo size={30} />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
              <Coins className="size-4" />
              {Number(profile?.robux ?? 0).toFixed(2)}
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-diamond/30 bg-diamond/10 px-3 py-1.5 text-sm font-semibold text-diamond">
              <Gem className="size-4" />
              {profile?.diamonds ?? 0}
            </span>
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24">{nav}</div>
        </aside>
        {open && (
          <div className="fixed inset-0 top-16 z-30 bg-background/95 p-4 lg:hidden">{nav}</div>
        )}
        <main className={cn("min-w-0 flex-1")}>{children}</main>
      </div>
    </div>
  );
}
