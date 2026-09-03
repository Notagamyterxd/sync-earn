import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";



async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const adminOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await assertAdmin(context as never);
    const [users, pending, videos, promos, totals] = await Promise.all([
      db.from("profiles").select("*").order("created_at", { ascending: false }).limit(200),
      db.from("withdrawals").select("*").order("created_at", { ascending: false }).limit(200),
      db.from("videos").select("*").order("created_at", { ascending: false }).limit(200),
      db.from("promo_codes").select("*").order("created_at", { ascending: false }).limit(200),
      db.from("transactions").select("amount,currency,kind").limit(5000),
    ]);

    const tx = totals.data ?? [];
    const robuxPaidOut = tx
      .filter((t) => t.currency === "robux" && t.kind === "withdrawal")
      .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
    const robuxEarned = tx
      .filter((t) => t.currency === "robux" && Number(t.amount) > 0)
      .reduce((s, t) => s + Number(t.amount), 0);

    return {
      users: users.data ?? [],
      withdrawals: pending.data ?? [],
      videos: videos.data ?? [],
      promos: promos.data ?? [],
      stats: {
        totalUsers: (users.data ?? []).length,
        robuxEarned,
        robuxPaidOut,
        pendingWithdrawals: (pending.data ?? []).filter((w) => w.status === "pending").length,
      },
    };
  });

export const adminAdjustBalance = createServerFn({ method: "POST" })
  .inputValidator((d: { userId: string; amount: number; currency: "robux" | "diamond"; note?: string }) => d)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const db = await assertAdmin(context as never);
    const { error } = await db.rpc("add_balance", {
      _user: data.userId,
      _amount: Number(data.amount),
      _currency: data.currency,
      _kind: "admin",
      _desc: data.note || "Admin adjustment",
    });
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const, message: "Balance updated." };
  });

export const adminSetStatus = createServerFn({ method: "POST" })
  .inputValidator((d: { userId: string; status: "active" | "banned"; reason?: string; banIp?: boolean }) => d)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const db = await assertAdmin(context as never);
    const { data: profile } = await db
      .from("profiles")
      .select("username_lower,signup_ip")
      .eq("id", data.userId)
      .maybeSingle();
    await db.from("profiles").update({ status: data.status }).eq("id", data.userId);
    if (data.status === "banned") {
      await db.from("bans").insert({
        username_lower: profile?.username_lower ?? null,
        ip: data.banIp ? (profile?.signup_ip ?? null) : null,
        reason: data.reason ?? null,
      });
    } else if (profile?.username_lower) {
      await db.from("bans").delete().eq("username_lower", profile.username_lower);
    }
    return { ok: true as const, message: data.status === "banned" ? "User banned." : "User unbanned." };
  });

export const adminProcessWithdrawal = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string; action: "approve" | "deny"; note?: string }) => d)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const db = await assertAdmin(context as never);
    const { data: wd } = await db.from("withdrawals").select("*").eq("id", data.id).maybeSingle();
    if (!wd || wd.status !== "pending") return { ok: false as const, message: "Request not pending." };

    if (data.action === "deny") {
      await db.rpc("add_balance", {
        _user: wd.user_id,
        _amount: Number(wd.amount),
        _currency: "robux",
        _kind: "refund",
        _desc: `Withdrawal denied: ${data.note ?? "no reason given"}`,
      });
    }
    await db
      .from("withdrawals")
      .update({
        status: data.action === "approve" ? "approved" : "denied",
        admin_note: data.note ?? null,
        processed_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    return { ok: true as const, message: `Withdrawal ${data.action === "approve" ? "approved" : "denied"}.` };
  });

export const adminModerateVideo = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string; status?: "approved" | "rejected" | "pending"; views?: number; note?: string }) => d)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const db = await assertAdmin(context as never);
    const { data: video } = await db.from("videos").select("*").eq("id", data.id).maybeSingle();
    if (!video) return { ok: false as const, message: "Video not found." };

    const status = data.status ?? video.status;
    const views = data.views ?? video.views;
    let paidViews = video.paid_views;

    if (status === "approved" && views > video.paid_views) {
      const { data: rateRow } = await db
        .from("site_settings")
        .select("value")
        .eq("key", "video_rate_per_100_views")
        .maybeSingle();
      const rate = Number(rateRow?.value ?? 1);
      const newViews = views - video.paid_views;
      const payout = Math.floor(newViews / 100) * rate;
      if (payout > 0) {
        paidViews = video.paid_views + Math.floor(newViews / 100) * 100;
        await db.rpc("credit_earning", {
          _user: video.user_id,
          _amount: payout,
          _kind: "video",
          _desc: `Video views payout: ${video.title}`,
        });
      }
    }

    await db
      .from("videos")
      .update({ status, views, paid_views: paidViews, admin_note: data.note ?? video.admin_note })
      .eq("id", data.id);
    return { ok: true as const, message: "Video updated." };
  });

export const adminSavePromo = createServerFn({ method: "POST" })
  .inputValidator((d: {
    id?: string;
    code: string;
    reward_type: "robux" | "diamond";
    amount: number;
    max_uses: number;
    active: boolean;
  }) => d)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const db = await assertAdmin(context as never);
    const payload = {
      code: data.code.trim().toUpperCase(),
      reward_type: data.reward_type,
      amount: Number(data.amount),
      max_uses: Number(data.max_uses),
      active: data.active,
    };
    const res = data.id
      ? await db.from("promo_codes").update(payload).eq("id", data.id)
      : await db.from("promo_codes").insert(payload);
    if (res.error) return { ok: false as const, message: res.error.message };
    return { ok: true as const, message: "Promo code saved." };
  });

export const adminSaveSetting = createServerFn({ method: "POST" })
  .inputValidator((d: { key: string; value: unknown }) => d)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const db = await assertAdmin(context as never);
    const { error } = await db
      .from("site_settings")
      .upsert({ key: data.key, value: data.value as never, updated_at: new Date().toISOString() });
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const, message: "Saved." };
  });
