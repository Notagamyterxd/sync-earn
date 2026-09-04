import { createFileRoute } from "@tanstack/react-router";

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function pick(p: URLSearchParams, keys: string[]) {
  for (const k of keys) {
    const v = p.get(k);
    if (v !== null && v !== "") return v;
  }
  return null;
}

/**
 * CPX Research postback handler.
 * CPX signs each ping with hash = md5(trans_id + "-" + secure_hash).
 * status=1 -> credit, status=2 -> chargeback/reversal.
 */
async function handle(request: Request) {
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

  const secret = process.env["CPX_SECURE_HASH"];
  if (!secret) return new Response("not configured", { status: 500 });

  const transId = pick(params, ["trans_id", "transaction_id", "txn_id"]);
  const userId = pick(params, ["user_id", "ext_user_id", "subid_1"]);
  const given = (pick(params, ["hash", "secure_hash", "signature"]) ?? "").toLowerCase();
  const status = pick(params, ["status"]) ?? "1";
  const amount = Number(pick(params, ["amount_local", "amount_usd", "amount"]) ?? 0);

  if (!transId || !userId || !Number.isFinite(amount)) {
    return new Response("missing parameters", { status: 400 });
  }

  const { createHash } = await import("node:crypto");
  const expected = createHash("md5").update(`${transId}-${secret}`).digest("hex");
  if (!safeEqual(given, expected)) {
    return new Response("invalid signature", { status: 401 });
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: existing } = await supabaseAdmin
    .from("offerwall_postbacks")
    .select("id")
    .eq("provider", "cpx")
    .eq("transaction_id", transId)
    .maybeSingle();
  if (existing) return new Response("1", { status: 200 });

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id,status")
    .eq("id", userId)
    .maybeSingle();
  if (!profile) return new Response("unknown user", { status: 400 });

  const isChargeback = status === "2" || amount < 0;
  const value = Math.abs(amount);

  await supabaseAdmin.from("offerwall_postbacks").insert({
    provider: "cpx",
    transaction_id: transId,
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
      _desc: "CPX Research survey reversal",
    });
  } else if (value > 0) {
    await supabaseAdmin.rpc("credit_earning", {
      _user: userId,
      _amount: value,
      _kind: "offerwall",
      _desc: "CPX Research survey completed",
    });
  }

  return new Response("1", { status: 200 });
}

export const Route = createFileRoute("/api/public/postback/cpx-research")({
  server: {
    handlers: {
      GET: async ({ request }) => handle(request),
      POST: async ({ request }) => handle(request),
    },
  },
});
