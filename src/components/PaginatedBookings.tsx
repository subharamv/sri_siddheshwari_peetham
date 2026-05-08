import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, RefreshCw, ChevronDown, ChevronUp, Loader2,
  ChevronRight, ChevronLeft, Wifi, Building, Download, X,
  Save, Ban, Edit2,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────

interface Booking {
  id: string;
  devotee_phone: string;
  seva_date: string;
  seva_date_iso: string | null;
  seva_type: string;
  slot_id: string | null;
  slot_time: string | null;
  slot_name: string | null;
  slot_price: number;
  family_members: string[];
  total: number;
  payment_method: string;
  payment_status: string;
  attendance_status: string;
  checked_in_at: string | null;
  created_at: string;
  devotee?: { name: string; email: string; city: string; state: string };
  booking_deity_sevas?: { deity_name: string; seva_name: string; price: number }[];
}

type BookingTab = 'active' | 'completed' | 'online_active';
type DateFilter = 'all' | 'today' | 'yesterday' | 'past7' | 'month' | 'custom';
type ViewMode = 'list' | 'calendar';

const BOOKING_TABS: { id: BookingTab; label: string; desc: string }[] = [
  { id: 'active', label: 'Active Bookings', desc: 'Confirmed · Pending attendance' },
  { id: 'completed', label: 'Completed / Attended', desc: 'Attended or absent' },
  { id: 'online_active', label: 'Online Seva Active', desc: 'Online sevas · Not yet attended' },
];

const DATE_PRESETS: { id: DateFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'past7', label: 'Past 7 Days' },
  { id: 'month', label: 'This Month' },
  { id: 'custom', label: 'Custom' },
];

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS_SHORT = ['Su','Mo','Tu','We','Th','Fr','Sa'];

// ── Utilities ─────────────────────────────────────────────────────────────────

function isoToday() { return new Date().toISOString().split('T')[0]; }
function isoOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
function isoMonthStart() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function exportCSV(rows: Booking[], filename: string) {
  const headers = [
    'Booking ID','Devotee Name','Phone','Email','Seva Date','Type',
    'Slot Time','Slot Name','Slot Price','Total','Payment Status',
    'Attendance Status','Sevas','Booked At',
  ];
  const data = rows.map(b => [
    b.id,
    b.devotee?.name ?? '',
    b.devotee_phone,
    b.devotee?.email ?? '',
    b.seva_date,
    b.seva_type,
    b.slot_time ?? '',
    b.slot_name ?? '',
    b.slot_price,
    b.total,
    b.payment_status,
    b.attendance_status,
    (b.booking_deity_sevas ?? []).map(ds => `${ds.deity_name} - ${ds.seva_name} (₹${ds.price})`).join('; '),
    new Date(b.created_at).toLocaleString('en-IN'),
  ]);
  const csv = [headers, ...data]
    .map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Badges ───────────────────────────────────────────────────────────────

const AttendanceBadge = ({ status }: { status: string }) => {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    attended: { bg: '#14532d22', text: '#4ade80', label: 'Attended' },
    not_attended: { bg: '#7f1d1d22', text: '#f87171', label: 'Absent' },
    pending: { bg: '#78350f22', text: '#fbbf24', label: 'Pending' },
  };
  const c = map[status] ?? map.pending;
  return (
    <span className="px-2 py-0.5 rounded-full font-ui text-[10px] tracking-wider uppercase" style={{ background: c.bg, color: c.text }}>
      {c.label}
    </span>
  );
};

const PaymentBadge = ({ status }: { status: string }) => {
  const ok = status === 'confirmed';
  return (
    <span className="px-2 py-0.5 rounded-full font-ui text-[10px] tracking-wider uppercase" style={{ background: ok ? '#14532d22' : '#78350f22', color: ok ? '#4ade80' : '#fbbf24' }}>
      {ok ? 'Confirmed' : status}
    </span>
  );
};

const BookingTypeBadge = ({ type }: { type: string }) => {
  const online = type === 'online';
  return (
    <span
      className="px-2 py-0.5 rounded-full font-ui text-[10px] tracking-wider uppercase flex items-center gap-1"
      style={{
        background: online ? 'rgba(16,185,129,0.12)' : 'rgba(59,130,246,0.12)',
        color: online ? '#34d399' : '#60a5fa',
      }}
    >
      {online ? <Wifi size={9} /> : <Building size={9} />}
      {online ? 'Online' : 'Offline'}
    </span>
  );
};

// ── Calendar View ─────────────────────────────────────────────────────────────

function BookingCalendar({
  bookings,
  onExportDay,
}: {
  bookings: Booking[];
  onExportDay: (date: string, rows: Booking[]) => void;
}) {
  const today = isoToday();
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [localBookings, setLocalBookings] = useState<Booking[]>(bookings);

  useEffect(() => { setLocalBookings(bookings); }, [bookings]);

  const updateAttendance = async (id: string, status: string) => {
    setUpdatingId(id);
    await supabase.from('seva_bookings').update({
      attendance_status: status,
      checked_in_at: status === 'attended' ? new Date().toISOString() : null,
    }).eq('id', id);
    setLocalBookings(prev => prev.map(b => b.id === id
      ? { ...b, attendance_status: status, checked_in_at: status === 'attended' ? new Date().toISOString() : null }
      : b
    ));
    setUpdatingId(null);
  };

  // Group bookings by date
  const byDate = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    localBookings.forEach(b => {
      if (b.seva_date_iso) {
        if (!map[b.seva_date_iso]) map[b.seva_date_iso] = [];
        map[b.seva_date_iso].push(b);
      }
    });
    return map;
  }, [localBookings]);

  // Calendar grid
  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const calCells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (calCells.length % 7 !== 0) calCells.push(null);

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
    setSelectedDay(null);
  };

  const dayStr = (day: number) =>
    `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const dayBookings = selectedDay ? (byDate[selectedDay] ?? []) : [];

  // Color intensity for fill
  const getDayStyle = (count: number) => {
    if (count === 0) return {};
    if (count <= 2) return { background: 'rgba(160,45,35,0.12)', borderColor: 'rgba(160,45,35,0.25)' };
    if (count <= 5) return { background: 'rgba(160,45,35,0.22)', borderColor: 'rgba(160,45,35,0.4)' };
    return { background: 'rgba(160,45,35,0.35)', borderColor: 'rgba(160,45,35,0.6)' };
  };

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: 'var(--at-card-alt)', borderColor: 'var(--at-border-mid)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--at-border-faint)' }}>
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg text-warm-cream/50 hover:text-warm-cream hover:bg-white/5 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="text-center">
            <p className="font-serif text-base text-warm-cream">{MONTH_NAMES[calMonth]} {calYear}</p>
            <p className="font-ui text-[9px] tracking-widest uppercase text-warm-cream/40 mt-0.5">
              {Object.keys(byDate).filter(d => d.startsWith(`${calYear}-${String(calMonth + 1).padStart(2, '0')}`)).length} days with bookings
            </p>
          </div>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg text-warm-cream/50 hover:text-warm-cream hover:bg-white/5 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 border-b" style={{ borderColor: 'var(--at-border-faint)' }}>
          {DAY_LABELS_SHORT.map(d => (
            <div key={d} className="py-2 text-center font-ui text-[9px] tracking-widest uppercase text-warm-cream/30">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {calCells.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="border-r border-b aspect-square sm:aspect-auto sm:min-h-[64px]" style={{ borderColor: 'var(--at-border-faint)', background: 'rgba(0,0,0,0.08)' }} />;

            const iso = dayStr(day);
            const count = byDate[iso]?.length ?? 0;
            const revenue = byDate[iso]?.filter(b => b.payment_status === 'confirmed').reduce((s, b) => s + b.total, 0) ?? 0;
            const isToday = iso === today;
            const isSelected = iso === selectedDay;
            const dayStyle = getDayStyle(count);

            return (
              <button
                key={iso}
                onClick={() => setSelectedDay(isSelected ? null : iso)}
                className="border-r border-b p-1.5 sm:p-2 text-left transition-all hover:bg-white/5 relative"
                style={{
                  borderColor: 'var(--at-border-faint)',
                  minHeight: 64,
                  ...(isSelected ? { background: 'rgba(160,45,35,0.2)', borderColor: '#A02D23' } : dayStyle),
                  outline: isToday ? '2px solid rgba(212,175,55,0.4)' : 'none',
                  outlineOffset: '-1px',
                }}
              >
                <span
                  className={`font-ui text-xs leading-none ${isToday ? 'text-spiritual-gold font-bold' : count > 0 ? 'text-warm-cream/90' : 'text-warm-cream/40'}`}
                >
                  {day}
                </span>
                {count > 0 && (
                  <div className="mt-1 space-y-0.5">
                    <span
                      className="block font-ui text-[9px] font-bold px-1 rounded"
                      style={{ background: 'rgba(160,45,35,0.3)', color: '#fca5a5' }}
                    >
                      {count} bkg{count > 1 ? 's' : ''}
                    </span>
                    {revenue > 0 && (
                      <span className="block font-sans text-[9px] text-spiritual-gold/80 truncate">
                        ₹{revenue.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                )}
                {/* Slot fill indicators */}
                {count > 0 && (
                  <div className="absolute bottom-1 right-1 flex gap-0.5 flex-wrap justify-end max-w-[40px]">
                    {[...new Set(byDate[iso]?.map(b => b.slot_name).filter(Boolean))].slice(0, 3).map((sn, si) => (
                      <span
                        key={si}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: `hsl(${(si * 80 + 10) % 360}, 70%, 60%)` }}
                        title={sn ?? ''}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="px-5 py-3 border-t flex items-center gap-4 flex-wrap" style={{ borderColor: 'var(--at-border-faint)' }}>
          <p className="font-ui text-[9px] tracking-widest uppercase text-warm-cream/30">Legend</p>
          {[
            { label: '1–2', bg: 'rgba(160,45,35,0.12)' },
            { label: '3–5', bg: 'rgba(160,45,35,0.22)' },
            { label: '6+', bg: 'rgba(160,45,35,0.35)' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ background: l.bg, border: '1px solid rgba(160,45,35,0.3)' }} />
              <span className="font-ui text-[9px] tracking-wider text-warm-cream/40">{l.label} bookings</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ outline: '2px solid rgba(212,175,55,0.4)', outlineOffset: '-1px' }} />
            <span className="font-ui text-[9px] tracking-wider text-warm-cream/40">Today</span>
          </div>
        </div>
      </div>

      {/* Day detail panel */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl border overflow-hidden"
            style={{ background: 'var(--at-card-alt)', borderColor: 'var(--at-border-mid)' }}
          >
            {/* Day panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--at-border-faint)' }}>
              <div>
                <p className="font-serif text-base text-warm-cream">
                  {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="font-ui text-[9px] tracking-widest uppercase text-warm-cream/40 mt-0.5">
                  {dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''} ·{' '}
                  ₹{dayBookings.filter(b => b.payment_status === 'confirmed').reduce((s, b) => s + b.total, 0).toLocaleString('en-IN')} confirmed revenue
                </p>
              </div>
              <div className="flex items-center gap-2">
                {dayBookings.length > 0 && (
                  <button
                    onClick={() => onExportDay(selectedDay, dayBookings)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-ui text-[10px] tracking-widest uppercase text-spiritual-gold border border-spiritual-gold/20 hover:bg-spiritual-gold/10 transition-colors"
                  >
                    <Download size={12} /> Export Day
                  </button>
                )}
                <button
                  onClick={() => setSelectedDay(null)}
                  className="p-1.5 rounded-lg text-warm-cream/40 hover:text-warm-cream hover:bg-white/5 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Slot/Seva summary for the day */}
            {dayBookings.length > 0 && (
              <div className="px-5 py-3 border-b flex gap-3 flex-wrap" style={{ borderColor: 'var(--at-border-faint)' }}>
                {[...new Set(dayBookings.map(b => b.slot_name).filter(Boolean))].map(slotName => {
                  const slotBkgs = dayBookings.filter(b => b.slot_name === slotName);
                  return (
                    <div
                      key={slotName}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                      style={{ background: 'var(--at-surface-2)', border: '1px solid var(--at-border-faint)' }}
                    >
                      <span className="font-ui text-[10px] text-warm-cream/70">{slotName}</span>
                      <span
                        className="font-ui text-[9px] font-bold px-1.5 rounded-full"
                        style={{ background: 'rgba(160,45,35,0.2)', color: '#fca5a5' }}
                      >
                        {slotBkgs.length} booked
                      </span>
                    </div>
                  );
                })}
                {dayBookings.filter(b => !b.slot_name).length > 0 && (
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                    style={{ background: 'var(--at-surface-2)', border: '1px solid var(--at-border-faint)' }}
                  >
                    <span className="font-ui text-[10px] text-warm-cream/70">Online Seva</span>
                    <span
                      className="font-ui text-[9px] font-bold px-1.5 rounded-full"
                      style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}
                    >
                      {dayBookings.filter(b => !b.slot_name).length} bookings
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Booking list for the day */}
            <div className="divide-y" style={{ borderColor: 'var(--at-border-faint)' }}>
              {dayBookings.length === 0 ? (
                <p className="px-5 py-10 text-center font-ui text-xs tracking-widest uppercase text-warm-cream/30">
                  No bookings for this day
                </p>
              ) : dayBookings.map(b => (
                <DayBookingRow
                  key={b.id}
                  booking={b}
                  updatingId={updatingId}
                  onUpdateAttendance={updateAttendance}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Day booking row (compact, used in calendar day panel) ─────────────────────

function DayBookingRow({
  booking: b,
  updatingId,
  onUpdateAttendance,
}: {
  booking: Booking;
  updatingId: string | null;
  onUpdateAttendance: (id: string, status: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        className="w-full px-5 py-3 flex items-center gap-3 text-left hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-ui text-[10px] text-sacred-red font-semibold">{b.id}</span>
            <PaymentBadge status={b.payment_status} />
            <AttendanceBadge status={b.attendance_status} />
            <BookingTypeBadge type={b.seva_type} />
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="font-sans text-xs text-warm-cream/60">{b.devotee?.name ?? b.devotee_phone}</span>
            {b.slot_time && <span className="font-sans text-xs text-warm-cream/40">{b.slot_time} · {b.slot_name}</span>}
            <span className="font-sans text-xs text-spiritual-gold">₹{b.total.toLocaleString('en-IN')}</span>
          </div>
        </div>
        {expanded ? <ChevronUp size={13} className="text-warm-cream/30 flex-shrink-0" /> : <ChevronDown size={13} className="text-warm-cream/30 flex-shrink-0" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t" style={{ borderColor: 'var(--at-border-faint)' }}>
              <div className="pt-3 space-y-2">
                <p className="font-ui text-[9px] tracking-widest uppercase text-warm-cream/30">Details</p>
                {[
                  ['Phone', b.devotee_phone],
                  ['Email', b.devotee?.email ?? '—'],
                  ['Type', b.seva_type === 'online' ? 'Online Seva' : 'Temple Visit'],
                  ['Slot', b.slot_time ? `${b.slot_time} — ${b.slot_name}` : '—'],
                  ['Family', (b.family_members ?? []).join(', ') || '—'],
                  ['Payment', b.payment_method.toUpperCase()],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-warm-cream/40 font-ui">{k}</span>
                    <span className="text-warm-cream/70 font-sans text-right">{v}</span>
                  </div>
                ))}
                {b.booking_deity_sevas && b.booking_deity_sevas.length > 0 && (
                  <div className="pt-1">
                    <p className="font-ui text-[9px] tracking-widest uppercase text-warm-cream/30 mb-1.5">Sevas</p>
                    {b.booking_deity_sevas.map((ds, i) => (
                      <div key={i} className="flex justify-between text-xs py-0.5">
                        <span className="text-warm-cream/55">{ds.deity_name} — {ds.seva_name}</span>
                        <span className="text-spiritual-gold">₹{ds.price.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="pt-3 space-y-2">
                <p className="font-ui text-[9px] tracking-widest uppercase text-warm-cream/30">Update Attendance</p>
                {['attended', 'not_attended', 'pending'].map(s => {
                  const labels: Record<string, string> = { attended: 'Mark Attended', not_attended: 'Mark Absent', pending: 'Reset Pending' };
                  const colors: Record<string, string> = { attended: '#059669', not_attended: '#dc2626', pending: '#d97706' };
                  return (
                    <button
                      key={s}
                      onClick={() => onUpdateAttendance(b.id, s)}
                      disabled={updatingId === b.id || b.attendance_status === s}
                      className="w-full px-3 py-2 rounded-lg font-ui text-xs tracking-widest uppercase text-white transition-all disabled:opacity-40"
                      style={{ background: colors[s] }}
                    >
                      {updatingId === b.id ? <Loader2 size={12} className="animate-spin mx-auto" /> : labels[s]}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────────

export default function PaginatedBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<BookingTab>('active');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'online' | 'offline'>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('seva_bookings')
      .select('*, devotee:devotees(name,email,city,state), booking_deity_sevas(*)')
      .order('created_at', { ascending: false });
    setBookings((data as Booking[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateAttendance = async (id: string, status: string) => {
    setUpdatingId(id);
    await supabase.from('seva_bookings').update({
      attendance_status: status,
      checked_in_at: status === 'attended' ? new Date().toISOString() : null,
    }).eq('id', id);
    setBookings(prev => prev.map(b => b.id === id
      ? { ...b, attendance_status: status, checked_in_at: status === 'attended' ? new Date().toISOString() : null }
      : b
    ));
    setUpdatingId(null);
  };

  // ── Date filtering ────────────────────────────────────────
  const dateFiltered = useMemo(() => {
    if (dateFilter === 'all') return bookings;
    const today = isoToday();
    const yesterday = isoOffset(-1);
    const past7 = isoOffset(-7);
    const monthStart = isoMonthStart();
    return bookings.filter(b => {
      const d = b.seva_date_iso;
      if (!d) return false;
      if (dateFilter === 'today') return d === today;
      if (dateFilter === 'yesterday') return d === yesterday;
      if (dateFilter === 'past7') return d >= past7 && d <= today;
      if (dateFilter === 'month') return d >= monthStart && d <= today;
      if (dateFilter === 'custom') return d >= customFrom && d <= customTo;
      return true;
    });
  }, [bookings, dateFilter, customFrom, customTo]);

  // ── Tab + search + type + status filtering ────────────────
  const tabFiltered = dateFiltered.filter(b => {
    if (activeTab === 'active')
      return b.payment_status === 'confirmed' && b.attendance_status === 'pending';
    if (activeTab === 'completed')
      return b.attendance_status === 'attended' || b.attendance_status === 'not_attended';
    if (activeTab === 'online_active')
      return b.seva_type === 'online' && b.attendance_status !== 'attended';
    return true;
  });

  const filtered = tabFiltered.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.id.toLowerCase().includes(q)
      || b.devotee_phone.includes(q)
      || (b.devotee?.name ?? '').toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || b.payment_status === filterStatus;
    const matchType = filterType === 'all' || b.seva_type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const tabCount = (tab: BookingTab) => dateFiltered.filter(b => {
    if (tab === 'active') return b.payment_status === 'confirmed' && b.attendance_status === 'pending';
    if (tab === 'completed') return b.attendance_status === 'attended' || b.attendance_status === 'not_attended';
    if (tab === 'online_active') return b.seva_type === 'online' && b.attendance_status !== 'attended';
    return false;
  }).length;

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedBookings = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  const goToPage = (p: number) => {
    setPage(Math.max(1, Math.min(p, totalPages)));
    setExpanded(null);
  };

  useEffect(() => { setPage(1); }, [activeTab, search, filterType, filterStatus, dateFilter]);

  const handleExportFiltered = () => {
    const ts = new Date().toISOString().slice(0, 10);
    exportCSV(filtered, `bookings-${activeTab}-${ts}.csv`);
  };

  const handleExportDay = (date: string, rows: Booking[]) => {
    exportCSV(rows, `bookings-${date}.csv`);
  };

  // ── Date filter label helper ──────────────────────────────
  const dateFilterLabel = useMemo(() => {
    if (dateFilter === 'all') return null;
    if (dateFilter === 'today') return `Today (${isoToday()})`;
    if (dateFilter === 'yesterday') return `Yesterday (${isoOffset(-1)})`;
    if (dateFilter === 'past7') return `Past 7 days`;
    if (dateFilter === 'month') return `This month`;
    if (dateFilter === 'custom' && customFrom && customTo) return `${customFrom} → ${customTo}`;
    return null;
  }, [dateFilter, customFrom, customTo]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-serif text-2xl text-warm-cream">Bookings</h2>
          <p className="font-ui text-xs tracking-widest uppercase text-warm-cream/30 mt-0.5">
            {viewMode === 'list'
              ? `${filtered.length} results · Page ${page}/${totalPages || 1}`
              : `${bookings.length} total bookings · calendar view`
            }
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {viewMode === 'list' && (
            <select
              value={pageSize}
              onChange={e => { setPageSize(+e.target.value); setPage(1); }}
              className="px-2 py-2 rounded-lg font-ui text-xs text-warm-cream/60 focus:outline-none"
              style={{ background: 'var(--at-surface-5)', border: '1px solid var(--at-border-mid)' }}
            >
              {[10, 20, 50, 100].map(n => (
                <option key={n} value={n}>{n} per page</option>
              ))}
            </select>
          )}
          {/* View toggle */}
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--at-border-dim)' }}>
            {(['list', 'calendar'] as ViewMode[]).map(m => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className="px-3 py-2 font-ui text-[10px] tracking-widest uppercase transition-colors"
                style={{
                  background: viewMode === m ? '#A02D23' : 'transparent',
                  color: viewMode === m ? '#fff' : 'var(--at-text-muted)',
                }}
              >
                {m === 'list' ? 'List' : 'Calendar'}
              </button>
            ))}
          </div>
          {viewMode === 'list' && filtered.length > 0 && (
            <button
              onClick={handleExportFiltered}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-ui text-[10px] tracking-widest uppercase text-spiritual-gold border border-spiritual-gold/20 hover:bg-spiritual-gold/10 transition-colors"
            >
              <Download size={12} /> Export
            </button>
          )}
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-ui text-xs tracking-widest uppercase text-warm-cream/60 hover:text-warm-cream border transition-colors"
            style={{ borderColor: 'var(--at-border-dim)' }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Date filter row (list view only) ─────────────────── */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          <div className="flex gap-1.5 flex-wrap">
            {DATE_PRESETS.map(p => (
              <button
                key={p.id}
                onClick={() => setDateFilter(p.id)}
                className="px-3 py-1.5 rounded-lg font-ui text-[10px] tracking-widest uppercase transition-all"
                style={{
                  background: dateFilter === p.id ? '#A02D23' : 'var(--at-surface-2)',
                  color: dateFilter === p.id ? '#fff' : 'var(--at-text-muted)',
                  border: `1px solid ${dateFilter === p.id ? '#A02D23' : 'var(--at-border-faint)'}`,
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          {dateFilter === 'custom' && (
            <div className="flex gap-2 items-center flex-wrap">
              <input
                type="date"
                value={customFrom}
                max={customTo || isoToday()}
                onChange={e => setCustomFrom(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-sans text-warm-cream/80 focus:outline-none"
                style={{ background: 'var(--at-surface-5)', border: '1px solid var(--at-border-mid)' }}
              />
              <span className="font-ui text-[10px] text-warm-cream/40">to</span>
              <input
                type="date"
                value={customTo}
                min={customFrom}
                max={isoToday()}
                onChange={e => setCustomTo(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-sans text-warm-cream/80 focus:outline-none"
                style={{ background: 'var(--at-surface-5)', border: '1px solid var(--at-border-mid)' }}
              />
            </div>
          )}
          {dateFilterLabel && (
            <p className="font-ui text-[9px] tracking-widest uppercase text-warm-cream/35">
              Showing: {dateFilterLabel} · {dateFiltered.length} booking{dateFiltered.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      {/* ── Calendar view ─────────────────────────────────────── */}
      {viewMode === 'calendar' && !loading && (
        <BookingCalendar bookings={bookings} onExportDay={handleExportDay} />
      )}

      {/* ── List view ─────────────────────────────────────────── */}
      {viewMode === 'list' && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--at-surface-2)', border: '1px solid var(--at-border-faint)' }}>
            {BOOKING_TABS.map(tab => {
              const active = activeTab === tab.id;
              const count = tabCount(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setExpanded(null); setSearch(''); setFilterType('all'); setFilterStatus('all'); }}
                  className="flex-1 flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-lg transition-all"
                  style={{
                    background: active ? 'var(--at-nav-active)' : 'transparent',
                    color: active ? '#A02D23' : 'var(--at-text-muted)',
                  }}
                >
                  <span className="font-ui text-[10px] tracking-widest uppercase leading-tight text-center">{tab.label}</span>
                  <span
                    className="font-ui text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
                    style={{
                      background: active ? '#A02D23' : 'var(--at-border-mid)',
                      color: active ? '#fff' : 'var(--at-text-dim)',
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/25 -mt-3">
            {BOOKING_TABS.find(t => t.id === activeTab)?.desc}
          </p>

          {/* Search + type + status filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-cream/30" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by ID, phone, name…"
                className="w-full pl-8 pr-4 py-2 text-xs font-sans text-warm-cream/80 rounded-lg focus:outline-none"
                style={{ background: 'var(--at-surface-5)', border: '1px solid var(--at-border-mid)' }}
              />
            </div>
            {activeTab !== 'online_active' && (
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value as 'all' | 'online' | 'offline')}
                className="px-3 py-2 rounded-lg font-ui text-xs text-warm-cream/60 focus:outline-none"
                style={{ background: 'var(--at-surface-5)', border: '1px solid var(--at-border-mid)' }}
              >
                <option value="all">All Types</option>
                <option value="online">Online Seva</option>
                <option value="offline">Offline / Temple Visit</option>
              </select>
            )}
            {activeTab === 'active' && (
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-lg font-ui text-xs text-warm-cream/60 focus:outline-none"
                style={{ background: 'var(--at-surface-5)', border: '1px solid var(--at-border-mid)' }}
              >
                <option value="all">All Payment</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
              </select>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-sacred-red" /></div>
          ) : (
            <>
              <div className="space-y-2">
                {paginatedBookings.map(b => (
                  <div
                    key={b.id}
                    className="rounded-xl border overflow-hidden"
                    style={{ background: 'var(--at-card-alt)', borderColor: 'var(--at-border-faint)' }}
                  >
                    <button
                      className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-white/[0.02] transition-colors"
                      onClick={() => setExpanded(expanded === b.id ? null : b.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-ui text-xs text-sacred-red font-semibold">{b.id}</span>
                          <PaymentBadge status={b.payment_status} />
                          <AttendanceBadge status={b.attendance_status} />
                          <BookingTypeBadge type={b.seva_type} />
                        </div>
                        <div className="flex items-center gap-4 mt-1 flex-wrap">
                          <span className="font-sans text-xs text-warm-cream/60">{b.devotee?.name ?? b.devotee_phone}</span>
                          <span className="font-sans text-xs text-warm-cream/40">{b.seva_date}</span>
                          {b.slot_time && <span className="font-sans text-xs text-warm-cream/40">{b.slot_time}</span>}
                          <span className="font-sans text-xs text-spiritual-gold">₹{b.total.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      {expanded === b.id
                        ? <ChevronUp size={14} className="text-warm-cream/30 flex-shrink-0" />
                        : <ChevronDown size={14} className="text-warm-cream/30 flex-shrink-0" />
                      }
                    </button>

                    <AnimatePresence>
                      {expanded === b.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 border-t grid grid-cols-1 md:grid-cols-2 gap-6" style={{ borderColor: 'var(--at-border)' }}>
                            <div className="pt-4 space-y-3">
                              <p className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/30">Booking Details</p>
                              {[
                                ['Phone', b.devotee_phone],
                                ['Email', b.devotee?.email ?? '—'],
                                ['Location', b.devotee ? `${b.devotee.city}, ${b.devotee.state}` : '—'],
                                ['Type', b.seva_type === 'online' ? 'Online Seva' : 'Temple Visit (Offline)'],
                                ['Family Members', (b.family_members ?? []).join(', ') || '—'],
                                ['Payment Method', b.payment_method.toUpperCase()],
                                ['Slot', b.slot_time ? `${b.slot_time} — ${b.slot_name}` : '—'],
                                ['Booked At', new Date(b.created_at).toLocaleString('en-IN')],
                                ...(b.checked_in_at ? [['Checked In', new Date(b.checked_in_at).toLocaleString('en-IN')]] : []),
                              ].map(([k, v]) => (
                                <div key={k} className="flex justify-between text-xs">
                                  <span className="text-warm-cream/40 font-ui">{k}</span>
                                  <span className="text-warm-cream/70 font-sans text-right max-w-[60%]">{v}</span>
                                </div>
                              ))}
                              {b.booking_deity_sevas && b.booking_deity_sevas.length > 0 && (
                                <div className="pt-2">
                                  <p className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/30 mb-2">Sevas</p>
                                  {b.booking_deity_sevas.map((ds, i) => (
                                    <div key={i} className="flex justify-between text-xs py-1 border-b" style={{ borderColor: 'var(--at-surface-5)' }}>
                                      <span className="text-warm-cream/60">{ds.deity_name} — {ds.seva_name}</span>
                                      <span className="text-spiritual-gold">₹{ds.price.toLocaleString('en-IN')}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="pt-4 space-y-3">
                              <p className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/30">Update Attendance</p>
                              <div className="flex flex-col gap-2">
                                {['attended', 'not_attended', 'pending'].map(s => {
                                  const labels: Record<string, string> = { attended: 'Mark Attended', not_attended: 'Mark Absent', pending: 'Reset to Pending' };
                                  const colors: Record<string, string> = { attended: '#059669', not_attended: '#dc2626', pending: '#d97706' };
                                  return (
                                    <button
                                      key={s}
                                      onClick={() => updateAttendance(b.id, s)}
                                      disabled={updatingId === b.id || b.attendance_status === s}
                                      className="px-4 py-2 rounded-lg font-ui text-xs tracking-widest uppercase text-white transition-all disabled:opacity-40"
                                      style={{ background: colors[s] }}
                                    >
                                      {updatingId === b.id ? <Loader2 size={12} className="animate-spin mx-auto" /> : labels[s]}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
                {paginatedBookings.length === 0 && (
                  <div className="text-center py-16 text-warm-cream/30 font-ui text-xs tracking-widest uppercase">
                    No bookings in this tab
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                    className="px-3 py-1.5 rounded-lg font-ui text-[10px] tracking-widest uppercase text-warm-cream/40 hover:text-warm-cream/70 border transition-colors disabled:opacity-30"
                    style={{ borderColor: 'var(--at-border-dim)' }}
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let p: number;
                    if (totalPages <= 5) p = i + 1;
                    else if (page <= 3) p = i + 1;
                    else if (page >= totalPages - 2) p = totalPages - 4 + i;
                    else p = page - 2 + i;
                    return (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        className="w-8 h-8 rounded-lg font-ui text-[10px] transition-all"
                        style={{
                          background: page === p ? '#A02D23' : 'transparent',
                          color: page === p ? '#fff' : 'var(--at-text-muted)',
                          border: page === p ? 'none' : '1px solid var(--at-border-dim)',
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 rounded-lg font-ui text-[10px] tracking-widest uppercase text-warm-cream/40 hover:text-warm-cream/70 border transition-colors disabled:opacity-30"
                    style={{ borderColor: 'var(--at-border-dim)' }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {viewMode === 'calendar' && loading && (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-sacred-red" /></div>
      )}
    </div>
  );
}
