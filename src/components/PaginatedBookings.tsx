import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, RefreshCw, ChevronDown, ChevronUp, Loader2,
  CheckCircle2, XCircle, CalendarDays, BookOpen, IndianRupee,
  ToggleRight, ToggleLeft, Edit2, Save, Trash2, QrCode, ChevronRight,
  Wifi, Building,
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

const BOOKING_TABS: { id: BookingTab; label: string; desc: string }[] = [
  { id: 'active', label: 'Active Bookings', desc: 'Confirmed · Pending attendance' },
  { id: 'completed', label: 'Completed / Attended', desc: 'Attended or absent' },
  { id: 'online_active', label: 'Online Seva Active', desc: 'Online sevas · Not yet attended' },
];

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
    <span className="px-2 py-0.5 rounded-full font-ui text-[10px] tracking-wider uppercase flex items-center gap-1" style={{
      background: online ? 'rgba(16,185,129,0.12)' : 'rgba(59,130,246,0.12)',
      color: online ? '#34d399' : '#60a5fa',
    }}>
      {online ? <Wifi size={9} /> : <Building size={9} />}
      {online ? 'Online' : 'Offline'}
    </span>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────────

export default function PaginatedBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<BookingTab>('active');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'online' | 'offline'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  // Tab-level pre-filter
  const tabFiltered = bookings.filter(b => {
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

  const tabCount = (tab: BookingTab) => bookings.filter(b => {
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

  useEffect(() => { setPage(1); }, [activeTab, search, filterType, filterStatus]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-serif text-2xl text-warm-cream">Bookings</h2>
          <p className="font-ui text-xs tracking-widest uppercase text-warm-cream/30 mt-0.5">
            {filtered.length} total · Page {page}/{totalPages || 1}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={e => { setPageSize(+e.target.value); setPage(1); }}
            className="px-2 py-2 rounded-lg font-ui text-xs text-warm-cream/60 focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-600"
          >
            {[10, 20, 50, 100].map(n => (
              <option key={n} value={n}>{n} per page</option>
            ))}
          </select>
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-ui text-xs tracking-widest uppercase text-warm-cream/60 hover:text-warm-cream border transition-colors"
            style={{ borderColor: 'var(--at-border-dim)' }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

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

      {/* Tab description */}
      <p className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/25 -mt-3">
        {BOOKING_TABS.find(t => t.id === activeTab)?.desc}
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-cream/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID, phone, name…"
            className="w-full pl-8 pr-4 py-2 text-xs font-sans text-warm-cream/80 rounded-lg focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-600"
            style={{ background: 'var(--at-surface-5)', border: '1px solid var(--at-border-mid)' }}
          />
        </div>
        {activeTab !== 'online_active' && (
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value as 'all' | 'online' | 'offline')}
            className="px-3 py-2 rounded-lg font-ui text-xs text-warm-cream/60 focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
            className="px-3 py-2 rounded-lg font-ui text-xs text-warm-cream/60 focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
                {/* Row */}
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
                  {expanded === b.id ? <ChevronUp size={14} className="text-warm-cream/30 flex-shrink-0" /> : <ChevronDown size={14} className="text-warm-cream/30 flex-shrink-0" />}
                </button>

                {/* Expanded */}
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
                        {/* Details */}
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

                        {/* Actions */}
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
    </div>
  );
}
