# SyncEarn — GPT & Creator Platform (Phase 1 Core)

A dark, neon-green "money" themed GPT site: users earn Robux from offerwalls, collect Diamonds, open mystery boxes, refer friends, and cash out — with a full admin panel for `SyncStation`.

## Visual direction

Near-black base (#0B0F0D / #111814), money-green accents (#22C55E, lime #A3E635), glass cards with soft green glow, Lucide icons, mobile-first responsive. Logo: "SE" monogram styled as a coin/money mark, generated as an asset and used in the header, auth screens, and favicon.

## Backend

Enable Lovable Cloud (Postgres + auth + storage + server functions). Auth is username + password: usernames are mapped to a synthetic internal email so the managed auth system handles sessions securely, while the UI only ever shows "Username" and "Password". `SyncStation` gets an `admin` role row on signup; roles live in a separate `user_roles` table (never on the profile) and are checked server-side with a security-definer function.

Tables: profiles (username, robux, diamonds, total_earned, status, referral code/tier links, signup IP), user_roles, transactions (earn/spend ledger), withdrawals, promo_codes + promo_redemptions, offerwall_postbacks, boxes/box_openings, videos, referrals, chat_messages, support_tickets + ticket_messages, site_settings, bans.

All tables get RLS: users read/write only their own rows; admin policies via `has_role(auth.uid(),'admin')`; grants issued per table.

## Phase 1 scope (this build)

1. **Landing + Auth** — hero landing with SE logo, username/password register & login, referral code captured from `?r=` link.
2. **Dashboard** — balance cards (Robux, Diamonds, total earned, referrals), earnings feed, quick links.
3. **Offerwalls** — Torox, Bitcotask, CPX Research wall slots (iframe containers with placeholder publisher IDs you fill in later) plus secure postback endpoints at `/api/public/postback/{provider}` that validate a shared secret/hash, dedupe by transaction id, credit Robux, log the transaction, and pay referral commissions.
4. **Promo codes** — redeem box on the dashboard; server-side validation for value, type (Robux/Diamonds), max uses, expiry, one-per-user.
5. **Diamonds & Mystery Boxes** — server-side check awarding 1 Diamond per 100 Robux earned in a rolling 24h window; rewards page where Diamonds open boxes with a weighted random roll (1–10 Robux) resolved entirely on the server, with an opening animation.
6. **Withdrawals** — Robux / LTC / SOL request forms, "all other cryptos via Discord" notice, minimums, balance deducted into a Pending request, transaction history table (amount, date, method, status).
7. **Referrals** — 3-tier commissions (5% / 2% / 1%) credited automatically on every earning event, referral link + stats page.
8. **Admin panel** (`/admin`, admin role only) — user search, ban/unban by username or IP, manual Robux/Diamond adjustments, withdrawal queue with Approve/Deny + reason, promo code CRUD, site-wide earning stats.

## Phase 2 (next, after core is live)

Creator Center (link-only video submissions + admin moderation queue + views-based payout at 1 Robux / 100 views), global real-time chat, and support tickets. The database tables and nav entries for these ship in Phase 1 so Phase 2 is purely UI + logic.

## Technical notes

- Stack stays TanStack Start (React 19 + Vite) with server functions instead of a separate Express service — same capability, no extra deployment.
- Every balance mutation happens in a server function or SQL function with role/ownership checks; nothing trusts client input.
- Postback endpoints live under `/api/public/*` and verify provider signatures before crediting.
- Box odds, referral rates, milestone thresholds, and payout rates are stored in `site_settings` so admin can tune them without a code change.
- Offerwall publisher IDs and postback secrets are stored as project secrets; wall slots show a "not configured" state until you add them.
