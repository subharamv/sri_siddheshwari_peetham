-- ============================================================
-- Migration 002: Add seva_type, seva_date_iso + seed reference data
-- ============================================================

-- ── Extend seva_bookings ────────────────────────────────────
alter table seva_bookings
  add column if not exists seva_type    text not null default 'offline',
  add column if not exists seva_date_iso text;

-- ── Reference tables ────────────────────────────────────────
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
  id      text primary key,
  time    text not null,
  name    text not null,
  price   integer not null,
  sort_order integer not null default 0
);

-- RLS: public read-only for reference tables
alter table ref_deities enable row level security;
alter table ref_sevas    enable row level security;
alter table ref_slots    enable row level security;

create policy "ref_deities_select" on ref_deities for select to anon using (true);
create policy "ref_sevas_select"   on ref_sevas   for select to anon using (true);
create policy "ref_slots_select"   on ref_slots   for select to anon using (true);

-- ── Seed: Deities ───────────────────────────────────────────
insert into ref_deities (id, name, sevas, grad) values
  ('raja-rajeswari',     'Sri Raja Rajeswari Devi',    array['Abhishekam','Archana','Sahasranama Parayana','Special Puja'],                               'linear-gradient(145deg,#6B1A14,#C2185B)'),
  ('naadi-ganapathi',    'Naadi Ganapathi',             array['Abhishekam','Archana','Modaka Offering','Ganapathi Homam'],                                 'linear-gradient(145deg,#7A3500,#D4690A)'),
  ('pratyangira-devi',   'Paathala Pratyangira Devi',  array['Abhishekam','Archana','Pratyangira Homam'],                                                  'linear-gradient(145deg,#0D0D1A,#4A0E2A)'),
  ('kaala-bhairava',     'Kaala Bhairava',              array['Abhishekam','Archana','Special Puja'],                                                       'linear-gradient(145deg,#0A0A0A,#3D2020)'),
  ('kameswara-swami',    'Kameswara Swami',             array['Abhishekam','Rudrabhishekam','Archana'],                                                     'linear-gradient(145deg,#1A1A5E,#4A2E8B)'),
  ('ratnagarbha-ganapati','Ratnagarbha Ganapati',       array['Ganapathi Homam','Abhishekam','Modaka Offering'],                                            'linear-gradient(145deg,#5E3A00,#B8860B)'),
  ('narasimha-swami',    'Sri Narasimha Swami',         array['Narasimha Homam','Abhishekam','Archana','Sahasranama Parayana'],                             'linear-gradient(145deg,#5E1A00,#8B4513)'),
  ('radha-krishna',      'Sri Radha Krishna',           array['Abhishekam','Archana','Bhagavad Gita Parayana','Bhajans'],                                   'linear-gradient(145deg,#0D3B5E,#1A6B5E)'),
  ('sanjeevaraya-hanuman','Sanjeevaraya Hanuman',        array['Hanuman Chalisa','Abhishekam','Archana','Sundara Kanda Parayana'],                          'linear-gradient(145deg,#5E2000,#C25020)'),
  ('swetha-kali',        'Swetha Kali',                 array['Kali Puja','Abhishekam','Archana','Sahasranama Parayana','Special Friday Puja'],              'linear-gradient(145deg,#1A1A1A,#4A4A5A)'),
  ('naga-devatha',       'Naga Devatha',                array['Naga Puja','Milk Abhishekam','Archana','Naga Kavacham'],                                     'linear-gradient(145deg,#0D3B1A,#1A6B3A)'),
  ('dandaayudha-pani',   'Dandaayudha Pani',            array['Abhishekam','Archana','Special Puja','Danda Puja'],                                          'linear-gradient(145deg,#3B0D3B,#6B1A5E)'),
  ('seetha-rama',        'Seetha Rama',                 array['Ramayana Parayana','Abhishekam','Archana','Sahasranama Parayana'],                           'linear-gradient(145deg,#0D3B6B,#1A5E8B)')
on conflict (id) do nothing;

-- ── Seed: Seva prices ───────────────────────────────────────
insert into ref_sevas (name, price) values
  ('Abhishekam', 251), ('Rudrabhishekam', 1001), ('Archana', 51),
  ('Sahasranama Parayana', 501), ('Ganapathi Homam', 2001), ('Narasimha Homam', 3001),
  ('Pratyangira Homam', 5001), ('Kali Puja', 1001), ('Naga Puja', 501),
  ('Bhajans', 151), ('Special Puja', 501), ('Danda Puja', 501),
  ('Bhagavad Gita Parayana', 251), ('Modaka Offering', 101), ('Hanuman Chalisa', 51),
  ('Sundara Kanda Parayana', 501), ('Ramayana Parayana', 501), ('Milk Abhishekam', 251),
  ('Naga Kavacham', 251), ('Special Friday Puja', 501)
on conflict (name) do nothing;

-- ── Seed: Time slots ────────────────────────────────────────
insert into ref_slots (id, time, name, price, sort_order) values
  ('s1', '6:00 AM',   'Abhishekam',          251,  1),
  ('s2', '7:30 AM',   'Alankaram Archana',   101,  2),
  ('s3', '9:00 AM',   'Sahasranama Parayana',501,  3),
  ('s4', '10:00 AM',  'Rudrabhishekam',      1001, 4),
  ('s5', '12:00 PM',  'Madhyahna Puja',      251,  5),
  ('s6', '4:00 PM',   'Homam Slot',          2001, 6),
  ('s7', '6:00 PM',   'Sandhya Arati Archana',101, 7),
  ('s8', '8:00 PM',   'Sayana Arati',        51,   8)
on conflict (id) do nothing;
