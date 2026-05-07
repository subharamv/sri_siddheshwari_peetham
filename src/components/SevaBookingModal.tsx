import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Calendar, ChevronLeft, ChevronRight, ChevronDown, Plus, Trash2,
  Download, CheckCircle2, Loader2, Clock, User, Phone,
  Mail, MapPin, Heart, ArrowRight, CreditCard, Smartphone, Building2,
  Wifi, Building, AlertCircle,
} from 'lucide-react';
import Stepper, { Step } from './Stepper';
import { supabase } from '../lib/supabase';
import { downloadBookingPDF } from '../lib/pdfReceipt';

// ── Types ──────────────────────────────────────────────────────────────────────
export interface DeityData {
  id: string;
  name: string;
  sevas: string[];
  grad: string;
}

interface TimeSlot {
  id: string;
  time: string;
  name: string;
  price: number;
  available: boolean;
}

interface DeitySevaSelection {
  deity: DeityData;
  seva: string;
  price: number;
  slot?: TimeSlot; // Add slot to each selection
}

export interface BookingRecord {
  id: string;
  date: string;
  dateIso: string;
  sevaType: 'online' | 'offline';
  slot: TimeSlot | null; // Keep for backward compat, but we'll prefer ds.slot
  deitySevas: DeitySevaSelection[];
  devotee: { name: string; email: string; phone: string; city: string; state: string; gotra: string };
  familyMembers: string[];
  total: number;
  status: 'confirmed';
  createdAt: string;
  paymentMethod: string;
}

export interface SevaBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDeity?: DeityData | null;
  mode?: 'schedule' | 'book';
}

// ── Static data ────────────────────────────────────────────────────────────────
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const WEEKDAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

export const ALL_DEITIES: DeityData[] = [
  { id: 'raja-rajeswari', name: 'Sri Raja Rajeswari Devi', sevas: ['Abhishekam','Archana','Sahasranama Parayana','Special Puja'], grad: 'linear-gradient(145deg,#6B1A14,#C2185B)' },
  { id: 'naadi-ganapathi', name: 'Naadi Ganapathi', sevas: ['Abhishekam','Archana','Modaka Offering','Ganapathi Homam'], grad: 'linear-gradient(145deg,#7A3500,#D4690A)' },
  { id: 'pratyangira-devi', name: 'Paathala Pratyangira Devi', sevas: ['Abhishekam','Archana','Pratyangira Homam'], grad: 'linear-gradient(145deg,#0D0D1A,#4A0E2A)' },
  { id: 'kaala-bhairava', name: 'Kaala Bhairava', sevas: ['Abhishekam','Archana','Special Puja'], grad: 'linear-gradient(145deg,#0A0A0A,#3D2020)' },
  { id: 'kameswara-swami', name: 'Kameswara Swami', sevas: ['Abhishekam','Rudrabhishekam','Archana'], grad: 'linear-gradient(145deg,#1A1A5E,#4A2E8B)' },
  { id: 'ratnagarbha-ganapati', name: 'Ratnagarbha Ganapati', sevas: ['Ganapathi Homam','Abhishekam','Modaka Offering'], grad: 'linear-gradient(145deg,#5E3A00,#B8860B)' },
  { id: 'narasimha-swami', name: 'Sri Narasimha Swami', sevas: ['Narasimha Homam','Abhishekam','Archana','Sahasranama Parayana'], grad: 'linear-gradient(145deg,#5E1A00,#8B4513)' },
  { id: 'radha-krishna', name: 'Sri Radha Krishna', sevas: ['Abhishekam','Archana','Bhagavad Gita Parayana','Bhajans'], grad: 'linear-gradient(145deg,#0D3B5E,#1A6B5E)' },
  { id: 'sanjeevaraya-hanuman', name: 'Sanjeevaraya Hanuman', sevas: ['Hanuman Chalisa','Abhishekam','Archana','Sundara Kanda Parayana'], grad: 'linear-gradient(145deg,#5E2000,#C25020)' },
  { id: 'swetha-kali', name: 'Swetha Kali', sevas: ['Kali Puja','Abhishekam','Archana','Sahasranama Parayana','Special Friday Puja'], grad: 'linear-gradient(145deg,#1A1A1A,#4A4A5A)' },
  { id: 'naga-devatha', name: 'Naga Devatha', sevas: ['Naga Puja','Milk Abhishekam','Archana','Naga Kavacham'], grad: 'linear-gradient(145deg,#0D3B1A,#1A6B3A)' },
  { id: 'dandaayudha-pani', name: 'Dandaayudha Pani', sevas: ['Abhishekam','Archana','Special Puja','Danda Puja'], grad: 'linear-gradient(145deg,#3B0D3B,#6B1A5E)' },
  { id: 'seetha-rama', name: 'Seetha Rama', sevas: ['Ramayana Parayana','Abhishekam','Archana','Sahasranama Parayana'], grad: 'linear-gradient(145deg,#0D3B6B,#1A5E8B)' },
];

const SEVA_PRICES: Record<string, number> = {
  'Abhishekam': 251, 'Rudrabhishekam': 1001, 'Archana': 51,
  'Sahasranama Parayana': 501, 'Ganapathi Homam': 2001, 'Narasimha Homam': 3001,
  'Pratyangira Homam': 5001, 'Kali Puja': 1001, 'Naga Puja': 501,
  'Bhajans': 151, 'Special Puja': 501, 'Danda Puja': 501,
  'Bhagavad Gita Parayana': 251, 'Modaka Offering': 101, 'Hanuman Chalisa': 51,
  'Sundara Kanda Parayana': 501, 'Ramayana Parayana': 501, 'Milk Abhishekam': 251,
  'Naga Kavacham': 251, 'Special Friday Puja': 501,
};

const BASE_SLOTS: Omit<TimeSlot, 'available'>[] = [
  { id: 's1', time: '6:00 AM', name: 'Abhishekam', price: 251 },
  { id: 's2', time: '7:30 AM', name: 'Alankaram Archana', price: 101 },
  { id: 's3', time: '9:00 AM', name: 'Sahasranama Parayana', price: 501 },
  { id: 's4', time: '10:00 AM', name: 'Rudrabhishekam', price: 1001 },
  { id: 's5', time: '12:00 PM', name: 'Madhyahna Puja', price: 251 },
  { id: 's6', time: '4:00 PM', name: 'Homam Slot', price: 2001 },
  { id: 's7', time: '6:00 PM', name: 'Sandhya Arati Archana', price: 101 },
  { id: 's8', time: '8:00 PM', name: 'Sayana Arati', price: 51 },
];

const FESTIVAL_DAYS: Record<string, string> = {
  '2026-02-15': 'Mouna Shivaratri', '2026-04-19': 'Akshaya Tritiya',
  '2026-07-29': 'Guru Purnima', '2026-08-21': 'Varalakshmi Vratam',
  '2026-09-04': 'Krishna Janmashtami', '2026-09-14': 'Ganesh Chaturthi',
  '2026-10-12': 'Navaratri', '2026-11-08': 'Deepavali', '2027-03-06': 'Maha Shivaratri',
};

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Puducherry','Outside India',
];

// ── Payment constants ──────────────────────────────────────────────────────────
const UPI_LOGO = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1280px-UPI-Logo-vector.svg.png';

const CARD_NETWORKS = [
  { id: 'visa' as const, label: 'Visa', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/1280px-Visa_Inc._logo.svg.png' },
  { id: 'mastercard' as const, label: 'Mastercard', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png' },
  { id: 'rupay' as const, label: 'RuPay', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Rupay-Logo.png/1280px-Rupay-Logo.png' },
];

const INDIAN_BANKS = [
  { id: 'sbi', name: 'State Bank of India', short: 'SBI', color: '#22577A', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/SBI-Logo.svg/1200px-SBI-Logo.svg.png' },
  { id: 'hdfc', name: 'HDFC Bank', short: 'HDFC', color: '#004C8F', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/HDFC_Bank_Logo.svg/1280px-HDFC_Bank_Logo.svg.png' },
  { id: 'icici', name: 'ICICI Bank', short: 'ICICI', color: '#B32409', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/ICICI_Bank_Logo.svg/1280px-ICICI_Bank_Logo.svg.png' },
  { id: 'axis', name: 'Axis Bank', short: 'Axis', color: '#97144D', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Axis_Bank_logo.svg/1280px-Axis_Bank_logo.svg.png' },
  { id: 'kotak', name: 'Kotak Mahindra', short: 'Kotak', color: '#D71920', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Kotak_Mahindra_Bank_logo.svg/1280px-Kotak_Mahindra_Bank_logo.svg.png' },
  { id: 'bob', name: 'Bank of Baroda', short: 'BoB', color: '#F47920', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Bank_of_Baroda_Logo.svg/1280px-Bank_of_Baroda_Logo.svg.png' },
  { id: 'pnb', name: 'Punjab National', short: 'PNB', color: '#7B2D8B', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Punjab_National_Bank_Logo.svg/1280px-Punjab_National_Bank_Logo.svg.png' },
  { id: 'canara', name: 'Canara Bank', short: 'Canara', color: '#003087', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Canara_Bank_Logo.svg/1280px-Canara_Bank_Logo.svg.png' },
  { id: 'union', name: 'Union Bank', short: 'Union', color: '#0D6B3E', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Union_Bank_of_India_Logo.svg/1280px-Union_Bank_of_India_Logo.svg.png' },
  { id: 'yes', name: 'Yes Bank', short: 'Yes', color: '#002D62', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Yes_Bank_Logo.svg/1280px-Yes_Bank_Logo.svg.png' },
  { id: 'indusind', name: 'IndusInd Bank', short: 'IndusInd', color: '#6D3B98', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/IndusInd_Bank_Logo.svg/1280px-IndusInd_Bank_Logo.svg.png' },
  { id: 'idbi', name: 'IDBI Bank', short: 'IDBI', color: '#005B94', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/IDBI_Bank_Logo.svg/1280px-IDBI_Bank_Logo.svg.png' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
const toKey = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

const formatDisplayDate = (d: Date) =>
  d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const generateBookingId = () => `SSP-${Date.now().toString(36).toUpperCase().slice(-6)}`;

const parseSlotTime = (slotTime: string, date: Date): Date => {
  const [timePart, ampm] = slotTime.split(' ');
  let [h, m] = timePart.split(':').map(Number);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  const dt = new Date(date);
  dt.setHours(h, m, 0, 0);
  return dt;
};

const isSlotPast = (slotTime: string, date: Date): boolean => {
  const now = new Date();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const selDay = new Date(date); selDay.setHours(0, 0, 0, 0);
  if (selDay.getTime() !== today.getTime()) return false; // only block past slots on today
  return now >= parseSlotTime(slotTime, date);
};

const getSlotsForDate = (date: Date): TimeSlot[] => {
  return BASE_SLOTS.map(s => ({
    ...s,
    available: !isSlotPast(s.time, date),
  }));
};

const getFilteredSlots = (date: Date, selections: DeitySevaSelection[]): TimeSlot[] => {
  const allSlots = getSlotsForDate(date);
  if (selections.length === 0) return allSlots;
  
  const selectedSevaNames = selections.map(s => s.seva.toLowerCase());
  const filtered = allSlots.filter(slot => 
    selectedSevaNames.some(sn => slot.name.toLowerCase().includes(sn) || sn.includes(slot.name.toLowerCase()))
  );
  
  return filtered.length > 0 ? filtered : allSlots;
};

const saveBookingToSupabase = async (record: BookingRecord): Promise<void> => {
  // Upsert devotee (update name/email/city/state/gotra if phone already exists)
  const { error: devoteeErr } = await supabase.from('devotees').upsert({
    name: record.devotee.name,
    phone: record.devotee.phone,
    email: record.devotee.email,
    city: record.devotee.city,
    state: record.devotee.state,
    gotra: record.devotee.gotra,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'phone' });
  if (devoteeErr) throw new Error(`Failed to save devotee: ${devoteeErr.message}`);

  // Insert booking record
  const { error: bookingErr } = await supabase.from('seva_bookings').insert({
    id: record.id,
    devotee_phone: record.devotee.phone,
    seva_date: record.date,
    seva_date_iso: record.dateIso,
    seva_type: record.sevaType,
    slot_id: record.slot?.id ?? null,
    slot_time: record.slot?.time ?? null,
    slot_name: record.slot?.name ?? null,
    slot_price: record.slot?.price ?? 0,
    family_members: record.familyMembers,
    total: record.total,
    payment_method: record.paymentMethod,
    payment_status: record.status,
    created_at: record.createdAt,
  });
  if (bookingErr) throw new Error(`Failed to save booking: ${bookingErr.message}`);

  // Insert each deity+seva line item
  if (record.deitySevas.length > 0) {
    const { error: sevaErr } = await supabase.from('booking_deity_sevas').insert(
      record.deitySevas.map(ds => ({
        booking_id: record.id,
        deity_id: ds.deity.id,
        deity_name: ds.deity.name,
        seva_name: ds.slot ? `${ds.seva} (${ds.slot.time})` : ds.seva,
        price: ds.price,
      }))
    );
    if (sevaErr) throw new Error(`Failed to save seva details: ${sevaErr.message}`);
  }
};

const generateReceiptHTML = (b: BookingRecord) => `<!DOCTYPE html>
<html><head><title>Seva Receipt — ${b.id}</title>
<style>
  body{font-family:Georgia,serif;max-width:600px;margin:40px auto;color:#333;padding:0 20px}
  h1{color:#A02D23;font-size:20px;margin:0} .sub{color:#666;font-size:13px;margin:4px 0}
  hr{border:none;border-top:2px solid #A02D23;margin:20px 0}
  .sec h2{font-size:11px;font-weight:700;color:#A02D23;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #f0e6c8;padding-bottom:4px;margin-bottom:10px}
  .row{display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px}
  .total{font-size:18px;font-weight:700;color:#A02D23;border-top:2px solid #A02D23;padding-top:12px;margin-top:10px}
  .badge{display:inline-block;background:#A02D23;color:white;padding:3px 12px;border-radius:20px;font-size:11px;margin-top:8px}
  .footer{text-align:center;margin-top:40px;font-size:11px;color:#999;border-top:1px solid #ddd;padding-top:16px}
</style></head>
<body>
<div style="text-align:center;padding-bottom:16px">
  <h1>Sri Siddheswari Peetham</h1>
  <p class="sub">Courtallam – 627 802, Tenkasi District, Tamil Nadu</p>
  <p class="sub">+91 9443184738 · feedback@srisiddheshwaripeetham.com</p>
  <div class="badge">SEVA BOOKING RECEIPT</div>
  <p class="sub" style="margin-top:8px">Booking ID: <strong>${b.id}</strong> &nbsp;|&nbsp; Issued: ${new Date(b.createdAt).toLocaleDateString('en-IN')}</p>
</div><hr/>
<div class="sec"><h2>Devotee</h2>
  <div class="row"><span>Name</span><span>${b.devotee.name}</span></div>
  <div class="row"><span>Phone</span><span>${b.devotee.phone}</span></div>
  <div class="row"><span>Email</span><span>${b.devotee.email}</span></div>
  <div class="row"><span>From</span><span>${b.devotee.city}, ${b.devotee.state}</span></div>
  ${b.devotee.gotra ? `<div class="row"><span>Gotra</span><span>${b.devotee.gotra}</span></div>` : ''}
  ${b.familyMembers.length ? `<div class="row"><span>Family</span><span>${b.familyMembers.join(', ')}</span></div>` : ''}
</div>
<div class="sec"><h2>Seva Details</h2>
  <div class="row"><span>Date</span><span>${b.date}</span></div>
  ${b.slot ? `<div class="row"><span>Slot</span><span>${b.slot.time} — ${b.slot.name}</span></div>` : ''}
  ${b.deitySevas.map(ds => `<div class="row"><span>${ds.deity.name}</span><span>${ds.seva} — ₹${ds.price.toLocaleString('en-IN')}</span></div>`).join('')}
</div>
<div class="sec total">
  <div class="row"><span>Total Paid</span><span>₹${b.total.toLocaleString('en-IN')}</span></div>
  <div class="row" style="font-size:11px;font-weight:400;color:#888"><span>Payment via</span><span>${b.paymentMethod.toUpperCase()}</span></div>
</div>
<div class="footer">
  <p>Computer-generated receipt. No signature required.</p>
  <p>Om Namah Shivaya · Om Sri Rajarajeshwaryai Namah</p>
  <p>Sri Siddheswari Peetham, Courtallam. Blessed be.</p>
</div></body></html>`;

// ── Input styles ───────────────────────────────────────────────────────────────
const inputCls = 'w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-warm-cream text-sm focus:outline-none focus:border-spiritual-gold/40 transition-colors placeholder-warm-cream/20';
const labelCls = 'block font-ui text-[9px] tracking-[0.2em] uppercase text-spiritual-gold/60 mb-1.5 font-semibold';
const selectCls = `${inputCls} appearance-none cursor-pointer`;

// ── MiniCalendar ──────────────────────────────────────────────────────────────
function MiniCalendar({
  year, month, selectedDate, onSelectDate, onPrevMonth, onNextMonth,
  today,
}: {
  year: number; month: number; selectedDate: Date | null;
  onSelectDate: (d: number) => void; onPrevMonth: () => void; onNextMonth: () => void;
  today: Date;
}) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const isPast = (d: number) => {
    const dt = new Date(year, month, d); dt.setHours(0, 0, 0, 0);
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return dt < t;
  };
  const isSelected = (d: number) =>
    !!selectedDate && selectedDate.getFullYear() === year &&
    selectedDate.getMonth() === month && selectedDate.getDate() === d;
  const isToday = (d: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
  const festivalLabel = (d: number) => FESTIVAL_DAYS[toKey(year, month, d)];

  return (
    <div>
      {/* Month header */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={onPrevMonth} className="w-7 h-7 rounded-lg flex items-center justify-center text-warm-cream/40 hover:text-spiritual-gold hover:bg-white/5 transition-all">
          <ChevronLeft size={15} />
        </button>
        <span className="font-serif text-warm-cream text-base">{MONTHS[month]} {year}</span>
        <button onClick={onNextMonth} className="w-7 h-7 rounded-lg flex items-center justify-center text-warm-cream/40 hover:text-spiritual-gold hover:bg-white/5 transition-all">
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center font-ui text-[9px] tracking-widest uppercase text-warm-cream/20 py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {Array.from({ length: totalCells }, (_, i) => {
          const day = i - firstDay + 1;
          if (day < 1 || day > daysInMonth) return <div key={i} />;
          const past = isPast(day);
          const selected = isSelected(day);
          const festival = festivalLabel(day);
          const todayDay = isToday(day);
          return (
            <button
              key={i}
              onClick={() => !past && onSelectDate(day)}
              disabled={past}
              title={festival || undefined}
              className={[
                'relative mx-auto w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all',
                selected ? 'bg-sacred-red text-white font-bold ring-2 ring-sacred-red/30' :
                  todayDay ? 'ring-1 ring-spiritual-gold/50 text-spiritual-gold font-semibold' :
                    past ? 'text-warm-cream/15 cursor-not-allowed' :
                      'text-warm-cream/70 hover:bg-white/8 hover:text-warm-cream cursor-pointer',
                festival && !selected ? 'ring-1 ring-spiritual-gold/40' : '',
              ].filter(Boolean).join(' ')}
            >
              <span className="font-ui text-[11px]">{day}</span>
              {festival && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-spiritual-gold" />
              )}
            </button>
          );
        })}
      </div>

      <p className="text-warm-cream/20 font-ui text-[8px] tracking-widest uppercase text-center mt-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-spiritual-gold/60 mr-1 align-middle" />festival days
      </p>
    </div>
  );
}

// ── SlotList ───────────────────────────────────────────────────────────────────
function SlotList({ slots, selected, onSelect }: {
  slots: TimeSlot[]; selected: TimeSlot | null; onSelect: (s: TimeSlot) => void;
}) {
  return (
    <div className="space-y-2">
      {slots.map(slot => (
        <button
          key={slot.id}
          onClick={() => slot.available && onSelect(slot)}
          disabled={!slot.available}
          className={[
            'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all',
            selected?.id === slot.id
              ? 'bg-sacred-red/20 border border-sacred-red/50 shadow-lg shadow-sacred-red/10'
              : slot.available
                ? 'bg-white/[0.04] border border-white/8 hover:bg-white/8 hover:border-spiritual-gold/25'
                : 'bg-white/[0.02] border border-white/5 opacity-40 cursor-not-allowed',
          ].join(' ')}
        >
          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${selected?.id === slot.id ? 'bg-sacred-red' : 'bg-white/8'}`}>
            <Clock size={12} className={selected?.id === slot.id ? 'text-white' : 'text-warm-cream/40'} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-warm-cream/85 text-xs font-semibold font-ui leading-none mb-0.5">{slot.time}</p>
            <p className="text-warm-cream/45 text-[10px] font-ui truncate">{slot.name}</p>
          </div>
          <div className="text-right flex-shrink-0">
            {slot.available ? (
              <span className="text-spiritual-gold font-ui text-[11px] font-bold">₹{slot.price.toLocaleString('en-IN')}</span>
            ) : (
              <span className="text-warm-cream/30 font-ui text-[9px] uppercase tracking-widest">Full</span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

// ── ScheduleView (tab) ─────────────────────────────────────────────────────────
function ScheduleView({
  year, month, selectedDate, selectedSlot,
  onPrevMonth, onNextMonth, onSelectDate, onSelectSlot, onBookSlot, today,
}: {
  year: number; month: number; selectedDate: Date | null; selectedSlot: TimeSlot | null;
  onPrevMonth: () => void; onNextMonth: () => void; onSelectDate: (d: number) => void;
  onSelectSlot: (s: TimeSlot) => void; onBookSlot: () => void; today: Date;
}) {
  const slots = selectedDate ? getSlotsForDate(selectedDate) : [];

  return (
    <motion.div key="schedule-tab" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="px-5 pt-4 pb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar */}
        <div>
          <p className="font-ui text-[9px] tracking-[0.25em] uppercase text-spiritual-gold/50 font-semibold mb-3">Select Date</p>
          <MiniCalendar year={year} month={month} selectedDate={selectedDate}
            onSelectDate={onSelectDate} onPrevMonth={onPrevMonth} onNextMonth={onNextMonth} today={today} />
        </div>

        {/* Slots */}
        <div>
          <p className="font-ui text-[9px] tracking-[0.25em] uppercase text-spiritual-gold/50 font-semibold mb-3">
            {selectedDate ? `Slots — ${selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : 'Available Slots'}
          </p>
          {selectedDate ? (
            <>
              <SlotList slots={slots} selected={selectedSlot} onSelect={onSelectSlot} />
              {selectedSlot && (
                <button
                  onClick={onBookSlot}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-ui text-[10px] tracking-widest uppercase font-bold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg,#A02D23,#7a2018)', border: '1px solid rgba(212,175,55,0.25)' }}
                >
                  Book This Slot <ArrowRight size={13} />
                </button>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <Calendar size={28} className="text-warm-cream/15" />
              <p className="text-warm-cream/25 font-ui text-[10px] tracking-widest uppercase">Pick a date to see slots</p>
            </div>
          )}
        </div>
      </div>

      {/* Daily schedule */}
      <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(212,175,55,0.1)' }}>
        <p className="font-ui text-[9px] tracking-[0.25em] uppercase text-spiritual-gold/50 font-semibold mb-3">Daily Temple Schedule</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { time: '5:30 AM', name: 'Suprabhatam' }, { time: '6:00 AM', name: 'Abhishekam' },
            { time: '7:30 AM', name: 'Alankaram' }, { time: '12:00 PM', name: 'Madhyahna Puja' },
            { time: '6:00 PM', name: 'Sandhya Arati' }, { time: '8:00 PM', name: 'Sayana Arati' },
          ].map(s => (
            <div key={s.name} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.08)' }}>
              <span className="text-spiritual-gold font-ui text-[10px] font-bold w-14 flex-shrink-0">{s.time}</span>
              <span className="text-warm-cream/50 font-ui text-[10px]">{s.name}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Confirmation screen ────────────────────────────────────────────────────────
function ConfirmationScreen({ booking, onDownload, onClose }: {
  booking: BookingRecord; onDownload: () => void; onClose: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="px-5 py-8 flex flex-col items-center">
      <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4 ring-4 ring-emerald-500/20">
        <CheckCircle2 size={32} className="text-emerald-400" />
      </div>
      <h3 className="font-serif text-2xl text-warm-cream mb-1">Booking Confirmed!</h3>
      <p className="text-warm-cream/40 font-ui text-[10px] tracking-widest uppercase mb-5">
        Booking ID: <span className="text-spiritual-gold font-bold">{booking.id}</span>
      </p>

      {/* Summary card */}
      <div className="w-full rounded-2xl p-4 mb-5 space-y-2" style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
        <div className="flex justify-between text-sm">
          <span className="text-warm-cream/40">Date</span>
          <span className="text-warm-cream/80 font-medium text-right max-w-[60%]">{booking.date}</span>
        </div>
        {booking.slot && (
          <div className="flex justify-between text-sm">
            <span className="text-warm-cream/40">Slot</span>
            <span className="text-warm-cream/80">{booking.slot.time} — {booking.slot.name}</span>
          </div>
        )}
        {booking.deitySevas.map((ds, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-warm-cream/40 truncate max-w-[45%]">{ds.deity.name}</span>
            <span className="text-warm-cream/80">{ds.seva}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm pt-2" style={{ borderTop: '1px solid rgba(212,175,55,0.12)' }}>
          <span className="text-spiritual-gold font-bold font-ui text-[10px] uppercase tracking-widest">Total Paid</span>
          <span className="text-spiritual-gold font-bold">₹{booking.total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Booking info */}
      <div className="w-full mb-6 flex items-center gap-2.5 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.18)' }}>
        <Phone size={13} className="text-spiritual-gold/60 flex-shrink-0" />
        <p className="text-warm-cream/50 font-ui text-[9px] leading-relaxed">
          Show your Booking ID <span className="text-spiritual-gold font-bold">{booking.id}</span> at the temple on the day of seva.
        </p>
      </div>

      <div className="flex gap-3 w-full">
        <button onClick={onDownload} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-ui text-[10px] tracking-widest uppercase font-bold text-spiritual-gold transition-all"
          style={{ border: '1px solid rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.07)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.14)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.07)')}>
          <Download size={13} /> Download Receipt
        </button>
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-ui text-[10px] tracking-widest uppercase font-bold text-white transition-all"
          style={{ background: 'linear-gradient(135deg,#A02D23,#7a2018)', border: '1px solid rgba(212,175,55,0.2)' }}>
          Done 🙏
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────────────────
export default function SevaBookingModal({ isOpen, onClose, initialDeity, mode = 'book' }: SevaBookingModalProps) {
  const today = new Date();

  // Calendar state
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null); // Main slot if only one seva
  
  // Tab
  const [activeTab, setActiveTab] = useState<'schedule' | 'book'>(mode);

  // Picker state for step 1
  const [selectedDeity, setSelectedDeity] = useState<DeityData>(ALL_DEITIES[0]);

  // Seva type: online = no temple visit, offline = visit required
  const [sevaType, setSevaType] = useState<'online' | 'offline'>('offline');

  // Booking state
  const [deitySevas, setDeitySevas] = useState<DeitySevaSelection[]>(() => {
    if (!initialDeity) return [];
    const d: DeityData = initialDeity.sevas.length > 0
      ? initialDeity
      : ALL_DEITIES.find(x => x.id === initialDeity.id) ?? { ...initialDeity, sevas: ['Abhishekam'] };
    return [{ deity: d, seva: d.sevas[0], price: SEVA_PRICES[d.sevas[0]] || 251 }];
  });

  useEffect(() => {
    if (!isOpen) return;
    if (initialDeity) {
      // If the passed deity has no sevas (empty array from App.tsx DEITIES), look up from ALL_DEITIES
      const deityData: DeityData = initialDeity.sevas.length > 0
        ? initialDeity
        : ALL_DEITIES.find(d => d.id === initialDeity.id) ?? { ...initialDeity, sevas: ['Abhishekam'] };
      setDeitySevas([{ deity: deityData, seva: deityData.sevas[0], price: SEVA_PRICES[deityData.sevas[0]] || 251 }]);
    } else {
      setDeitySevas([]);
    }
    setCurrentBookingStep(1);
    setSelectedDate(null);
    setSelectedSlot(null);
    setSevaType('offline');
  }, [isOpen, initialDeity?.id]);

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', city: '', state: '', gotra: '' });
  const [familyMembers, setFamilyMembers] = useState<string[]>(['']);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | 'rupay' | ''>('');
  const [selectedBank, setSelectedBank] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [currentBookingStep, setCurrentBookingStep] = useState(1);

  const formatCardNum = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 16);
    return d.match(/.{1,4}/g)?.join(' ') ?? d;
  };
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  // Payment
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [bookingRecord, setBookingRecord] = useState<BookingRecord | null>(null);

  // Calendar callbacks
  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };
  const handleSelectDate = (day: number) => {
    const d = new Date(calYear, calMonth, day);
    const t = new Date(); t.setHours(0, 0, 0, 0);
    if (d < t) return;
    setSelectedDate(new Date(calYear, calMonth, day));
    setSelectedSlot(null);
  };

  // Deity management
  const addDeity = () => {
    const unused = ALL_DEITIES.find(d => !deitySevas.some(ds => ds.deity.id === d.id));
    if (unused) setDeitySevas(p => [...p, { deity: unused, seva: unused.sevas[0] || '', price: SEVA_PRICES[unused.sevas[0]] || 251 }]);
  };
  const removeDeity = (idx: number) => setDeitySevas(p => p.filter((_, i) => i !== idx));
  const updateDeity = (idx: number, deityId: string) => {
    const deity = ALL_DEITIES.find(d => d.id === deityId)!;
    setDeitySevas(p => p.map((ds, i) => i !== idx ? ds : { deity, seva: deity.sevas[0] || '', price: SEVA_PRICES[deity.sevas[0]] || 251 }));
  };
  const updateSeva = (idx: number, seva: string) =>
    setDeitySevas(p => p.map((ds, i) => i !== idx ? ds : { ...ds, seva, price: SEVA_PRICES[seva] || 251, slot: undefined }));

  const updateSlot = (idx: number, slot: TimeSlot) =>
    setDeitySevas(p => p.map((ds, i) => i !== idx ? ds : { ...ds, slot }));

  // Family
  const addMember = () => setFamilyMembers(p => [...p, '']);
  const removeMember = (idx: number) => setFamilyMembers(p => p.filter((_, i) => i !== idx));
  const updateMember = (idx: number, val: string) => setFamilyMembers(p => p.map((m, i) => i === idx ? val : m));

  // Total
  const total = deitySevas.reduce((s, ds) => s + ds.price, 0);

  // Validation per step
  const isStepValid = useCallback(() => {
    switch (currentBookingStep) {
      case 1: return deitySevas.length > 0 && deitySevas.every(ds => ds.seva);
      case 2: {
        if (!selectedDate) return false;
        if (sevaType === 'online') return true;
        return deitySevas.every(ds => ds.slot);
      }
      case 3: return !!(formData.name && formData.email && formData.phone && formData.city && formData.state);
      case 4: return true;
      case 5: {
        if (sevaType === 'offline') {
          if (!selectedDate) return false;
          // Check if any slot is past
          const anyPast = deitySevas.some(ds => ds.slot && isSlotPast(ds.slot.time, selectedDate));
          if (anyPast) return false;
        }
        if (paymentMethod === 'card') return (
          cardType !== '' &&
          cardNum.replace(/\s/g, '').length === 16 &&
          cardName.trim().length > 0 &&
          cardExpiry.length === 5 &&
          cardCvv.length >= 3
        );
        if (paymentMethod === 'netbanking') return selectedBank !== '';
        return true;
      }
      default: return true;
    }
  }, [currentBookingStep, sevaType, selectedDate, deitySevas, formData, paymentMethod, upiId, cardType, cardNum, cardName, cardExpiry, cardCvv, selectedBank, selectedSlot]);

  // Payment handler
  const handlePayment = useCallback(async () => {
    setPaymentProcessing(true);
    setPaymentError('');
    await new Promise(r => setTimeout(r, 2200));
    const bookingDate = selectedDate ?? today;
    const isoDate = bookingDate.toISOString().split('T')[0];
    const enrichedMethod = paymentMethod === 'card'
      ? `${cardType}-card`
      : paymentMethod === 'netbanking'
      ? `${selectedBank}-netbanking`
      : 'upi';
    const record: BookingRecord = {
      id: generateBookingId(),
      date: formatDisplayDate(bookingDate),
      dateIso: isoDate,
      sevaType,
      slot: sevaType === 'online' ? null : (deitySevas[0]?.slot || null),
      deitySevas,
      devotee: formData,
      familyMembers: familyMembers.filter(f => f.trim()),
      total,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      paymentMethod: enrichedMethod,
    };
    try {
      await saveBookingToSupabase(record);
      setBookingRecord(record);
    } catch (err: any) {
      setPaymentError(err?.message ?? 'Booking could not be saved. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  }, [selectedDate, selectedSlot, sevaType, deitySevas, formData, familyMembers, total, paymentMethod]);

  const downloadReceipt = () => {
    if (!bookingRecord) return;
    downloadBookingPDF(bookingRecord);
  };

  const slots = selectedDate ? getFilteredSlots(selectedDate, deitySevas) : [];
  const nextBtnText = currentBookingStep === 5 ? `Pay ₹${total.toLocaleString('en-IN')}` : 'Continue';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="relative w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-3xl flex flex-col"
          style={{
            background: 'linear-gradient(175deg, #0f0603 0%, #1c0b05 40%, #2d1209 100%)',
            border: '1px solid rgba(212,175,55,0.2)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.65)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
            <div>
              <p className="font-ui text-[8px] tracking-[0.3em] uppercase text-spiritual-gold/50 mb-0.5">Sri Siddheswari Peetham</p>
              <h2 className="font-serif text-warm-cream text-lg leading-tight">Seva Booking</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-warm-cream/30 hover:text-warm-cream transition-colors" style={{ border: '1px solid rgba(212,175,55,0.12)' }}>
              <X size={15} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex px-5 pt-3 gap-2 flex-shrink-0">
            {([['schedule', 'View Schedule', Calendar], ['book', 'Book Seva', ArrowRight]] as const).map(([tab, label, Icon]) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-ui text-[9px] tracking-widest uppercase font-semibold transition-all"
                style={activeTab === tab ? { background: 'rgba(160,45,35,0.2)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' } : { background: 'rgba(255,255,255,0.03)', color: 'rgba(253,251,247,0.35)', border: '1px solid rgba(212,175,55,0.08)' }}>
                <Icon size={11} />{label}
              </button>
            ))}
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto overscroll-contain" data-lenis-prevent>
            <AnimatePresence mode="wait">
              {activeTab === 'schedule' ? (
                <ScheduleView key="sched"
                  year={calYear} month={calMonth} selectedDate={selectedDate} selectedSlot={selectedSlot}
                  onPrevMonth={prevMonth} onNextMonth={nextMonth} onSelectDate={handleSelectDate}
                  onSelectSlot={setSelectedSlot}
                  onBookSlot={() => setActiveTab('book')}
                  today={today}
                />
              ) : bookingRecord ? (
                <ConfirmationScreen key="confirm" booking={bookingRecord} onDownload={downloadReceipt} onClose={onClose} />
              ) : (
                <motion.div key="booking" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                  {paymentProcessing && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4" style={{ background: 'rgba(15,6,3,0.85)', backdropFilter: 'blur(4px)' }}>
                      <Loader2 size={36} className="text-spiritual-gold animate-spin" />
                      <p className="font-serif text-warm-cream text-lg">Processing Payment…</p>
                      <p className="text-warm-cream/30 font-ui text-[10px] tracking-widest uppercase">Please wait, do not close</p>
                    </div>
                  )}
                  {paymentError && (
                    <div className="mx-5 mt-4 flex items-start gap-2.5 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                      <AlertCircle size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-400/90 font-ui text-[9px] font-bold uppercase tracking-widest mb-0.5">Booking Failed</p>
                        <p className="text-red-400/70 font-ui text-[9px] leading-relaxed">{paymentError}</p>
                      </div>
                    </div>
                  )}
                  <Stepper
                    initialStep={1}
                    onStepChange={setCurrentBookingStep}
                    onFinalStepCompleted={handlePayment}
                    backButtonText="Previous"
                    nextButtonText={nextBtnText}
                    nextButtonProps={{ disabled: !isStepValid() }}
                    disableStepIndicators={false}
                  >
                    {/* ── Step 1: Deity & Seva ── */}
                    <Step>
                      <div className="pb-2">
                        <h3 className="font-serif text-warm-cream text-base mb-1">Seva Details</h3>
                        <p className="text-warm-cream/35 font-ui text-[9px] uppercase tracking-widest mb-4">Choose seva mode and deities for your booking</p>

                        {/* Online / Offline toggle */}
                        <div className="grid grid-cols-2 gap-3 mb-5">
                          {([
                            { type: 'offline' as const, label: 'Visit Temple', desc: 'Attend in person. Select date & slot.', Icon: Building },
                            { type: 'online' as const,  label: 'Online Seva',  desc: 'Priests perform on your behalf. No visit needed.', Icon: Wifi },
                          ]).map(({ type, label, desc, Icon }) => (
                            <button key={type} onClick={() => setSevaType(type)}
                              className="flex flex-col items-start gap-2 p-3 rounded-xl text-left transition-all"
                              style={sevaType === type
                                ? { background: 'rgba(160,45,35,0.18)', border: '1px solid rgba(160,45,35,0.5)' }
                                : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.1)' }}>
                              <div className="flex items-center gap-2">
                                <Icon size={14} className={sevaType === type ? 'text-spiritual-gold' : 'text-warm-cream/30'} />
                                <span className={`font-ui text-[10px] font-bold uppercase tracking-widest ${sevaType === type ? 'text-spiritual-gold' : 'text-warm-cream/40'}`}>{label}</span>
                              </div>
                              <p className="text-warm-cream/35 font-ui text-[9px] leading-relaxed">{desc}</p>
                            </button>
                          ))}
                        </div>

                        <div className="p-4 rounded-2xl mb-5 space-y-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.15)' }}>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className={labelCls}>Select Deity</label>
                              <select value={selectedDeity.id} onChange={e => {
                                const d = ALL_DEITIES.find(x => x.id === e.target.value)!;
                                setSelectedDeity(d);
                              }} className={selectCls}>
                                {ALL_DEITIES.map(d => (
                                  <option key={d.id} value={d.id} style={{ background: '#1c0b05' }}>{d.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className={labelCls}>Select Seva</label>
                              <select 
                                className={selectCls}
                                onChange={e => {
                                  const s = e.target.value;
                                  if (!s) return;
                                  setDeitySevas(p => [...p, { deity: selectedDeity, seva: s, price: SEVA_PRICES[s] || 251 }]);
                                  e.target.value = '';
                                }}
                              >
                                <option value="" style={{ background: '#1c0b05' }}>Choose Seva...</option>
                                {selectedDeity.sevas.map(s => (
                                  <option key={s} value={s} disabled={deitySevas.some(ds => ds.deity.id === selectedDeity.id && ds.seva === s)} style={{ background: '#1c0b05' }}>
                                    {s} — ₹{(SEVA_PRICES[s] || 251).toLocaleString('en-IN')}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {deitySevas.length > 0 && (
                            <div className="space-y-2 pt-2" style={{ borderTop: '1px solid rgba(212,175,55,0.08)' }}>
                              {deitySevas.map((ds, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                                  <div className="min-w-0">
                                    <p className="font-ui text-[8px] uppercase tracking-widest text-spiritual-gold/60 mb-0.5">{ds.deity.name}</p>
                                    <p className="text-warm-cream/80 text-xs font-medium truncate">{ds.seva}</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-spiritual-gold font-ui text-[10px] font-bold">₹{ds.price.toLocaleString('en-IN')}</span>
                                    <button onClick={() => removeDeity(idx)} className="text-warm-cream/20 hover:text-sacred-red transition-colors p-1">
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <p className="text-warm-cream/20 font-ui text-[8px] tracking-[0.2em] uppercase text-center">
                          Total: <span className="text-spiritual-gold font-bold text-[10px]">₹{total.toLocaleString('en-IN')}</span>
                        </p>
                      </div>
                    </Step>

                    {/* ── Step 2: Date & Slot ── */}
                    <Step>
                      <div className="pb-2">
                        <h3 className="font-serif text-warm-cream text-base mb-1">When will you visit?</h3>
                        <p className="text-warm-cream/35 font-ui text-[9px] uppercase tracking-widest mb-4">Pick a date and slots for your sevas</p>

                        {/* Online info banner */}
                        {sevaType === 'online' && (
                          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
                              <Wifi size={24} className="text-emerald-400" />
                            </div>
                            <h4 className="text-warm-cream font-serif text-lg mb-2">Online Seva Selection</h4>
                            <p className="text-warm-cream/40 font-ui text-[10px] leading-relaxed max-w-xs mx-auto uppercase tracking-widest">
                              Priests will perform the sankalpa on your behalf. No date or time selection is required for online sevas.
                            </p>
                          </div>
                        )}

                        {sevaType === 'offline' && (
                          <div className="space-y-6">
                            <div>
                              <p className="font-ui text-[9px] tracking-[0.2em] uppercase text-spiritual-gold/50 font-semibold mb-3">Select Date</p>
                              <MiniCalendar year={calYear} month={calMonth} selectedDate={selectedDate}
                                onSelectDate={handleSelectDate} onPrevMonth={prevMonth} onNextMonth={nextMonth} today={today} />
                            </div>
                            
                            {selectedDate && (
                              <div className="space-y-4 pt-4" style={{ borderTop: '1px solid rgba(212,175,55,0.1)' }}>
                                <p className="font-ui text-[9px] tracking-[0.2em] uppercase text-spiritual-gold/50 font-semibold">Assign Slots</p>
                                {deitySevas.map((ds, idx) => {
                                  const recommended = getFilteredSlots(selectedDate, [ds]);
                                  return (
                                    <div key={idx} className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <p className="text-warm-cream/60 font-ui text-[9px] uppercase tracking-widest">
                                          {ds.deity.name.split(' ').slice(-1)[0]} · {ds.seva}
                                        </p>
                                        {ds.slot && (
                                          <span className="text-spiritual-gold font-ui text-[9px] font-bold">Selected</span>
                                        )}
                                      </div>
                                      <SlotList 
                                        slots={recommended} 
                                        selected={ds.slot || null} 
                                        onSelect={(s) => updateSlot(idx, s)} 
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {!selectedDate && (
                              <div className="flex flex-col items-center justify-center py-10 opacity-20">
                                <Calendar size={32} />
                                <p className="text-[9px] uppercase tracking-widest mt-3 font-ui">Pick a date to see available slots</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Step>

                    {/* ── Step 3: Devotee Details ── */}
                    <Step>
                      <div className="pb-2">
                        <h3 className="font-serif text-warm-cream text-base mb-1">Devotee Details</h3>
                        <p className="text-warm-cream/35 font-ui text-[9px] uppercase tracking-widest mb-4">Your information for the seva sankalpa</p>
                        <div className="space-y-3">
                          <div>
                            <label className={labelCls}>Full Name *</label>
                            <div className="relative">
                              <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-cream/25" />
                              <input className={`${inputCls} pl-8`} placeholder="Your full name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className={labelCls}>Email *</label>
                              <div className="relative">
                                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-cream/25" />
                                <input type="email" className={`${inputCls} pl-8`} placeholder="your@email.com" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} />
                              </div>
                            </div>
                            <div>
                              <label className={labelCls}>Phone *</label>
                              <div className="relative">
                                <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-cream/25" />
                                <input type="tel" className={`${inputCls} pl-8`} placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} />
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className={labelCls}>City *</label>
                              <div className="relative">
                                <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-cream/25" />
                                <input className={`${inputCls} pl-8`} placeholder="Your city" value={formData.city} onChange={e => setFormData(f => ({ ...f, city: e.target.value }))} />
                              </div>
                            </div>
                            <div>
                              <label className={labelCls}>State *</label>
                              <select className={selectCls} value={formData.state} onChange={e => setFormData(f => ({ ...f, state: e.target.value }))}>
                                <option value="" disabled style={{ background: '#1c0b05' }}>Select state</option>
                                {INDIAN_STATES.map(s => <option key={s} value={s} style={{ background: '#1c0b05' }}>{s}</option>)}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className={labelCls}>Gotra <span className="text-warm-cream/20">(optional)</span></label>
                            <input className={inputCls} placeholder="Your gotra (if known)" value={formData.gotra} onChange={e => setFormData(f => ({ ...f, gotra: e.target.value }))} />
                          </div>
                        </div>
                      </div>
                    </Step>

                    {/* ── Step 4: Family Members ── */}
                    <Step>
                      <div className="pb-2">
                        <h3 className="font-serif text-warm-cream text-base mb-1">Family Members</h3>
                        <p className="text-warm-cream/35 font-ui text-[9px] uppercase tracking-widest mb-4">
                          Names of family members for whom the seva is performed <span className="text-warm-cream/20">(optional)</span>
                        </p>
                        <div className="space-y-2">
                          {familyMembers.map((member, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <Heart size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-cream/20" />
                                <input
                                  className={`${inputCls} pl-8`}
                                  placeholder={`Member ${idx + 1} name`}
                                  value={member}
                                  onChange={e => updateMember(idx, e.target.value)}
                                />
                              </div>
                              {familyMembers.length > 1 && (
                                <button onClick={() => removeMember(idx)} className="w-8 h-8 flex items-center justify-center text-warm-cream/25 hover:text-sacred-red transition-colors flex-shrink-0">
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        {familyMembers.length < 10 && (
                          <button onClick={addMember} className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-ui text-[10px] tracking-widest uppercase font-semibold text-warm-cream/30 hover:text-warm-cream/60 hover:bg-white/3 transition-all" style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
                            <Plus size={12} /> Add Family Member
                          </button>
                        )}
                        <p className="text-warm-cream/20 font-ui text-[9px] tracking-widest uppercase text-center mt-4">
                          Leave blank to skip — seva is performed in your name
                        </p>
                      </div>
                    </Step>

                    {/* ── Step 5: Review & Pay ── */}
                    <Step>
                      <div className="pb-2">
                        <h3 className="font-serif text-warm-cream text-base mb-1">Review & Pay</h3>
                        <p className="text-warm-cream/35 font-ui text-[9px] uppercase tracking-widest mb-4">Confirm your booking details</p>

                        {/* Slot expiry warning */}
                        {sevaType === 'offline' && selectedSlot && selectedDate && isSlotPast(selectedSlot.time, selectedDate) && (
                          <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl mb-4"
                            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                            <AlertCircle size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-red-400/90 font-ui text-[9px] font-bold uppercase tracking-widest mb-0.5">Slot Time Expired</p>
                              <p className="text-red-400/70 font-ui text-[9px] leading-relaxed">
                                The <span className="font-bold">{selectedSlot.time} — {selectedSlot.name}</span> slot has already passed.
                                Please go back to Step 1 and choose a different slot.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Summary */}
                        <div className="rounded-xl p-4 mb-5 space-y-3" style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.12)' }}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className={labelCls}>Date & Mode</p>
                              <p className="text-warm-cream/80 text-sm font-medium">{selectedDate ? formatDisplayDate(selectedDate) : 'Not selected'}</p>
                              <p className="text-spiritual-gold/60 font-ui text-[9px] uppercase tracking-widest mt-1">
                                {sevaType === 'online' ? 'Online Seva' : 'Temple Visit'}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="inline-block px-2.5 py-1 rounded-lg font-ui text-[8px] font-bold uppercase tracking-widest"
                                style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                                Status: Confirmed
                              </span>
                            </div>
                          </div>

                          <div className="pt-3" style={{ borderTop: '1px solid rgba(212,175,55,0.08)' }}>
                            <div className="flex justify-between items-center mb-2">
                              <p className={labelCls}>Sevas & Slots</p>
                              <button 
                                onClick={() => setCurrentBookingStep(1)}
                                className="text-spiritual-gold/40 hover:text-spiritual-gold font-ui text-[8px] uppercase tracking-widest transition-colors"
                              >
                                Change Seva
                              </button>
                            </div>
                            <div className="space-y-2">
                              {deitySevas.map((ds, i) => (
                                <div key={i} className="flex justify-between items-center text-xs">
                                  <div className="min-w-0">
                                    <p className="text-warm-cream/70 font-medium truncate">{ds.deity.name.split(' ').slice(-1)[0]} · {ds.seva}</p>
                                    {sevaType === 'offline' && ds.slot && (
                                      <p className="text-warm-cream/30 text-[9px] uppercase tracking-widest">{ds.slot.time} — {ds.slot.name}</p>
                                    )}
                                  </div>
                                  <p className="text-warm-cream/80 ml-3">₹{ds.price.toLocaleString('en-IN')}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="pt-3" style={{ borderTop: '1px solid rgba(212,175,55,0.15)' }}>
                            <div className="flex justify-between items-center">
                              <p className="text-spiritual-gold font-bold font-ui text-[10px] uppercase tracking-widest">Total Amount</p>
                              <p className="text-spiritual-gold font-bold text-lg">₹{total.toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        </div>

                        {/* Payment method */}
                        <p className={labelCls}>Payment Method</p>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {/* UPI */}
                          <button onClick={() => { setPaymentMethod('upi'); setCardType(''); setSelectedBank(''); }}
                            className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all"
                            style={paymentMethod === 'upi' ? { background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.35)' } : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1280px-UPI-Logo-vector.svg.png"
                              alt="UPI" className="h-5 w-auto object-contain transition-all"
                              style={{ filter: paymentMethod === 'upi' ? 'none' : 'grayscale(1) brightness(0.45)' }} />
                            <span className={`font-ui text-[8px] tracking-widest uppercase ${paymentMethod === 'upi' ? 'text-spiritual-gold' : 'text-warm-cream/30'}`}>UPI</span>
                          </button>
                          {/* Card */}
                          <button onClick={() => { setPaymentMethod('card'); setSelectedBank(''); }}
                            className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all"
                            style={paymentMethod === 'card' ? { background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.35)' } : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <CreditCard size={18} className={paymentMethod === 'card' ? 'text-spiritual-gold' : 'text-warm-cream/30'} />
                            <span className={`font-ui text-[8px] tracking-widest uppercase ${paymentMethod === 'card' ? 'text-spiritual-gold' : 'text-warm-cream/30'}`}>Card</span>
                          </button>
                          {/* Net Banking */}
                          <button onClick={() => { setPaymentMethod('netbanking'); setCardType(''); }}
                            className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all"
                            style={paymentMethod === 'netbanking' ? { background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.35)' } : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <Building2 size={18} className={paymentMethod === 'netbanking' ? 'text-spiritual-gold' : 'text-warm-cream/30'} />
                            <span className={`font-ui text-[8px] tracking-widest uppercase ${paymentMethod === 'netbanking' ? 'text-spiritual-gold' : 'text-warm-cream/30'}`}>Net Banking</span>
                          </button>
                        </div>

                        {/* ── UPI ── */}
                        {paymentMethod === 'upi' && (
                          <div className="space-y-2">
                            <label className={labelCls}>UPI ID *</label>
                            <input className={inputCls} placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value)} />
                            <p className="text-warm-cream/20 font-ui text-[8px] uppercase tracking-widest">e.g. 9443184738@paytm · yourname@ybl · name@okaxis</p>
                          </div>
                        )}

                        {/* ── Card ── */}
                        {paymentMethod === 'card' && (
                          <div className="space-y-3">
                            <div>
                              <p className={labelCls}>Card Network *</p>
                              <div className="grid grid-cols-3 gap-2">
                                {CARD_NETWORKS.map(cn => (
                                  <button key={cn.id} onClick={() => setCardType(cn.id)}
                                    className="flex flex-col items-center gap-1.5 py-2 px-2 rounded-xl transition-all"
                                    style={cardType === cn.id
                                      ? { border: '2px solid rgba(212,175,55,0.6)', background: 'rgba(212,175,55,0.08)' }
                                      : { border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                                    {cn.id === 'visa' && (
                                      <div className="w-full flex items-center justify-center h-7 rounded" style={{ background: '#1A1F71' }}>
                                        <span className="text-white font-bold italic text-sm" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>VISA</span>
                                      </div>
                                    )}
                                    {cn.id === 'mastercard' && (
                                      <div className="flex items-center justify-center h-7 w-full rounded" style={{ background: '#1c1c1c' }}>
                                        <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: '#EB001B' }} />
                                        <div className="w-5 h-5 rounded-full flex-shrink-0 -ml-2.5" style={{ background: '#F79E1B' }} />
                                      </div>
                                    )}
                                    {cn.id === 'rupay' && (
                                      <div className="w-full flex items-center justify-center h-7 rounded" style={{ background: 'linear-gradient(135deg,#1B4893,#00A650)' }}>
                                        <span className="text-white font-bold text-xs tracking-wide">RuPay</span>
                                      </div>
                                    )}
                                    <span className="text-warm-cream/45 font-ui text-[8px] tracking-widest uppercase">{cn.label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className={labelCls}>Card Number *</label>
                              <input className={inputCls} placeholder="0000 0000 0000 0000" value={cardNum}
                                onChange={e => setCardNum(formatCardNum(e.target.value))} maxLength={19} />
                            </div>
                            <div>
                              <label className={labelCls}>Name on Card *</label>
                              <input className={inputCls} placeholder="As printed on card" value={cardName}
                                onChange={e => setCardName(e.target.value.toUpperCase())} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className={labelCls}>Expiry *</label>
                                <input className={inputCls} placeholder="MM/YY" value={cardExpiry}
                                  onChange={e => setCardExpiry(formatExpiry(e.target.value))} maxLength={5} />
                              </div>
                              <div>
                                <label className={labelCls}>CVV *</label>
                                <input className={inputCls} placeholder="•••" type="password" value={cardCvv}
                                  onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} />
                              </div>
                            </div>
                            <p className="text-warm-cream/15 font-ui text-[8px] uppercase tracking-widest">Your card details are encrypted and secure</p>
                          </div>
                        )}

                        {/* ── Net Banking ── */}
                        {paymentMethod === 'netbanking' && (
                          <div className="space-y-2">
                            <p className={labelCls}>Select Your Bank *</p>
                            <div className="grid grid-cols-3 gap-2">
                              {INDIAN_BANKS.map(bank => (
                                <button key={bank.id} onClick={() => setSelectedBank(bank.id)}
                                  className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all"
                                  style={selectedBank === bank.id
                                    ? { border: '2px solid rgba(212,175,55,0.6)', background: 'rgba(212,175,55,0.08)' }
                                    : { border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                                  <div className="w-full h-7 rounded flex items-center justify-center font-bold text-white text-[11px] tracking-wide"
                                    style={{ background: bank.color }}>
                                    {bank.short}
                                  </div>
                                  <span className="text-warm-cream/35 font-ui text-[7px] tracking-wider uppercase text-center leading-tight mt-0.5">
                                    {bank.name.split(' ').slice(0, 2).join(' ')}
                                  </span>
                                </button>
                              ))}
                            </div>
                            {selectedBank && (() => {
                              const b = INDIAN_BANKS.find(x => x.id === selectedBank)!;
                              return (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                  <div className="w-5 h-5 rounded flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0"
                                    style={{ background: b.color }}>{b.short.slice(0, 1)}</div>
                                  <span className="text-emerald-400/70 font-ui text-[9px] tracking-wider">{b.name} selected</span>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </Step>
                  </Stepper>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
