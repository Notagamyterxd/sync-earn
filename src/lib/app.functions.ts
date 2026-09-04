import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type BoxWeight = { reward: number; weight: number };

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const getMe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [profileRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    if (profileRes.error) throw new Error(profileRes.error.message);
    return {
      profile: profileRes.data,
      isAdmin: (rolesRes.data ?? []).some((r) => r.role === "admin"),
    };
  });

export const getMyActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [tx, wd, boxes, vids] = await Promise.all([
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("box_openings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("videos")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    return {
      transactions: tx.data ?? [],
      withdrawals: wd.data ?? [],
      boxes: boxes.data ?? [],
      videos: vids.data ?? [],
    };
  });

export const redeemPromo = createServerFn({ method: "POST" })
  .inputValidator((data: { code: string }) => ({ code: String(data.code ?? "").trim().toUpperCase() }))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    if (!data.code) return { ok: false as const, message: "Enter a code." };
    const db = await admin();

    const { data: promo } = await db
      .from("promo_codes")
      .select("*")
      .eq("code", data.code)
      .maybeSingle();

    if (!promo || !promo.active) return { ok: false as const, message: "Invalid or inactive code." };
    if (promo.expires_at && new Date(promo.expires_at) < new Date())
      return { ok: false as const, message: "This code has expired." };
    if (promo.uses >= promo.max_uses) return { ok: false as const, message: "This code is fully claimed." };

    const { error: dupe } = await db
      .from("promo_redemptions")
      .insert({ code_id: promo.id, user_id: userId });
    if (dupe) return { ok: false as const, message: "You already redeemed this code." };

    await db.from("promo_codes").update({ uses: promo.uses + 1 }).eq("id", promo.id);

    if (promo.reward_type === "diamond") {
      await db.rpc("add_balance", {
        _user: userId,
        _amount: promo.amount,
        _currency: "diamond",
        _kind: "promo",
        _desc: `Promo code ${promo.code}`,
      });
    } else {
      await db.rpc("credit_earning", {
        _user: userId,
        _amount: promo.amount,
        _kind: "promo",
        _desc: `Promo code ${promo.code}`,
      });
    }
    return {
      ok: true as const,
      message: `Redeemed ${promo.amount} ${promo.reward_type === "diamond" ? "Diamonds" : "Robux"}!`,
    };
  });

export const openMysteryBox = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const db = await admin();

    const { data: profile } = await db
      .from("profiles")
      .select("diamonds,status")
      .eq("id", userId)
      .maybeSingle();
    if (!profile) return { ok: false as const, message: "Profile not found." };
    if (profile.status === "banned") return { ok: false as const, message: "Account is banned." };

    const { data: costRow } = await db
      .from("site_settings")
      .select("value")
      .eq("key", "box_cost_diamonds")
      .maybeSingle();
    const cost = Number(costRow?.value ?? 1);
    if (profile.diamonds < cost)
      return { ok: false as const, message: `You need ${cost} Diamond to open a box.` };

    const { data: weightRow } = await db
      .from("site_settings")
      .select("value")
      .eq("key", "box_weights")
      .maybeSingle();
    const weights = (weightRow?.value as unknown as BoxWeight[]) ?? [{ reward: 1, weight: 1 }];

    const total = weights.reduce((s, w) => s + w.weight, 0);
    let roll = Math.random() * total;
    let reward = weights[0]?.reward ?? 1;
    for (const w of weights) {
      roll -= w.weight;
      if (roll <= 0) {
        reward = w.reward;
        break;
      }
    }

    await db.rpc("add_balance", {
      _user: userId,
      _amount: -cost,
      _currency: "diamond",
      _kind: "box",
      _desc: "Opened a mystery box",
    });
    await db.from("box_openings").insert({ user_id: userId, reward });
    await db.rpc("credit_earning", {
      _user: userId,
      _amount: reward,
      _kind: "box",
      _desc: "Mystery box reward",
    });

    return { ok: true as const, reward, message: `You won ${reward} Robux!` };
  });

export const requestWithdrawal = createServerFn({ method: "POST" })
  .inputValidator((data: { method: string; amount: number; destination: string }) => ({
    method: String(data.method),
    amount: Number(data.amount),
    destination: String(data.destination ?? "").trim(),
  }))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    if (!["robux", "ltc", "sol"].includes(data.method))
      return { ok: false as const, message: "Unsupported method." };
    if (!data.destination) return { ok: false as const, message: "Enter your payout details." };
    if (!Number.isFinite(data.amount) || data.amount <= 0)
      return { ok: false as const, message: "Enter a valid amount." };

    const db = await admin();
    const { data: profile } = await db
      .from("profiles")
      .select("robux,status")
      .eq("id", userId)
      .maybeSingle();
    if (!profile) return { ok: false as const, message: "Profile not found." };
    if (profile.status === "banned") return { ok: false as const, message: "Account is banned." };

    const { data: minRow } = await db
      .from("site_settings")
      .select("value")
      .eq("key", "min_withdraw")
      .maybeSingle();
    const mins = (minRow?.value as unknown as Record<string, number>) ?? {};
    const min = Number(mins[data.method] ?? 10);
    if (data.amount < min)
      return { ok: false as const, message: `Minimum for this method is ${min} Robux.` };
    if (Number(profile.robux) < data.amount)
      return { ok: false as const, message: "Insufficient Robux balance." };

    await db.rpc("add_balance", {
      _user: userId,
      _amount: -data.amount,
      _currency: "robux",
      _kind: "withdrawal",
      _desc: `Withdrawal request (${data.method.toUpperCase()})`,
    });
    await db.from("withdrawals").insert({
      user_id: userId,
      method: data.method,
      amount: data.amount,
      destination: data.destination,
    });
    return { ok: true as const, message: "Withdrawal requested — pending admin approval." };
  });

export const submitVideo = createServerFn({ method: "POST" })
  .inputValidator((data: { title: string; url: string; platform: string }) => ({
    title: String(data.title ?? "").trim(),
    url: String(data.url ?? "").trim(),
    platform: String(data.platform ?? "youtube"),
  }))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    if (!data.title || !data.url) return { ok: false as const, message: "Title and link are required." };
    if (!/^https?:\/\//i.test(data.url)) return { ok: false as const, message: "Enter a valid link." };
    const { error } = await context.supabase.from("videos").insert({
      user_id: context.userId,
      title: data.title,
      url: data.url,
      platform: data.platform,
    });
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const, message: "Video submitted for review." };
  });

export const getMyTickets = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const tickets = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    const ids = (tickets.data ?? []).map((t) => t.id);
    const messages = ids.length
      ? await supabase
          .from("ticket_messages")
          .select("*")
          .in("ticket_id", ids)
          .order("created_at", { ascending: true })
      : { data: [] as never[] };
    return { tickets: tickets.data ?? [], messages: messages.data ?? [] };
  });

export const createTicket = createServerFn({ method: "POST" })
  .inputValidator((d: { subject: string; body: string }) => ({
    subject: String(d.subject ?? "").trim(),
    body: String(d.body ?? "").trim(),
  }))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    if (!data.subject || !data.body) return { ok: false as const, message: "Subject and message are required." };
    const { data: ticket, error } = await context.supabase
      .from("support_tickets")
      .insert({ user_id: context.userId, subject: data.subject })
      .select("id")
      .single();
    if (error || !ticket) return { ok: false as const, message: error?.message ?? "Could not open ticket." };
    const msg = await context.supabase
      .from("ticket_messages")
      .insert({ ticket_id: ticket.id, user_id: context.userId, body: data.body });
    if (msg.error) return { ok: false as const, message: msg.error.message };
    return { ok: true as const, message: "Ticket opened." };
  });

export const replyTicket = createServerFn({ method: "POST" })
  .inputValidator((d: { ticketId: string; body: string }) => ({
    ticketId: String(d.ticketId ?? ""),
    body: String(d.body ?? "").trim(),
  }))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    if (!data.body) return { ok: false as const, message: "Message is required." };
    const { error } = await context.supabase
      .from("ticket_messages")
      .insert({ ticket_id: data.ticketId, user_id: context.userId, body: data.body });
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const, message: "Reply sent." };
  });
