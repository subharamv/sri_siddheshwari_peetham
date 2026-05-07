-- ============================================================
-- Sri Siddheswari Peetham — Complete Database Setup
-- Run this once in Supabase SQL Editor
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
  id              text primary key,
  devotee_phone   text not null references devotees(phone) on update cascade,
  seva_date       text not null,
  seva_date_iso   text,
  seva_type       text not null default 'offline',
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

-- ── 5. Reference Tables ─────────────────────────────────────
create table if not exists ref_deities (
  id      text primary key,
  name    text not null,
  sevas   text[] not null,
  grad    text not null default ''
);

create table if not exists ref_sevas (
  name    text primary key,
  price   integer not null
);

create table if not exists ref_slots (
  id         text primary key,
  time       text not null,
  name       text not null,
  price      integer not null,
  sort_order integer not null default 0
);

-- ── Row Level Security ───────────────────────────────────────
alter table devotees            enable row level security;
alter table seva_bookings       enable row level security;
alter table booking_deity_sevas enable row level security;
alter table donations           enable row level security;
alter table ref_deities         enable row level security;
alter table ref_sevas           enable row level security;
alter table ref_slots           enable row level security;

create policy "devotees_insert" on devotees for insert to anon with check (true);
create policy "devotees_select" on devotees for select to anon using (true);
create policy "devotees_update" on devotees for update to anon using (true) with check (true);

create policy "bookings_insert" on seva_bookings for insert to anon with check (true);
create policy "bookings_select" on seva_bookings for select to anon using (true);

create policy "bds_insert" on booking_deity_sevas for insert to anon with check (true);
create policy "bds_select" on booking_deity_sevas for select to anon using (true);

create policy "donations_insert" on donations for insert to anon with check (true);
create policy "donations_select" on donations for select to anon using (true);

create policy "ref_deities_select" on ref_deities for select to anon using (true);
create policy "ref_sevas_select"   on ref_sevas   for select to anon using (true);
create policy "ref_slots_select"   on ref_slots   for select to anon using (true);

-- ── Updated-at trigger ───────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger devotees_updated_at
  before update on devotees
  for each row execute function set_updated_at();

-- ── Seed: Deities ───────────────────────────────────────────
insert into ref_deities (id, name, sevas, grad) values
  ('raja-rajeswari',      'Sri Raja Rajeswari Devi',   array['Abhishekam','Archana','Sahasranama Parayana','Special Puja'],              'linear-gradient(145deg,#6B1A14,#C2185B)'),
  ('naadi-ganapathi',     'Naadi Ganapathi',            array['Abhishekam','Archana','Modaka Offering','Ganapathi Homam'],                'linear-gradient(145deg,#7A3500,#D4690A)'),
  ('pratyangira-devi',    'Paathala Pratyangira Devi', array['Abhishekam','Archana','Pratyangira Homam'],                                'linear-gradient(145deg,#0D0D1A,#4A0E2A)'),
  ('kaala-bhairava',      'Kaala Bhairava',             array['Abhishekam','Archana','Special Puja'],                                    'linear-gradient(145deg,#0A0A0A,#3D2020)'),
  ('kameswara-swami',     'Kameswara Swami',            array['Abhishekam','Rudrabhishekam','Archana'],                                  'linear-gradient(145deg,#1A1A5E,#4A2E8B)'),
  ('ratnagarbha-ganapati','Ratnagarbha Ganapati',       array['Ganapathi Homam','Abhishekam','Modaka Offering'],                         'linear-gradient(145deg,#5E3A00,#B8860B)'),
  ('narasimha-swami',     'Sri Narasimha Swami',        array['Narasimha Homam','Abhishekam','Archana','Sahasranama Parayana'],          'linear-gradient(145deg,#5E1A00,#8B4513)'),
  ('radha-krishna',       'Sri Radha Krishna',          array['Abhishekam','Archana','Bhagavad Gita Parayana','Bhajans'],                'linear-gradient(145deg,#0D3B5E,#1A6B5E)'),
  ('sanjeevaraya-hanuman','Sanjeevaraya Hanuman',        array['Hanuman Chalisa','Abhishekam','Archana','Sundara Kanda Parayana'],       'linear-gradient(145deg,#5E2000,#C25020)'),
  ('swetha-kali',         'Swetha Kali',                array['Kali Puja','Abhishekam','Archana','Sahasranama Parayana','Special Friday Puja'], 'linear-gradient(145deg,#1A1A1A,#4A4A5A)'),
  ('naga-devatha',        'Naga Devatha',               array['Naga Puja','Milk Abhishekam','Archana','Naga Kavacham'],                  'linear-gradient(145deg,#0D3B1A,#1A6B3A)'),
  ('dandaayudha-pani',    'Dandaayudha Pani',           array['Abhishekam','Archana','Special Puja','Danda Puja'],                      'linear-gradient(145deg,#3B0D3B,#6B1A5E)'),
  ('seetha-rama',         'Seetha Rama',                array['Ramayana Parayana','Abhishekam','Archana','Sahasranama Parayana'],        'linear-gradient(145deg,#0D3B6B,#1A5E8B)')
on conflict (id) do nothing;

-- ── Seed: Seva prices ───────────────────────────────────────
insert into ref_sevas (name, price) values
  ('Abhishekam', 251),
  ('Rudrabhishekam', 1001),
  ('Archana', 51),
  ('Sahasranama Parayana', 501),
  ('Ganapathi Homam', 2001),
  ('Narasimha Homam', 3001),
  ('Pratyangira Homam', 5001),
  ('Kali Puja', 1001),
  ('Naga Puja', 501),
  ('Bhajans', 151),
  ('Special Puja', 501),
  ('Danda Puja', 501),
  ('Bhagavad Gita Parayana', 251),
  ('Modaka Offering', 101),
  ('Hanuman Chalisa', 51),
  ('Sundara Kanda Parayana', 501),
  ('Ramayana Parayana', 501),
  ('Milk Abhishekam', 251),
  ('Naga Kavacham', 251),
  ('Special Friday Puja', 501)
on conflict (name) do nothing;

-- ── Seed: Time slots ────────────────────────────────────────
insert into ref_slots (id, time, name, price, sort_order) values
  ('s1', '6:00 AM',  'Abhishekam',            251,  1),
  ('s2', '7:30 AM',  'Alankaram Archana',      101,  2),
  ('s3', '9:00 AM',  'Sahasranama Parayana',   501,  3),
  ('s4', '10:00 AM', 'Rudrabhishekam',         1001, 4),
  ('s5', '12:00 PM', 'Madhyahna Puja',         251,  5),
  ('s6', '4:00 PM',  'Homam Slot',             2001, 6),
  ('s7', '6:00 PM',  'Sandhya Arati Archana',  101,  7),
  ('s8', '8:00 PM',  'Sayana Arati',           51,   8)
on conflict (id) do nothing;
