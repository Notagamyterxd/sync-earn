
-- ============ ENUMS ============
create type public.app_role as enum ('admin','user');
create type public.account_status as enum ('active','banned');
create type public.withdrawal_status as enum ('pending','approved','denied');
create type public.video_status as enum ('pending','approved','rejected');

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  username_lower text not null unique,
  robux numeric(14,2) not null default 0,
  diamonds integer not null default 0,
  total_earned numeric(14,2) not null default 0,
  status public.account_status not null default 'active',
  referral_code text not null unique,
  referred_by uuid references public.profiles(id) on delete set null,
  referral_count integer not null default 0,
  signup_ip text,
  milestone_progress numeric(14,2) not null default 0,
  milestone_window_start timestamptz not null default now(),
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

-- ============ ROLES ============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "admins read roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "admins read profiles" on public.profiles for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "admins update profiles" on public.profiles for update to authenticated using (public.has_role(auth.uid(),'admin'));

-- ============ TRANSACTIONS ============
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  currency text not null default 'robux',
  amount numeric(14,2) not null,
  description text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index on public.transactions (user_id, created_at desc);
grant select on public.transactions to authenticated;
grant all on public.transactions to service_role;
alter table public.transactions enable row level security;
create policy "own transactions" on public.transactions for select to authenticated using (auth.uid() = user_id);
create policy "admins read transactions" on public.transactions for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- ============ WITHDRAWALS ============
create table public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  method text not null,
  amount numeric(14,2) not null,
  destination text not null,
  status public.withdrawal_status not null default 'pending',
  admin_note text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);
create index on public.withdrawals (status, created_at desc);
grant select on public.withdrawals to authenticated;
grant all on public.withdrawals to service_role;
alter table public.withdrawals enable row level security;
create policy "own withdrawals" on public.withdrawals for select to authenticated using (auth.uid() = user_id);
create policy "admins read withdrawals" on public.withdrawals for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins update withdrawals" on public.withdrawals for update to authenticated using (public.has_role(auth.uid(),'admin'));

-- ============ PROMO CODES ============
create table public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  reward_type text not null default 'robux',
  amount numeric(14,2) not null,
  max_uses integer not null default 100,
  uses integer not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.promo_codes to authenticated;
grant all on public.promo_codes to service_role;
alter table public.promo_codes enable row level security;
create policy "admins manage promos" on public.promo_codes for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.promo_redemptions (
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references public.promo_codes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (code_id, user_id)
);
grant select on public.promo_redemptions to authenticated;
grant all on public.promo_redemptions to service_role;
alter table public.promo_redemptions enable row level security;
create policy "own redemptions" on public.promo_redemptions for select to authenticated using (auth.uid() = user_id);

-- ============ OFFERWALL POSTBACKS ============
create table public.offerwall_postbacks (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  transaction_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  amount numeric(14,2) not null default 0,
  status text not null default 'credited',
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (provider, transaction_id)
);
grant select on public.offerwall_postbacks to authenticated;
grant all on public.offerwall_postbacks to service_role;
alter table public.offerwall_postbacks enable row level security;
create policy "admins read postbacks" on public.offerwall_postbacks for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- ============ BOX OPENINGS ============
create table public.box_openings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reward numeric(14,2) not null,
  created_at timestamptz not null default now()
);
grant select on public.box_openings to authenticated;
grant all on public.box_openings to service_role;
alter table public.box_openings enable row level security;
create policy "own openings" on public.box_openings for select to authenticated using (auth.uid() = user_id);

-- ============ VIDEOS ============
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  url text not null,
  platform text not null default 'youtube',
  views integer not null default 0,
  paid_views integer not null default 0,
  status public.video_status not null default 'pending',
  admin_note text,
  created_at timestamptz not null default now()
);
grant select, insert on public.videos to authenticated;
grant all on public.videos to service_role;
alter table public.videos enable row level security;
create policy "own videos" on public.videos for select to authenticated using (auth.uid() = user_id);
create policy "insert own videos" on public.videos for insert to authenticated with check (auth.uid() = user_id);
create policy "admins read videos" on public.videos for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins update videos" on public.videos for update to authenticated using (public.has_role(auth.uid(),'admin'));

-- ============ CHAT ============
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null,
  content text not null,
  created_at timestamptz not null default now()
);
create index on public.chat_messages (created_at desc);
grant select, insert on public.chat_messages to authenticated;
grant all on public.chat_messages to service_role;
alter table public.chat_messages enable row level security;
create policy "read chat" on public.chat_messages for select to authenticated using (true);
create policy "send chat" on public.chat_messages for insert to authenticated with check (auth.uid() = user_id);
create policy "admins delete chat" on public.chat_messages for delete to authenticated using (public.has_role(auth.uid(),'admin'));
alter publication supabase_realtime add table public.chat_messages;

-- ============ SUPPORT ============
create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);
grant select, insert, update on public.support_tickets to authenticated;
grant all on public.support_tickets to service_role;
alter table public.support_tickets enable row level security;
create policy "own tickets" on public.support_tickets for select to authenticated using (auth.uid() = user_id);
create policy "create tickets" on public.support_tickets for insert to authenticated with check (auth.uid() = user_id);
create policy "admins read tickets" on public.support_tickets for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins update tickets" on public.support_tickets for update to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  is_admin boolean not null default false,
  body text not null,
  created_at timestamptz not null default now()
);
grant select, insert on public.ticket_messages to authenticated;
grant all on public.ticket_messages to service_role;
alter table public.ticket_messages enable row level security;
create policy "own ticket messages" on public.ticket_messages for select to authenticated
  using (exists (select 1 from public.support_tickets t where t.id = ticket_id and t.user_id = auth.uid()));
create policy "admins read ticket messages" on public.ticket_messages for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "write ticket messages" on public.ticket_messages for insert to authenticated with check (auth.uid() = user_id);

-- ============ BANS / SETTINGS ============
create table public.bans (
  id uuid primary key default gen_random_uuid(),
  username_lower text,
  ip text,
  reason text,
  created_at timestamptz not null default now()
);
grant select on public.bans to authenticated;
grant all on public.bans to service_role;
alter table public.bans enable row level security;
create policy "admins read bans" on public.bans for select to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
grant select on public.site_settings to authenticated, anon;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "anyone reads settings" on public.site_settings for select to authenticated, anon using (true);
create policy "admins write settings" on public.site_settings for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.site_settings (key, value) values
  ('referral_rates', '{"tier1":5,"tier2":2,"tier3":1}'::jsonb),
  ('box_cost_diamonds', '1'::jsonb),
  ('box_weights', '[{"reward":1,"weight":30},{"reward":2,"weight":25},{"reward":3,"weight":18},{"reward":4,"weight":12},{"reward":5,"weight":7},{"reward":6,"weight":4},{"reward":7,"weight":2},{"reward":8,"weight":1},{"reward":9,"weight":0.7},{"reward":10,"weight":0.3}]'::jsonb),
  ('diamond_milestone_robux', '100'::jsonb),
  ('video_rate_per_100_views', '1'::jsonb),
  ('min_withdraw', '{"robux":10,"ltc":50,"sol":50}'::jsonb),
  ('hero_text', '"Earn Robux for free by completing offers, watching your videos grow, and opening mystery boxes."'::jsonb),
  ('discord_url', '"https://discord.gg/syncearn"'::jsonb);

-- ============ SIGNUP TRIGGER ============
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_username text;
  v_ref text;
  v_referrer uuid;
begin
  v_username := coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1));
  v_ref := new.raw_user_meta_data->>'ref';
  if v_ref is not null then
    select id into v_referrer from public.profiles where referral_code = upper(v_ref);
  end if;

  insert into public.profiles (id, username, username_lower, referral_code, referred_by, signup_ip)
  values (
    new.id, v_username, lower(v_username),
    upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
    v_referrer,
    new.raw_user_meta_data->>'signup_ip'
  );

  if v_referrer is not null then
    update public.profiles set referral_count = referral_count + 1 where id = v_referrer;
  end if;

  insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict do nothing;
  if lower(v_username) = 'syncstation' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- ============ BALANCE ENGINE ============
create or replace function public.add_balance(_user uuid, _amount numeric, _currency text, _kind text, _desc text, _meta jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if _currency = 'diamond' then
    update public.profiles set diamonds = diamonds + _amount::int where id = _user;
  else
    update public.profiles set robux = robux + _amount,
      total_earned = total_earned + greatest(_amount, 0)
    where id = _user;
  end if;
  insert into public.transactions (user_id, kind, currency, amount, description, meta)
  values (_user, _kind, _currency, _amount, _desc, _meta);
end; $$;

create or replace function public.credit_earning(_user uuid, _amount numeric, _kind text, _desc text, _meta jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_progress numeric; v_start timestamptz; v_milestone numeric; v_diamonds int := 0;
  v_rates jsonb; v_up uuid; v_pct numeric; v_cut numeric; i int;
begin
  if _amount <= 0 then return; end if;
  perform public.add_balance(_user, _amount, 'robux', _kind, _desc, _meta);

  select (value#>>'{}')::numeric into v_milestone from public.site_settings where key = 'diamond_milestone_robux';
  v_milestone := coalesce(v_milestone, 100);

  select milestone_progress, milestone_window_start into v_progress, v_start from public.profiles where id = _user for update;
  if now() - v_start > interval '24 hours' then
    v_progress := 0; v_start := now();
  end if;
  v_progress := v_progress + _amount;
  while v_progress >= v_milestone loop
    v_progress := v_progress - v_milestone;
    v_diamonds := v_diamonds + 1;
  end loop;
  update public.profiles set milestone_progress = v_progress, milestone_window_start = v_start where id = _user;
  if v_diamonds > 0 then
    perform public.add_balance(_user, v_diamonds, 'diamond', 'milestone', 'Daily earning milestone reward');
  end if;

  -- referral commissions (3 tiers)
  if _kind <> 'referral' then
    select value into v_rates from public.site_settings where key = 'referral_rates';
    v_up := _user;
    for i in 1..3 loop
      select referred_by into v_up from public.profiles where id = v_up;
      exit when v_up is null;
      v_pct := coalesce((v_rates->>('tier'||i))::numeric, 0);
      v_cut := round(_amount * v_pct / 100.0, 2);
      if v_cut > 0 then
        perform public.add_balance(v_up, v_cut, 'robux', 'referral', 'Tier '||i||' referral commission');
      end if;
    end loop;
  end if;
end; $$;
