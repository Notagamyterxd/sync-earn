import { createFileRoute } from "@tanstack/react-router";

const PROVIDERS = ["torox", "bitcotask", "cpx"] as const;

function pick(params: URLSearchParams, keys: string[]) {
  for (const k of keys) {
    const v = params.get(k);
    if (v !== null && v !== "") return v;
  }
  return null;
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function handle(request: Request, provider: string) {
  if (!PROVIDERS.includes(provider as (typeof PROVIDERS)[number])) {
    return new Response("unknown provider", { status: 404 });
  }

  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);
  if (request.method === "POST") {
    const body = await request.text();
    try {
      const json = JSON.parse(body) as Record<string, unknown>;
      for (const [k, v] of Object.entries(json)) params.set(k, String(v));
    } catch {
      new URLSearchParams(body).forEach((v, k) => params.set(k, v));
    }
  }

  const expected = process.env["OFFERWALL_POSTBACK_SECRET"];
  const given = pick(params, ["secret", "hash", "signature", "key"]) ?? "";
  if (!expected || !timingSafeEqual(given, expected)) {
    return new Response("invalid signature", { status: 401 });
  }

  const userId = pick(params, ["user_id", "userId", "sub_id", "subId", "uid", "s1"]);
  const txId = pick(params, ["transaction_id", "trans_id", "txn_id", "tx", "id"]);
  const rawAmount = pick(params, ["amount", "reward", "payout", "points", "currency_amount"]);
  const status = pick(params, ["status", "type"]) ?? "1";
  const amount = Number(rawAmount ?? 0);

  if (!userId || !txId || !Number.isFinite(amount)) {
    return new Response("missing parameters", { status: 400 });
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: existing } = await supabaseAdmin
    .from("offerwall_postbacks")
    .select("id")
    .eq("provider", provider)
    .eq("transaction_id", txId)
    .maybeSingle();
  if (existing) return new Response("1", { status: 200 });

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id,status")
    .eq("id", userId)
    .maybeSingle();
  if (!profile) return new Response("unknown user", { status: 400 });

  const isChargeback = status === "2" || status === "-1" || amount < 0;
  const value = Math.abs(amount);

  await supabaseAdmin.from("offerwall_postbacks").insert({
    provider,
    transaction_id: txId,
    user_id: userId,
    amount: isChargeback ? -value : value,
    status: isChargeback ? "chargeback" : "credited",
    raw: Object.fromEntries(params.entries()),
  });

  if (profile.status === "banned") return new Response("1", { status: 200 });

  if (isChargeback) {
    await supabaseAdmin.rpc("add_balance", {
      _user: userId,
      _amount: -value,
      _currency: "robux",
      _kind: "chargeback",
      _desc: `${provider} chargeback`,
    });
  } else if (value > 0) {
    await supabaseAdmin.rpc("credit_earning", {
      _user: userId,
      _amount: value,
      _kind: "offerwall",
      _desc: `${provider} offer completed`,
    });
  }

  return new Response("1", { status: 200 });
}

export const Route = createFileRoute("/api/public/postback/$provider")({
  server: {
    handlers: {
      GET: async ({ request, params }) => handle(request, params.provider),
      POST: async ({ request, params }) => handle(request, params.provider),
    },
  },
});
