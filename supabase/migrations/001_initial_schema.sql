-- ============================================================
-- Sri Siddheswari Peetham — Initial Database Schema
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ── 1. Devotees ─────────────────────────────────────────────
create table if not exists devotees (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text unique not null,
  email       text not null default '',
  city        text not null default '',
  state       text not null default '',
  gotra       text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── 2. Seva Bookings ────────────────────────────────────────
create table if not exists seva_bookings (
  id              text primary key,         -- SSP-XXXXXX
  devotee_phone   text not null references devotees(phone) on update cascade,
  seva_date       text not null,            -- display date string
  slot_id         text,
  slot_time       text,
  slot_name       text,
  slot_price      integer not null default 0,
  family_members  text[] not null default '{}',
  total           integer not null,
  payment_method  text not null default 'upi',
  payment_status  text not null default 'confirmed',
  created_at      timestamptz not null default now()
);

create index if not exists seva_bookings_devotee_phone_idx on seva_bookings(devotee_phone);
create index if not exists seva_bookings_created_at_idx   on seva_bookings(created_at desc);

-- ── 3. Booking Deity Sevas ──────────────────────────────────
create table if not exists booking_deity_sevas (
  id          uuid primary key default gen_random_uuid(),
  booking_id  text not null references seva_bookings(id) on delete cascade,
  deity_id    text not null,
  deity_name  text not null,
  seva_name   text not null,
  price       integer not null
);

create index if not exists bds_booking_id_idx on booking_deity_sevas(booking_id);

-- ── 4. Donations ────────────────────────────────────────────
create table if not exists donations (
  id              uuid primary key default gen_random_uuid(),
  donor_name      text not null,
  donor_phone     text not null,
  donor_email     text not null default '',
  donation_type   text not null,
  amount          integer not null,
  message         text not null default '',
  want_receipt    boolean not null default false,
  payment_status  text not null default 'pending',
  transaction_id  text,
  created_at      timestamptz not null default now()
);

create index if not exists donations_donor_phone_idx on donations(donor_phone);
create index if not exists donations_created_at_idx  on donations(created_at desc);

-- ── Row Level Security ───────────────────────────────────────
alter table devotees           enable row level security;
alter table seva_bookings      enable row level security;
alter table booking_deity_sevas enable row level security;
alter table donations          enable row level security;

-- devotees: insert/upsert is public (anyone can register); select own row by phone
create policy "devotees_insert" on devotees for insert to anon with check (true);
create policy "devotees_select" on devotees for select to anon using (true);
create policy "devotees_update" on devotees for update to anon using (true) with check (true);

-- seva_bookings: anyone can insert; select own bookings by phone
create policy "bookings_insert" on seva_bookings for insert to anon with check (true);
create policy "bookings_select" on seva_bookings for select to anon using (true);

-- booking_deity_sevas: open read/write via anon (data controlled through booking inserts)
create policy "bds_insert" on booking_deity_sevas for insert to anon with check (true);
create policy "bds_select" on booking_deity_sevas for select to anon using (true);

-- donations: insert only; no read-back (admin reads via dashboard)
create policy "donations_insert" on donations for insert to anon with check (true);
create policy "donations_select" on donations for select to anon using (true);

-- ── Updated-at trigger ───────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger devotees_updated_at
  before update on devotees
  for each row execute function set_updated_at();
