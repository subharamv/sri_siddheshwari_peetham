import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, CalendarDays, Clock, Leaf, LogOut, Menu, X,
  Search, CheckCircle2, XCircle, Loader2,
  Edit2, Save, Ban, ChevronDown, ChevronUp, ScanLine,
  Camera, RefreshCw, IndianRupee, TrendingUp, BookOpen,
  ToggleLeft, ToggleRight, Plus, Trash2, QrCode, ArrowLeft,
  Shield, User, ChevronRight, Heart, Clock3, Wifi, Building,
  Users, UserPlus, Eye, EyeOff,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import logoImage from '../assets/Logo (1).webp';
import { AnimatedThemeToggler } from './AnimatedThemeToggler';
import PaginatedBookings from './PaginatedBookings';
import PaginatedSlots from './PaginatedSlots';
import PaginatedSevas from './PaginatedSevas';

// ── Types ──────────────────────────────────────────────────────────────────────

type AdminSection = 'overview' | 'bookings' | 'slots' | 'sevas' | 'deities' | 'attendance' | 'donations' | 'devotees' | 'users';

interface AdminProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  user_role: string;
}

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

interface Slot {
  id: string;
  time: string;
  name: string;
  price: number;
  sort_order: number;
  max_bookings: number;
  is_active: boolean;
}

interface Seva {
  name: string;
  price: number;
}

interface Deity {
  id: string;
  name: string;
  sevas: string[];
  grad: string;
}

interface Donation {
  id: string;
  donor_name: string;
  donor_phone: string;
  donor_email: string;
  donation_type: string;
  amount: number;
  message: string;
  payment_status: string;
  created_at: string;
}

interface Stats {
  totalBookings: number;
  todayBookings: number;
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  attendanceRate: number;
  pendingAttendance: number;
  activeSlots: number;
}

interface AdminUser {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  user_role: string;
  created_at: string;
}

// ── Sidebar nav items ──────────────────────────────────────────────────────────

const NAV_ITEMS: { section: AdminSection; label: string; icon: React.ReactNode; superAdminOnly?: boolean }[] = [
  { section: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
  { section: 'bookings', label: 'Bookings', icon: <BookOpen size={16} /> },
  { section: 'slots', label: 'Slots', icon: <Clock size={16} /> },
  { section: 'sevas', label: 'Sevas', icon: <Leaf size={16} /> },
  { section: 'deities', label: 'Deities', icon: <span className="font-serif text-base leading-none">ॐ</span> },
  { section: 'attendance', label: 'Attendance', icon: <QrCode size={16} /> },
  { section: 'donations', label: 'Donations', icon: <Heart size={16} /> },
  { section: 'devotees', label: 'Devotees', icon: <Users size={16} /> },
  { section: 'users', label: 'Users', icon: <UserPlus size={16} />, superAdminOnly: true },
];

// ── Attendance badge helper ────────────────────────────────────────────────────

const AttendanceBadge = ({ status }: { status: string }) => {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    attended: { bg: '#14532d22', text: '#4ade80', label: 'Attended' },
    not_attended: { bg: '#7f1d1d22', text: '#f87171', label: 'Absent' },
    pending: { bg: '#78350f22', text: '#fbbf24', label: 'Pending' },
  };
  const c = map[status] ?? map.pending;
  return (
    <span
      className="px-2 py-0.5 rounded-full font-ui text-[10px] tracking-wider uppercase"
      style={{ background: c.bg, color: c.text }}
    >
      {c.label}
    </span>
  );
};

const PaymentBadge = ({ status }: { status: string }) => {
  const ok = status === 'confirmed';
  return (
    <span
      className="px-2 py-0.5 rounded-full font-ui text-[10px] tracking-wider uppercase"
      style={{ background: ok ? '#14532d22' : '#78350f22', color: ok ? '#4ade80' : '#fbbf24' }}
    >
      {ok ? 'Confirmed' : status}
    </span>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// OVERVIEW SECTION
// ════════════════════════════════════════════════════════════════════════════════

function OverviewSection({ stats, recentBookings, onNavigateToBookings }: { stats: Stats; recentBookings: Booking[]; onNavigateToBookings: () => void }) {
  const [revView, setRevView] = useState<'total' | 'today' | 'week'>('total');

  const revMap = { total: stats.totalRevenue, today: stats.todayRevenue, week: stats.weekRevenue };
  const revLabel = { total: 'Total Revenue', today: "Today's Revenue", week: 'This Week Revenue' };

  const statCards = [
    { label: 'Total Bookings', value: stats.totalBookings, icon: <BookOpen size={20} />, color: '#A02D23' },
    { label: "Today's Bookings", value: stats.todayBookings, icon: <CalendarDays size={20} />, color: '#D4AF37' },
    {
      label: revLabel[revView],
      value: `₹${revMap[revView].toLocaleString('en-IN')}`,
      icon: <IndianRupee size={20} />,
      color: '#5D5043',
      revToggle: true,
    },
    { label: 'Attendance Rate', value: `${stats.attendanceRate}%`, icon: <TrendingUp size={20} />, color: '#2563eb' },
    { label: 'Pending Checkin', value: stats.pendingAttendance, icon: <Clock3 size={20} />, color: '#d97706' },
    { label: 'Active Slots', value: stats.activeSlots, icon: <ToggleRight size={20} />, color: '#059669' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-warm-cream mb-1 font-bold">Dashboard Overview</h2>
        <p className="font-ui text-xs tracking-widest uppercase text-warm-cream/50">
          Real-time stats · Sri Siddheswari Peetham
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {statCards.map(c => (
          <div
            key={c.label}
            className="rounded-xl p-4 sm:p-5 border"
            style={{ background: 'var(--at-card-bg)', borderColor: 'var(--at-border-mid)' }}
          >
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <span style={{ color: c.color }}>{c.icon}</span>
              {c.revToggle ? (
                <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--at-border-dim)' }}>
                  {(['total', 'today', 'week'] as const).map(r => (
                    <button
                      key={r}
                      onClick={() => setRevView(r)}
                      className="px-1.5 py-0.5 font-ui text-[8px] sm:text-[9px] tracking-widest uppercase transition-colors"
                      style={{
                        background: revView === r ? 'rgba(160,45,35,0.3)' : 'transparent',
                        color: revView === r ? '#D4AF37' : 'rgba(253,251,247,0.5)',
                      }}
                    >
                      {r === 'total' ? 'ALL' : r === 'today' ? 'DAY' : 'WK'}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="font-ui text-[9px] tracking-widest uppercase text-warm-cream/50 text-right leading-tight max-w-[80px]">{c.label}</span>
              )}
            </div>
            <p className="font-serif text-2xl sm:text-3xl text-warm-cream">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Recent bookings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-ui text-xs tracking-widest uppercase text-warm-cream/60 font-semibold">Recent Bookings</h3>
          <button
            onClick={onNavigateToBookings}
            className="flex items-center gap-1 px-2 py-1 rounded font-ui text-[9px] tracking-widest uppercase text-sacred-red hover:text-sacred-red/70 border transition-colors"
            style={{ borderColor: 'var(--at-border-dim)' }}
          >
            View All <ChevronRight size={10} />
          </button>
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block rounded-xl overflow-hidden border" style={{ borderColor: 'var(--at-border-mid)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--at-table-head)' }}>
                {['Booking ID', 'Devotee', 'Date', 'Total', 'Status', 'Attendance'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-ui text-[10px] tracking-widest uppercase text-warm-cream/60">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentBookings.slice(0, 8).map((b, i) => (
                <tr
                  key={b.id}
                  onClick={onNavigateToBookings}
                  style={{ background: i % 2 === 0 ? 'var(--at-surface-2)' : 'transparent' }}
                  className="border-t cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3 font-ui text-xs text-sacred-red font-semibold">{b.id}</td>
                  <td className="px-4 py-3 font-sans text-xs text-warm-cream/70">{b.devotee?.name ?? b.devotee_phone}</td>
                  <td className="px-4 py-3 font-sans text-xs text-warm-cream/70">{b.seva_date}</td>
                  <td className="px-4 py-3 font-sans text-xs text-spiritual-gold">₹{b.total.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3"><PaymentBadge status={b.payment_status} /></td>
                  <td className="px-4 py-3"><AttendanceBadge status={b.attendance_status} /></td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-warm-cream/50 font-ui text-xs tracking-widest uppercase">No bookings yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card view */}
        <div className="sm:hidden space-y-3">
          {recentBookings.slice(0, 8).map(b => (
            <div
              key={b.id}
              onClick={onNavigateToBookings}
              className="rounded-xl p-4 border cursor-pointer hover:bg-white/5 transition-colors"
              style={{ background: 'var(--at-card-bg)', borderColor: 'var(--at-border-mid)' }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-ui text-xs text-sacred-red font-semibold">{b.id}</p>
                  <p className="font-sans text-sm text-warm-cream/80">{b.devotee?.name ?? b.devotee_phone}</p>
                </div>
                <p className="font-sans text-sm text-spiritual-gold">₹{b.total.toLocaleString('en-IN')}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-sans text-[11px] text-warm-cream/70">{b.seva_date}</span>
                <PaymentBadge status={b.payment_status} />
                <AttendanceBadge status={b.attendance_status} />
              </div>
            </div>
          ))}
          {recentBookings.length === 0 && (
            <p className="text-center text-warm-cream/50 font-ui text-xs tracking-widest uppercase py-6">No bookings yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// DEITIES SECTION
// ════════════════════════════════════════════════════════════════════════════════

function DeitiesSection({ onNavigateToSevas }: { onNavigateToSevas: () => void }) {
  const [deities, setDeities] = useState<Deity[]>([]);
  const [sevas, setSevas] = useState<Seva[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSevas, setEditSevas] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [showUnmapped, setShowUnmapped] = useState(true);

  // Sevas not assigned to any deity
  const unmappedSevas = useMemo(() => {
    const assigned = new Set(deities.flatMap(d => d.sevas ?? []));
    return sevas.filter(sv => !assigned.has(sv.name));
  }, [sevas, deities]);

  useEffect(() => {
    (async () => {
      const [{ data: dData }, { data: sData }] = await Promise.all([
        supabase.from('ref_deities').select('*').order('name'),
        supabase.from('ref_sevas').select('*').order('name'),
      ]);
      setDeities((dData as Deity[]) ?? []);
      setSevas((sData as Seva[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const startEdit = (d: Deity) => { setEditingId(d.id); setEditSevas([...(d.sevas ?? [])]); };
  const cancelEdit = () => { setEditingId(null); setEditSevas([]); };
  const toggleSeva = (name: string) =>
    setEditSevas(prev => prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]);

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    const { error } = await supabase.from('ref_deities').update({ sevas: editSevas }).eq('id', editingId);
    if (!error) {
      setDeities(prev => prev.map(d => d.id === editingId ? { ...d, sevas: editSevas } : d));
      cancelEdit();
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-warm-cream">Deities</h2>
        <p className="font-ui text-xs tracking-widest uppercase text-warm-cream/30 mt-0.5">
          {deities.length} deities · edit seva mappings
        </p>
      </div>

      {sevas.length === 0 && !loading && (
        <div className="rounded-xl p-4 border" style={{ background: 'rgba(212,175,55,0.05)', borderColor: 'rgba(212,175,55,0.2)' }}>
          <p className="font-ui text-[10px] tracking-widest uppercase text-spiritual-gold mb-1">No Sevas Available</p>
          <p className="font-sans text-xs text-warm-cream/50 mb-3">Create sevas first before assigning them to deities.</p>
          <button
            onClick={onNavigateToSevas}
            className="flex items-center gap-2 px-4 py-2 bg-sacred-red text-warm-cream rounded-lg font-ui text-xs tracking-widest uppercase hover:bg-sacred-red/80 transition-colors"
          >
            <Plus size={12} /> Go to Sevas
          </button>
        </div>
      )}

      {/* ── Unmapped sevas panel ───────────────────────────── */}
      {!loading && sevas.length > 0 && (
        <div
          className="rounded-xl border overflow-hidden"
          style={{
            background: unmappedSevas.length > 0 ? 'rgba(160,45,35,0.06)' : 'rgba(5,150,105,0.05)',
            borderColor: unmappedSevas.length > 0 ? 'rgba(160,45,35,0.25)' : 'rgba(5,150,105,0.2)',
          }}
        >
          <button
            className="w-full flex items-center justify-between px-5 py-3 text-left"
            onClick={() => setShowUnmapped(v => !v)}
          >
            <div className="flex items-center gap-2 flex-wrap">
              {unmappedSevas.length > 0 ? (
                <span className="font-ui text-[10px] tracking-widest uppercase text-sacred-red/80">
                  Sevas Not Assigned to Any Deity
                </span>
              ) : (
                <span className="font-ui text-[10px] tracking-widest uppercase text-emerald-400/80">
                  All Sevas Assigned
                </span>
              )}
              <span
                className="font-ui text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: unmappedSevas.length > 0 ? 'rgba(160,45,35,0.25)' : 'rgba(5,150,105,0.2)',
                  color: unmappedSevas.length > 0 ? '#fca5a5' : '#4ade80',
                }}
              >
                {unmappedSevas.length} / {sevas.length}
              </span>
              {unmappedSevas.length === 0 && (
                <span className="font-sans text-[10px] text-emerald-400/60">
                  Every seva is linked to at least one deity
                </span>
              )}
            </div>
            {showUnmapped
              ? <ChevronUp size={13} className="text-warm-cream/40" />
              : <ChevronDown size={13} className="text-warm-cream/40" />
            }
          </button>

          {showUnmapped && unmappedSevas.length > 0 && (
            <div className="px-5 pb-4 border-t" style={{ borderColor: 'rgba(160,45,35,0.15)' }}>
              <p className="font-sans text-[11px] text-warm-cream/45 mt-3 mb-3">
                These sevas have not been added to any deity. Click Edit on a deity card above to assign them.
              </p>
              <div className="flex flex-wrap gap-2">
                {unmappedSevas.map(sv => (
                  <div
                    key={sv.name}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(160,45,35,0.18)' }}
                  >
                    <div>
                      <p className="font-sans text-xs text-warm-cream/80 leading-none">{sv.name}</p>
                      <p className="font-sans text-[10px] text-spiritual-gold/70 mt-0.5">₹{sv.price.toLocaleString('en-IN')}</p>
                    </div>
                    <span
                      className="px-1.5 py-0.5 rounded font-ui text-[8px] tracking-wider uppercase"
                      style={{ background: 'rgba(160,45,35,0.2)', color: '#fca5a5' }}
                    >
                      unassigned
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-sacred-red" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {deities.map(d => {
            const isEditing = editingId === d.id;
            return (
              <div
                key={d.id}
                data-deity-card="true"
                className="rounded-xl p-5 border transition-all"
                style={{
                  background: d.grad ? `${d.grad.replace('145deg', '135deg').split(')')[0]}, rgba(0,0,0,0.6))` : 'var(--at-card-bg)',
                  borderColor: isEditing ? '#A02D23' : 'var(--at-border-mid)',
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-serif text-base text-warm-cream">{d.name}</h3>
                  {!isEditing ? (
                    <button
                      onClick={() => startEdit(d)}
                      className="flex items-center gap-1 px-2 py-1 rounded font-ui text-[9px] tracking-widest uppercase text-warm-cream/40 hover:text-warm-cream/70 border transition-colors flex-shrink-0"
                      style={{ borderColor: 'var(--at-border-dim)' }}
                    >
                      <Edit2 size={9} /> Edit
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={saveEdit}
                        disabled={saving}
                        className="flex items-center gap-1 px-2 py-1 rounded font-ui text-[9px] tracking-widest uppercase bg-sacred-red text-warm-cream hover:bg-sacred-red/80 disabled:opacity-50 transition-colors"
                      >
                        {saving ? <Loader2 size={9} className="animate-spin" /> : <Save size={9} />} Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-1 px-2 py-1 rounded font-ui text-[9px] tracking-widest uppercase text-warm-cream/40 hover:text-warm-cream/70 border transition-colors"
                        style={{ borderColor: 'var(--at-border-dim)' }}
                      >
                        <Ban size={9} /> Cancel
                      </button>
                    </div>
                  )}
                </div>

                {!isEditing ? (
                  <div className="flex flex-wrap gap-1">
                    {(d.sevas ?? []).length === 0 ? (
                      <span className="font-ui text-[9px] tracking-wider text-warm-cream/30 italic">No sevas assigned</span>
                    ) : (d.sevas ?? []).map(sv => (
                      <span key={sv} className="px-2 py-0.5 rounded-full font-ui text-[9px] tracking-wider uppercase text-warm-cream/60" style={{ background: 'var(--at-border-mid)' }}>
                        {sv}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div>
                    <p className="font-ui text-[9px] tracking-widest uppercase text-warm-cream/30 mb-2">
                      Toggle sevas · {editSevas.length} selected
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto">
                      {sevas.map(sv => {
                        const active = editSevas.includes(sv.name);
                        return (
                          <button
                            key={sv.name}
                            onClick={() => toggleSeva(sv.name)}
                            className="px-2 py-0.5 rounded-full font-ui text-[9px] tracking-wider uppercase transition-all"
                            style={{
                              background: active ? '#A02D23' : 'rgba(255,255,255,0.06)',
                              color: active ? '#fff' : 'rgba(253,251,247,0.45)',
                              border: `1px solid ${active ? '#A02D23' : 'transparent'}`,
                            }}
                          >
                            {active ? '✓ ' : ''}{sv.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// ATTENDANCE / QR SCANNER SECTION
// ════════════════════════════════════════════════════════════════════════════════

function AttendanceSection() {
  const qrRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<any>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [manualId, setManualId] = useState('');

  const startScanner = async () => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-reader-admin');
      scannerRef.current = scanner;
      setScanning(true);
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (text: string) => {
          handleScanned(text);
          stopScanner();
        },
        () => { }
      );
    } catch (e) {
      console.error('QR scanner error', e);
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current = null;
      }
    } catch { /* already stopped */ }
    setScanning(false);
  };

  useEffect(() => () => { stopScanner(); }, []);

  const handleScanned = async (raw: string) => {
    // Format: SSP-BOOKING:<bookingId>
    const bookingId = raw.startsWith('SSP-BOOKING:') ? raw.replace('SSP-BOOKING:', '') : raw.trim();
    setScanResult(bookingId);
    await fetchBooking(bookingId);
  };

  const fetchBooking = async (id: string) => {
    setLoadingBooking(true);
    setNotFound(false);
    setBooking(null);
    const { data } = await supabase
      .from('seva_bookings')
      .select('*, devotee:devotees(name,email,city,state), booking_deity_sevas(*)')
      .eq('id', id)
      .single();
    if (data) setBooking(data as Booking);
    else setNotFound(true);
    setLoadingBooking(false);
  };

  const updateAttendance = async (status: string) => {
    if (!booking) return;
    setUpdating(true);
    const { error } = await supabase.from('seva_bookings').update({
      attendance_status: status,
      checked_in_at: status === 'attended' ? new Date().toISOString() : null,
    }).eq('id', booking.id);
    if (!error) setBooking(b => b ? { ...b, attendance_status: status, checked_in_at: status === 'attended' ? new Date().toISOString() : null } : b);
    setUpdating(false);
  };

  const reset = () => {
    setScanResult(null);
    setBooking(null);
    setNotFound(false);
    setManualId('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-warm-cream font-bold">Attendance Verification</h2>
        <p className="font-ui text-xs tracking-widest uppercase text-warm-cream/50 mt-0.5">
          Scan receipt QR or enter booking ID manually
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner panel */}
        <div className="rounded-xl border p-6 space-y-5" style={{ background: 'var(--at-card-alt)', borderColor: 'var(--at-border-mid)' }}>
          <p className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/60">QR Scanner</p>

          <div
            id="qr-reader-admin"
            ref={qrRef}
            className="w-full rounded-xl overflow-hidden"
            style={{ background: '#000', minHeight: scanning ? 280 : 0 }}
          />

          {!scanning && !scanResult && (
            <div
              className="flex flex-col items-center justify-center gap-4 rounded-xl py-12"
              style={{ background: 'var(--at-card-alt)', border: '2px dashed var(--at-border-dim)' }}
            >
              <ScanLine size={40} className="text-warm-cream/20" />
              <p className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/50">Camera not active</p>
            </div>
          )}

          <div className="flex gap-3">
            {!scanning ? (
              <button
                onClick={startScanner}
                className="flex items-center gap-2 px-5 py-2.5 bg-sacred-red text-warm-cream rounded-lg font-ui text-xs tracking-widest uppercase hover:bg-sacred-red/80 transition-colors"
              >
                <Camera size={14} /> Start Camera
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-ui text-xs tracking-widest uppercase text-warm-cream/60 hover:text-warm-cream border transition-colors"
                style={{ borderColor: 'var(--at-border-scan)' }}
              >
                <X size={14} /> Stop Camera
              </button>
            )}
            {(scanResult || booking) && (
              <button onClick={reset} className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-ui text-xs tracking-widest uppercase text-warm-cream/60 hover:text-warm-cream border transition-colors" style={{ borderColor: 'var(--at-border-dim)' }}>
                <RefreshCw size={14} /> Reset
              </button>
            )}
          </div>

          {/* Manual entry */}
          <div>
            <p className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/50 mb-2">Or Enter Booking ID Manually</p>
            <div className="flex gap-2">
              <input
                value={manualId}
                onChange={e => setManualId(e.target.value.toUpperCase())}
                placeholder="SSP-XXXXXX"
                className="flex-1 px-3 py-2 rounded-lg text-xs font-ui text-warm-cream/80 focus:outline-none tracking-wider"
                style={{ background: 'var(--at-surface-5)', border: '1px solid var(--at-border-mid)' }}
                onKeyDown={e => { if (e.key === 'Enter' && manualId) { setScanResult(manualId); fetchBooking(manualId); } }}
              />
              <button
                onClick={() => { if (manualId) { setScanResult(manualId); fetchBooking(manualId); } }}
                disabled={!manualId}
                className="px-4 py-2 bg-sacred-red text-warm-cream rounded-lg font-ui text-xs tracking-widest uppercase hover:bg-sacred-red/80 disabled:opacity-40 transition-colors"
              >
                Look up
              </button>
            </div>
          </div>
        </div>

        {/* Booking result panel */}
        <div className="rounded-xl border p-6" style={{ background: 'var(--at-card-alt)', borderColor: 'var(--at-border-mid)' }}>
          <p className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/60 mb-4">Booking Details</p>

          {!scanResult && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <QrCode size={40} className="text-warm-cream/15" />
              <p className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/50">Scan a QR code to verify</p>
            </div>
          )}

          {loadingBooking && (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 size={28} className="animate-spin text-sacred-red" />
              <p className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/50">Looking up booking…</p>
            </div>
          )}

          {notFound && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <XCircle size={36} className="text-red-500/60" />
              <p className="font-ui text-[10px] tracking-widest uppercase text-red-400/70">Booking not found</p>
              <p className="font-sans text-xs text-warm-cream/60">ID: {scanResult}</p>
            </div>
          )}

          {booking && !loadingBooking && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-ui text-xs text-sacred-red font-semibold">{booking.id}</p>
                  <p className="font-serif text-lg text-warm-cream mt-0.5">{booking.devotee?.name ?? booking.devotee_phone}</p>
                  <p className="font-sans text-xs text-warm-cream/70 mt-0.5">{booking.devotee?.email}</p>
                </div>
                <AttendanceBadge status={booking.attendance_status} />
              </div>

              {/* Info grid */}
              <div className="space-y-2 border-t pt-4" style={{ borderColor: 'var(--at-border-faint)' }}>
                {[
                  ['Date', booking.seva_date],
                  ['Time Slot', booking.slot_time ? `${booking.slot_time} — ${booking.slot_name}` : '—'],
                  ['Phone', booking.devotee_phone],
                  ['Type', booking.seva_type === 'offline' ? 'Temple Visit (Offline)' : 'Online Seva'],
                  ['Total', `₹${booking.total.toLocaleString('en-IN')}`],
                  ['Payment', booking.payment_status],
                  ...(booking.checked_in_at ? [['Checked In', new Date(booking.checked_in_at).toLocaleTimeString('en-IN')]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-warm-cream/60 font-ui">{k}</span>
                    <span className="text-warm-cream/80 font-sans text-right">{v}</span>
                  </div>
                ))}
              </div>

              {/* Seva list */}
              {(booking.booking_deity_sevas ?? []).length > 0 && (
                <div className="border-t pt-4 space-y-1.5" style={{ borderColor: 'var(--at-border-faint)' }}>
                  <p className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/50 mb-2">Sevas Booked</p>
                  {booking.booking_deity_sevas!.map((ds, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-warm-cream/60">{ds.deity_name} — {ds.seva_name}</span>
                      <span className="text-spiritual-gold">₹{ds.price.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="border-t pt-4 flex flex-col gap-2" style={{ borderColor: 'var(--at-border-faint)' }}>
                <button
                  onClick={() => updateAttendance('attended')}
                  disabled={updating || booking.attendance_status === 'attended'}
                  className="w-full py-3 rounded-xl font-ui text-sm tracking-widest uppercase text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                  style={{ background: '#059669' }}
                >
                  {updating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  Mark as Attended
                </button>
                <button
                  onClick={() => updateAttendance('not_attended')}
                  disabled={updating || booking.attendance_status === 'not_attended'}
                  className="w-full py-2.5 rounded-xl font-ui text-xs tracking-widest uppercase text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                  style={{ background: '#dc2626' }}
                >
                  {updating ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                  Mark as Absent
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// DONATIONS SECTION
// ════════════════════════════════════════════════════════════════════════════════

function DonationsSection() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('donations').select('*').order('created_at', { ascending: false });
      setDonations((data as Donation[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const totalAmount = donations.filter(d => d.payment_status === 'confirmed').reduce((s, d) => s + d.amount, 0);

  const filtered = donations.filter(d => {
    const q = search.toLowerCase();
    return !q || d.donor_name.toLowerCase().includes(q) || d.donor_phone.includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-serif text-2xl text-warm-cream font-bold">Donations</h2>
          <p className="font-ui text-xs tracking-widest uppercase text-warm-cream/50 mt-0.5">
            {donations.length} donations · ₹{totalAmount.toLocaleString('en-IN')} confirmed
          </p>
        </div>
      </div>

      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-cream/50" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or phone…"
          className="w-full max-w-sm pl-8 pr-4 py-2 text-xs font-sans text-warm-cream/80 rounded-lg focus:outline-none"
          style={{ background: 'var(--at-surface-5)', border: '1px solid var(--at-border-mid)' }}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-sacred-red" /></div>
      ) : (
        <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--at-border-mid)' }}>
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr style={{ background: 'var(--at-table-head)' }}>
                {['Donor', 'Phone', 'Type', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-ui text-[10px] tracking-widest uppercase text-warm-cream/60">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr key={d.id} style={{ background: i % 2 === 0 ? 'var(--at-surface-2)' : 'transparent' }} className="border-t">
                  <td className="px-4 py-3 font-sans text-xs text-warm-cream/80">{d.donor_name}</td>
                  <td className="px-4 py-3 font-sans text-xs text-warm-cream/70">{d.donor_phone}</td>
                  <td className="px-4 py-3 font-sans text-xs text-warm-cream/70">{d.donation_type}</td>
                  <td className="px-4 py-3 font-sans text-xs text-spiritual-gold">₹{d.amount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3"><PaymentBadge status={d.payment_status} /></td>
                  <td className="px-4 py-3 font-sans text-xs text-warm-cream/60">{new Date(d.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-warm-cream/50 font-ui text-xs tracking-widest uppercase">No donations found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// DEVOTEES SECTION
// ════════════════════════════════════════════════════════════════════════════════

interface DevoteeRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  gotra: string;
  created_at: string;
  bookings: Booking[];
}

function DevoteesSection() {
  const [devotees, setDevotees] = useState<DevoteeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: devData }, { data: bkData }] = await Promise.all([
      supabase.from('devotees').select('*').order('created_at', { ascending: false }),
      supabase.from('seva_bookings').select('*, booking_deity_sevas(*)').order('created_at', { ascending: false }),
    ]);
    const bookings = (bkData as Booking[]) ?? [];
    const devs: DevoteeRow[] = ((devData as any[]) ?? []).map(d => ({
      ...d,
      bookings: bookings.filter(b => b.devotee_phone === d.phone),
    }));
    setDevotees(devs);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = devotees.filter(d => {
    const q = search.toLowerCase();
    return !q || d.name.toLowerCase().includes(q) || d.phone.includes(q) || d.email.toLowerCase().includes(q);
  });

  const allFamilyMembers = (d: DevoteeRow) => {
    const members = new Set<string>();
    d.bookings.forEach(b => (b.family_members ?? []).forEach(m => members.add(m)));
    return Array.from(members);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-serif text-2xl text-warm-cream font-bold">Devotees</h2>
          <p className="font-ui text-xs tracking-widest uppercase text-warm-cream/50 mt-0.5">
            {devotees.length} registered · search by name, phone, or email
          </p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg font-ui text-xs tracking-widest uppercase text-warm-cream/60 hover:text-warm-cream border transition-colors" style={{ borderColor: 'var(--at-border-dim)' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-cream/50" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, phone, or email…"
          className="w-full max-w-sm pl-8 pr-4 py-2 text-xs font-sans text-warm-cream/80 rounded-lg focus:outline-none"
          style={{ background: 'var(--at-surface-5)', border: '1px solid var(--at-border-mid)' }}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-sacred-red" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map(d => {
            const lastBk = d.bookings[0] ?? null;
            const members = allFamilyMembers(d);
            const isOpen = expanded === d.id;
            return (
              <div key={d.id} className="rounded-xl border overflow-hidden" style={{ background: 'var(--at-card-alt)', borderColor: 'var(--at-border-faint)' }}>
                <button
                  className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpanded(isOpen ? null : d.id)}
                >
                  <div className="w-9 h-9 rounded-full bg-sacred-red/15 flex items-center justify-center flex-shrink-0">
                    <User size={15} className="text-sacred-red" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-serif text-sm text-warm-cream font-semibold">{d.name}</span>
                      <span className="font-ui text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full" style={{ background: 'var(--at-border-mid)', color: 'var(--at-text-dim)' }}>
                        {d.bookings.length} booking{d.bookings.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-0.5 flex-wrap">
                      <span className="font-sans text-xs text-warm-cream/70">{d.phone}</span>
                      {d.email && <span className="font-sans text-xs text-warm-cream/55">{d.email}</span>}
                      {lastBk && <span className="font-sans text-xs text-spiritual-gold/70">Last: {lastBk.seva_date}</span>}
                    </div>
                  </div>
                  {isOpen ? <ChevronUp size={14} className="text-warm-cream/50 flex-shrink-0" /> : <ChevronDown size={14} className="text-warm-cream/50 flex-shrink-0" />}
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t grid grid-cols-1 md:grid-cols-2 gap-6" style={{ borderColor: 'var(--at-border)' }}>
                        {/* Profile details */}
                        <div className="pt-4 space-y-2">
                          <p className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/50 mb-3">Profile</p>
                          {[
                            ['Phone', d.phone],
                            ['Email', d.email || '—'],
                            ['City', d.city || '—'],
                            ['State', d.state || '—'],
                            ['Gotra', d.gotra || '—'],
                            ['Registered', new Date(d.created_at).toLocaleDateString('en-IN')],
                          ].map(([k, v]) => (
                            <div key={k} className="flex justify-between text-xs">
                              <span className="text-warm-cream/60 font-ui">{k}</span>
                              <span className="text-warm-cream/80 font-sans text-right">{v}</span>
                            </div>
                          ))}
                          {members.length > 0 && (
                            <div className="pt-2">
                              <p className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/50 mb-2">Family Members</p>
                              <div className="flex flex-wrap gap-1">
                                {members.map(m => (
                                  <span key={m} className="px-2 py-0.5 rounded-full font-ui text-[9px] tracking-wider uppercase text-warm-cream/60" style={{ background: 'var(--at-border-mid)' }}>
                                    {m}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Bookings list */}
                        <div className="pt-4">
                          <p className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/50 mb-3">Bookings ({d.bookings.length})</p>
                          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {d.bookings.length === 0 ? (
                              <p className="font-sans text-xs text-warm-cream/50">No bookings yet</p>
                            ) : d.bookings.map(b => (
                              <div key={b.id} className="rounded-lg p-3 border" style={{ background: 'var(--at-surface-2)', borderColor: 'var(--at-border-faint)' }}>
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <span className="font-ui text-[10px] text-sacred-red">{b.id}</span>
                                  <div className="flex gap-1">
                                    <PaymentBadge status={b.payment_status} />
                                    <AttendanceBadge status={b.attendance_status} />
                                  </div>
                                </div>
                                <div className="mt-1 flex items-center gap-3 flex-wrap">
                                  <span className="font-sans text-xs text-warm-cream/70">{b.seva_date}</span>
                                  <span className="font-sans text-xs text-spiritual-gold">₹{b.total.toLocaleString('en-IN')}</span>
                                  {b.slot_time && <span className="font-sans text-xs text-warm-cream/55">{b.slot_time}</span>}
                                </div>
                                {(b.family_members ?? []).length > 0 && (
                                  <p className="font-sans text-[10px] text-warm-cream/50 mt-1">
                                    Family: {b.family_members.join(', ')}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          {filtered.length === 0 && !loading && (
            <div className="text-center py-16 text-warm-cream/50 font-ui text-xs tracking-widest uppercase">
              No devotees found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// USER MANAGEMENT SECTION
// ════════════════════════════════════════════════════════════════════════════════

function UserManagementSection({ profile }: { profile: AdminProfile }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'admin' });
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const isSuperAdmin = profile.user_role === 'super_admin';

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('admin_profiles').select('*').order('created_at', { ascending: false });
    setUsers((data as AdminUser[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const callEdgeFn = async (body: object) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-admin-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(body),
    });
    return res.json().then(d => ({ ok: res.ok, ...d }));
  };

  const createUser = async () => {
    if (!form.name || !form.email || !form.password) return;
    setCreating(true);
    setError('');
    setSuccess('');
    const result = await callEdgeFn(form);
    if (!result.ok) {
      setError(result.error ?? 'Failed to create user');
    } else {
      setSuccess(`User "${form.name}" created successfully`);
      setForm({ name: '', email: '', phone: '', password: '', role: 'admin' });
      load();
    }
    setCreating(false);
  };

  const deleteUser = async (u: AdminUser) => {
    if (!confirm(`Delete user "${u.name || u.email}"? This cannot be undone.`)) return;
    setDeletingId(u.user_id);
    const result = await callEdgeFn({ action: 'delete', target_user_id: u.user_id });
    if (!result.ok) {
      setError(result.error ?? 'Failed to delete user');
    } else {
      setUsers(prev => prev.filter(x => x.user_id !== u.user_id));
    }
    setDeletingId(null);
  };

  const roleColors: Record<string, { bg: string; text: string }> = {
    super_admin: { bg: '#7f1d1d22', text: '#f87171' },
    admin: { bg: '#1e3a5f22', text: '#60a5fa' },
    manager: { bg: '#14532d22', text: '#4ade80' },
  };

  const fieldCls = "w-full px-3 py-2 rounded-lg text-xs font-sans text-warm-cream/80 focus:outline-none";
  const fieldStyle = { background: 'var(--at-surface-5)', border: '1px solid var(--at-border-mid)' };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-warm-cream font-bold">User Management</h2>
        <p className="font-ui text-xs tracking-widest uppercase text-warm-cream/50 mt-0.5">
          Admin &amp; manager accounts · {users.length} users
        </p>
      </div>

      {isSuperAdmin ? (
        <div className="rounded-xl p-5 border" style={{ background: 'var(--at-card-alt)', borderColor: 'var(--at-border-mid)' }}>
          <p className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/60 mb-4">Create New User</p>

          {error && (
            <div className="flex items-center gap-2 rounded-lg px-4 py-3 mb-4 text-xs text-red-400" style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)' }}>
              <XCircle size={13} /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-lg px-4 py-3 mb-4 text-xs text-emerald-400" style={{ background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.2)' }}>
              <CheckCircle2 size={13} /> {success}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/60 mb-1.5 block">Full Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Name" className={fieldCls} style={fieldStyle} />
            </div>
            <div>
              <label className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/60 mb-1.5 block">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="user@example.com" className={fieldCls} style={fieldStyle} />
            </div>
            <div>
              <label className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/60 mb-1.5 block">Phone Number</label>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" className={fieldCls} style={fieldStyle} />
            </div>
            <div>
              <label className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/60 mb-1.5 block">Password *</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Min. 6 characters"
                  className={`${fieldCls} pr-9`}
                  style={fieldStyle}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-cream/50 hover:text-warm-cream/80">
                  {showPwd ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>
            <div>
              <label className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/60 mb-1.5 block">Role *</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className={fieldCls} style={fieldStyle}>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
              </select>
            </div>
          </div>

          <button
            onClick={createUser}
            disabled={creating || !form.name || !form.email || !form.password}
            className="flex items-center gap-2 px-5 py-2.5 bg-sacred-red text-warm-cream rounded-lg font-ui text-xs tracking-widest uppercase hover:bg-sacred-red/80 disabled:opacity-50 transition-colors"
          >
            {creating ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
            {creating ? 'Creating…' : 'Create User'}
          </button>
        </div>
      ) : (
        <div className="rounded-xl p-4 border" style={{ background: 'var(--at-gold-hint)', borderColor: 'var(--at-gold-border)' }}>
          <p className="font-ui text-[10px] tracking-widest uppercase text-spiritual-gold mb-1">Read-only Access</p>
          <p className="font-sans text-xs text-warm-cream/70">Only the Super Admin can create or remove user accounts.</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-sacred-red" /></div>
      ) : (
        <div className="rounded-xl overflow-x-auto border" style={{ borderColor: 'var(--at-border-mid)' }}>
          <table className="w-full text-sm min-w-[540px]">
            <thead>
              <tr style={{ background: 'var(--at-table-head)' }}>
                {['Name', 'Email', 'Phone', 'Role', 'Created', ...(isSuperAdmin ? ['Actions'] : [])].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-ui text-[10px] tracking-widest uppercase text-warm-cream/60">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => {
                const rc = roleColors[u.user_role] ?? roleColors.admin;
                const isYou = u.email === profile.email;
                return (
                  <tr key={u.id} style={{ background: i % 2 === 0 ? 'var(--at-surface-2)' : 'transparent' }} className="border-t">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-sacred-red/15 flex items-center justify-center flex-shrink-0">
                          <User size={11} className="text-sacred-red" />
                        </div>
                        <span className="font-sans text-xs text-warm-cream/80">{u.name || '—'}</span>
                        {isYou && <span className="font-ui text-[8px] px-1.5 rounded bg-sacred-red/20 text-sacred-red tracking-wider">You</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-sans text-xs text-warm-cream/70">{u.email}</td>
                    <td className="px-4 py-3 font-sans text-xs text-warm-cream/70">{u.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full font-ui text-[9px] tracking-wider uppercase" style={{ background: rc.bg, color: rc.text }}>
                        {u.user_role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans text-xs text-warm-cream/60">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : '—'}
                    </td>
                    {isSuperAdmin && (
                      <td className="px-4 py-3">
                        {!isYou && (
                          <button
                            onClick={() => deleteUser(u)}
                            disabled={deletingId === u.user_id}
                            className="flex items-center gap-1 px-2 py-1 rounded font-ui text-[9px] tracking-widest uppercase text-red-400/60 hover:text-red-400 border border-red-500/10 hover:border-red-500/30 disabled:opacity-40 transition-colors"
                          >
                            {deletingId === u.user_id ? <Loader2 size={9} className="animate-spin" /> : <Trash2 size={9} />} Remove
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-warm-cream/50 font-ui text-xs tracking-widest uppercase">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD LAYOUT
// ════════════════════════════════════════════════════════════════════════════════

interface AdminDashboardPageProps {
  profile: AdminProfile;
  onLogout: () => void;
  onBack: () => void;
}

export default function AdminDashboardPage({ profile, onLogout, onBack }: AdminDashboardPageProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState<Stats>({ totalBookings: 0, todayBookings: 0, totalRevenue: 0, todayRevenue: 0, weekRevenue: 0, attendanceRate: 0, pendingAttendance: 0, activeSlots: 0 });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [isDark, setIsDark] = useState<boolean>(() => {
    try { return localStorage.getItem('admin-theme') !== 'light'; } catch { return true; }
  });
  const toggleTheme = () => setIsDark(prev => {
    const next = !prev;
    try { localStorage.setItem('admin-theme', next ? 'dark' : 'light'); } catch { /**/ }
    return next;
  });

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().split('T')[0];
      const [{ data: bookings }, { data: slots }] = await Promise.all([
        supabase.from('seva_bookings').select('*, devotee:devotees(name)').order('created_at', { ascending: false }),
        supabase.from('ref_slots').select('is_active'),
      ]);

      const bk = (bookings as Booking[]) ?? [];
      const todayBk = bk.filter(b => b.seva_date_iso === today);
      const confirmed = bk.filter(b => b.payment_status === 'confirmed');
      const revenue = confirmed.reduce((s, b) => s + b.total, 0);
      const todayRevenue = todayBk.filter(b => b.payment_status === 'confirmed').reduce((s, b) => s + b.total, 0);
      const now = new Date();
      const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
      const weekStartStr = weekStart.toISOString().split('T')[0];
      const weekBk = bk.filter(b => b.seva_date_iso >= weekStartStr && b.payment_status === 'confirmed');
      const weekRevenue = weekBk.reduce((s, b) => s + b.total, 0);
      const attended = bk.filter(b => b.attendance_status === 'attended').length;
      const pending = bk.filter(b => b.payment_status === 'confirmed' && b.attendance_status === 'pending').length;
      const rate = bk.length > 0 ? Math.round((attended / bk.length) * 100) : 0;
      const activeSlots = ((slots as Slot[]) ?? []).filter(s => s.is_active).length;

      setStats({ totalBookings: bk.length, todayBookings: todayBk.length, totalRevenue: revenue, todayRevenue, weekRevenue, attendanceRate: rate, pendingAttendance: pending, activeSlots });
      setRecentBookings(bk.slice(0, 8));
      setLoadingStats(false);
    })();
  }, []);

  const sectionLabel = NAV_ITEMS.find(n => n.section === activeSection)?.label ?? '';

  return (
    <div className="min-h-screen flex" data-admin-theme={isDark ? 'dark' : 'light'} style={{ background: 'var(--at-bg)' }}>
      {/* ── Collapsed sidebar (desktop, icon-only) ──────────────────── */}
      <aside
        className="hidden lg:flex fixed top-0 left-0 h-full z-30 flex-col items-center"
        style={{ width: 64, background: 'var(--at-sidebar-bg)', borderRight: '1px solid var(--at-border)' }}
      >
        {/* Logo */}
        <div className="py-5 border-b w-full flex justify-center" style={{ borderColor: 'var(--at-border)' }}>
          <img src={logoImage} alt="Sri Siddheswari Peetham Logo" loading="lazy" className="w-8 h-8 object-contain" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 w-full px-2 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.filter(n => !n.superAdminOnly || profile.user_role === 'super_admin').map(({ section, label, icon }) => {
            const active = activeSection === section;
            return (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                title={label}
                className="w-full flex justify-center py-2.5 rounded-lg transition-all"
                style={{
                  background: active ? 'var(--at-nav-active)' : 'transparent',
                  color: active ? '#A02D23' : isDark ? 'rgba(253,251,247,0.4)' : 'rgba(42,26,14,0.5)',
                }}
              >
                <span style={{ color: active ? '#A02D23' : isDark ? 'rgba(253,251,247,0.3)' : 'rgba(42,26,14,0.4)' }}>{icon}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="w-full px-2 py-4 border-t space-y-1" style={{ borderColor: 'var(--at-border)' }}>
          <button onClick={onBack} title="Back to Site"
            className="w-full flex justify-center py-2 rounded-lg text-warm-cream/40 hover:text-warm-cream/60 transition-colors">
            <ArrowLeft size={15} />
          </button>
          <button onClick={onLogout} title="Sign Out"
            className="w-full flex justify-center py-2 rounded-lg text-warm-cream/40 hover:text-red-400 transition-colors">
            <LogOut size={15} />
          </button>
          <button onClick={() => setSidebarOpen(true)} title="Expand Sidebar"
            className="w-full flex justify-center py-2 rounded-lg text-warm-cream/40 hover:text-warm-cream/60 transition-colors">
            <ChevronRight size={15} />
          </button>
        </div>
      </aside>

      {/* ── Expanded sidebar ─────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            key="expanded-sidebar"
            initial={{ x: -260, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -260, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed top-0 left-0 h-full z-40 flex flex-col"
            style={{ width: 220, background: 'var(--at-sidebar-bg)', borderRight: '1px solid var(--at-border)' }}
          >
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: 'var(--at-border)' }}>
              <img src={logoImage} alt="Sri Siddheswari Peetham Logo" loading="lazy" className="w-8 h-8 object-contain flex-shrink-0" />
              <div className="flex flex-col">
                <span className="font-serif text-sm text-warm-cream leading-tight">Sri Siddheswari Peetham</span>
                <span className="font-ui text-[8px] tracking-[0.2em] uppercase text-warm-cream/50">Admin Dashboard</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="ml-auto text-warm-cream/40 hover:text-warm-cream/70 transition-colors lg:hidden">
                <X size={16} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              {NAV_ITEMS.filter(n => !n.superAdminOnly || profile.user_role === 'super_admin').map(({ section, label, icon }) => {
                const active = activeSection === section;
                return (
                  <button
                    key={section}
                    onClick={() => { setActiveSection(section); setSidebarOpen(window.innerWidth >= 1024); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
                    style={{
                      background: active ? 'var(--at-nav-active)' : 'transparent',
                      color: active ? '#A02D23' : isDark ? 'rgba(253,251,247,0.4)' : 'rgba(42,26,14,0.5)',
                    }}
                  >
                    <span style={{ color: active ? '#A02D23' : isDark ? 'rgba(253,251,247,0.3)' : 'rgba(42,26,14,0.4)' }}>{icon}</span>
                    <span className="font-ui text-xs tracking-widest uppercase">{label}</span>
                    {active && <ChevronRight size={12} className="ml-auto" style={{ color: '#A02D23' }} />}
                  </button>
                );
              })}
            </nav>

            {/* User info */}
            <div className="px-4 py-4 border-t space-y-3" style={{ borderColor: 'var(--at-border)' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-sacred-red/20 flex items-center justify-center flex-shrink-0">
                  <User size={13} className="text-sacred-red" />
                </div>
                <div className="min-w-0">
                  <p className="font-ui text-[10px] text-warm-cream/70 truncate">{profile.name || profile.email}</p>
                  <p className="font-ui text-[9px] tracking-widest uppercase text-warm-cream/50">{profile.user_role}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-ui text-[10px] tracking-widest uppercase text-warm-cream/50 hover:text-red-400 hover:bg-red-900/10 transition-colors"
              >
                <LogOut size={13} /> Sign Out
              </button>
              <button
                onClick={onBack}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-ui text-[10px] tracking-widest uppercase text-warm-cream/40 hover:text-warm-cream/60 transition-colors"
              >
                <ArrowLeft size={13} /> Back to Site
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main content ──────────────────────────────────────────── */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-[220px]' : 'lg:ml-16'}`}
      >
        {/* Topbar */}
        <header
          className="sticky top-0 z-30 flex items-center gap-4 px-6 py-4 border-b"
          style={{ background: 'var(--at-header-bg)', borderColor: 'var(--at-border)', backdropFilter: 'blur(12px)' }}
        >
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="text-warm-cream/60 hover:text-warm-cream/80 transition-colors"
          >
            <Menu size={18} />
          </button>
          <div className="flex-1">
            <div className="font-ui text-xs tracking-widest uppercase text-warm-cream/70">{sectionLabel}</div>
          </div>
          <div className="flex items-center gap-3">
            <AnimatedThemeToggler isDark={isDark} onToggle={toggleTheme} size={32} />
            <div className="flex items-center gap-2">
              <Shield size={13} className="text-sacred-red/50" />
              <span className="font-ui text-[9px] tracking-widest uppercase text-warm-cream/40">{profile.user_role}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeSection === 'overview' && (
                loadingStats
                  ? <div className="flex justify-center py-24"><Loader2 size={28} className="animate-spin text-sacred-red" /></div>
                  : <OverviewSection stats={stats} recentBookings={recentBookings} onNavigateToBookings={() => setActiveSection('bookings')} />
              )}
              {activeSection === 'bookings' && <PaginatedBookings />}
              {activeSection === 'slots' && <PaginatedSlots />}
              {activeSection === 'sevas' && <PaginatedSevas />}
              {activeSection === 'deities' && <DeitiesSection onNavigateToSevas={() => setActiveSection('sevas')} />}
              {activeSection === 'attendance' && <AttendanceSection />}
              {activeSection === 'donations' && <DonationsSection />}
              {activeSection === 'devotees' && <DevoteesSection />}
              {activeSection === 'users' && <UserManagementSection profile={profile} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
