import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginWithUsername, registerWithUsername, validateUsername } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { mode?: "login" | "register"; r?: string } => ({
    mode: search['mode'] === "register" ? "register" : "login",
    ...(typeof search['r'] === "string" ? { r: search['r'] as string } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Log in or sign up — SyncEarn" },
      { name: "description", content: "Access your SyncEarn account with a username and password." },
      { property: "og:title", content: "Log in or sign up — SyncEarn" },
      { property: "og:description", content: "Access your SyncEarn account with a username and password." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode, r } = Route.useSearch();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const isRegister = mode === "register";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const bad = validateUsername(username);
    if (bad) { toast.error(bad); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    setBusy(true);
    try {
      if (isRegister) {
        await registerWithUsername(username, password, r ?? null);
        toast.success("Account created. Welcome to SyncEarn!");
      } else {
        await loginWithUsername(username, password);
        toast.success("Welcome back!");
      }
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glow-card w-full max-w-sm rounded-2xl p-6">
        <Link to="/" className="flex justify-center">
          <Logo size={40} />
        </Link>
        <h1 className="mt-6 text-center text-2xl font-bold">
          {isRegister ? "Create your account" : "Log in"}
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Username and password only — no email needed.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="SyncFan123"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Please wait…" : isRegister ? "Create account" : "Log in"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {isRegister ? "Already registered?" : "New to SyncEarn?"}{" "}
          <Link
            to="/auth"
            search={{ mode: isRegister ? "login" : "register", r }}
            className="font-medium text-primary hover:underline"
          >
            {isRegister ? "Log in" : "Create an account"}
          </Link>
        </p>
      </div>
    </div>
  );
}
