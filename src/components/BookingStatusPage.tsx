import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, ArrowLeft, Download, CheckCircle2, Clock, Calendar,
  User, X, ChevronDown, ChevronUp, Phone, Lock, Loader2, AlertCircle,
  QrCode, ScanLine, Wifi, Building, XCircle, Home, ChevronLeft,
} from 'lucide-react';
import type { BookingRecord } from './SevaBookingModal';
import { supabase } from '../lib/supabase';
import { downloadBookingPDF } from '../lib/pdfReceipt';
import ScrollVelocity from './ScrollVelocity';

interface BookingStatusPageProps {
  onBack: () => void;
}

function generateReceiptHTML(b: BookingRecord): string {
  return `<!DOCTYPE html>
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
  <div class="badge">SEVA BOOKING RECEIPT</div>
  <p class="sub" style="margin-top:8px">Booking ID: <strong>${b.id}</strong> &nbsp;|&nbsp; ${new Date(b.createdAt).toLocaleDateString('en-IN')}</p>
</div><hr/>
<div class="sec"><h2>Devotee</h2>
  <div class="row"><span>Name</span><span>${b.devotee.name}</span></div>
  <div class="row"><span>Phone</span><span>${b.devotee.phone}</span></div>
  <div class="row"><span>Email</span><span>${b.devotee.email}</span></div>
  <div class="row"><span>From</span><span>${b.devotee.city}, ${b.devotee.state}</span></div>
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
<div class="footer"><p>Om Namah Shivaya · Sri Siddheswari Peetham, Courtallam.</p></div>
</body></html>`;
}

function downloadReceipt(b: BookingRecord) {
  downloadBookingPDF(b);
}

// Map Supabase rows → BookingRecord shape
function rowsToBookingRecord(booking: any, devotee: any): BookingRecord {
  return {
    id: booking.id,
    date: booking.seva_date,
    dateIso: booking.seva_date_iso ?? '',
    sevaType: (booking.seva_type ?? 'offline') as 'online' | 'offline',
    slot: booking.slot_id
      ? { id: booking.slot_id, time: booking.slot_time, name: booking.slot_name, price: booking.slot_price, available: true }
      : null,
    deitySevas: (booking.booking_deity_sevas || []).map((ds: any) => ({
      deity: { id: ds.deity_id, name: ds.deity_name, sevas: [], grad: '' },
      seva: ds.seva_name,
      price: ds.price,
    })),
    devotee: {
      name: devotee?.name ?? '',
      email: devotee?.email ?? '',
      phone: devotee?.phone ?? booking.devotee_phone,
      city: devotee?.city ?? '',
      state: devotee?.state ?? '',
      gotra: devotee?.gotra ?? '',
    },
    familyMembers: booking.family_members ?? [],
    total: booking.total,
    status: 'confirmed',
    createdAt: booking.created_at,
    paymentMethod: booking.payment_method,
  };
}

// Compute live status based on slot time + 30-min grace period
function computeStatus(booking: BookingRecord): 'upcoming' | 'live' | 'completed' {
  if (!booking.slot || !booking.dateIso) return 'upcoming';
  const [y, mo, d] = booking.dateIso.split('-').map(Number);
  const timeStr = booking.slot.time; // e.g. "6:00 AM"
  const [timePart, ampm] = timeStr.split(' ');
  let [h, m] = timePart.split(':').map(Number);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  const slotAt = new Date(y, mo - 1, d, h, m, 0);
  const graceEnd = new Date(slotAt.getTime() + 30 * 60 * 1000);
  const now = new Date();
  if (now >= graceEnd) return 'completed';
  if (now >= slotAt) return 'live';
  return 'upcoming';
}

const STATUS_CONFIG = {
  upcoming: { label: 'Upcoming', bg: 'rgba(212,175,55,0.12)', color: '#D4AF37', border: 'rgba(212,175,55,0.25)' },
  live: { label: 'Live Now', bg: 'rgba(16,185,129,0.12)', color: '#34d399', border: 'rgba(16,185,129,0.3)' },
  completed: { label: 'Completed', bg: 'rgba(100,100,120,0.12)', color: '#9ca3af', border: 'rgba(100,100,120,0.2)' },
};

function BookingCard({ booking }: { booking: BookingRecord }) {
  const [expanded, setExpanded] = useState(false);
  const status = computeStatus(booking);
  const sc = STATUS_CONFIG[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.12)' }}
    >
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: sc.bg, border: `1px solid ${sc.border}` }}>
              {status === 'completed'
                ? <CheckCircle2 size={16} style={{ color: sc.color }} />
                : status === 'live'
                  ? <Clock size={16} style={{ color: sc.color }} className="animate-pulse" />
                  : <Calendar size={16} style={{ color: sc.color }} />}
            </div>
            <div className="min-w-0">
              <p className="text-spiritual-gold font-ui text-[11px] font-bold tracking-wider">{booking.id}</p>
              <p className="text-warm-cream/55 font-ui text-[10px] truncate">{booking.devotee.name}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0 space-y-1">
            <p className="text-spiritual-gold font-bold text-sm">₹{booking.total.toLocaleString('en-IN')}</p>
            <div className="flex gap-1 justify-end">
              {/* Seva type */}
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[7px] font-ui font-bold uppercase tracking-widest"
                style={{ background: booking.sevaType === 'online' ? 'rgba(16,185,129,0.1)' : 'rgba(212,175,55,0.1)', color: booking.sevaType === 'online' ? '#34d399' : '#D4AF37', border: `1px solid ${booking.sevaType === 'online' ? 'rgba(16,185,129,0.2)' : 'rgba(212,175,55,0.2)'}` }}>
                {booking.sevaType === 'online' ? <Wifi size={8} /> : <Building size={8} />}
                {booking.sevaType}
              </span>
              {/* Status */}
              <span className="inline-block px-2 py-0.5 rounded-full text-[7px] font-ui font-bold uppercase tracking-widest"
                style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                {sc.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
          <span className="flex items-center gap-1 text-warm-cream/35 font-ui text-[9px] uppercase tracking-widest">
            <Calendar size={10} className="text-spiritual-gold/40" />
            {booking.date.split(',').slice(0, 2).join(',')}
          </span>
          {booking.slot && (
            <span className="flex items-center gap-1 text-warm-cream/35 font-ui text-[9px] uppercase tracking-widest">
              <Clock size={10} className="text-spiritual-gold/40" />
              {booking.slot.time}
            </span>
          )}
          <span className="flex items-center gap-1 text-warm-cream/35 font-ui text-[9px] uppercase tracking-widest">
            <User size={10} className="text-spiritual-gold/40" />
            {booking.devotee.city}, {booking.devotee.state}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {booking.deitySevas.map((ds, i) => (
            <span key={i} className="px-2.5 py-0.5 rounded-full font-ui text-[8px] uppercase tracking-wider"
              style={{ background: 'rgba(160,45,35,0.12)', color: 'rgba(253,251,247,0.55)', border: '1px solid rgba(160,45,35,0.2)' }}>
              {ds.deity.name.split(' ').slice(-2).join(' ')} · {ds.seva}
            </span>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(212,175,55,0.08)' }}>
        <button onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center justify-between px-5 py-2.5 text-warm-cream/25 hover:text-warm-cream/50 transition-colors">
          <span className="font-ui text-[9px] uppercase tracking-widest">{expanded ? 'Hide details' : 'View details'}</span>
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="px-5 pb-4 space-y-3">
                <div>
                  <p className="font-ui text-[8px] uppercase tracking-[0.2em] text-spiritual-gold/40 font-semibold mb-1.5">Devotee</p>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {[
                      ['Name', booking.devotee.name],
                      ['Phone', booking.devotee.phone],
                      ['Email', booking.devotee.email],
                      ['From', `${booking.devotee.city}, ${booking.devotee.state}`],
                      ...(booking.devotee.gotra ? [['Gotra', booking.devotee.gotra]] : []),
                      ...(booking.familyMembers.length ? [['Family', booking.familyMembers.join(', ')]] : []),
                    ].map(([k, v]) => (
                      <div key={k}>
                        <span className="text-warm-cream/25 font-ui text-[8px] uppercase tracking-widest block">{k}</span>
                        <span className="text-warm-cream/65">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(212,175,55,0.08)', paddingTop: '10px' }}>
                  <p className="font-ui text-[8px] uppercase tracking-[0.2em] text-spiritual-gold/40 font-semibold mb-1.5">Seva Breakdown</p>
                  {booking.deitySevas.map((ds, i) => (
                    <div key={i} className="flex justify-between text-xs py-0.5">
                      <span className="text-warm-cream/50">{ds.deity.name} — {ds.seva}</span>
                      <span className="text-warm-cream/65">₹{ds.price.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs font-bold mt-1.5 pt-1.5" style={{ borderTop: '1px solid rgba(212,175,55,0.1)' }}>
                    <span className="text-spiritual-gold/70">Total</span>
                    <span className="text-spiritual-gold">₹{booking.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button onClick={() => downloadReceipt(booking)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl font-ui text-[9px] tracking-widest uppercase font-semibold transition-all"
                  style={{ border: '1px solid rgba(212,175,55,0.2)', color: 'rgba(212,175,55,0.7)', background: 'rgba(212,175,55,0.05)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.05)')}>
                  <Download size={11} /> Download Receipt
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── QR Scanner ────────────────────────────────────────────────────────────────
function QRScanner({ onClose }: { onClose: () => void }) {
  const [scannerResult, setScannerResult] = useState<'idle' | 'scanning' | 'loading' | 'found' | 'notfound' | 'error'>('idle');
  const [scannedBooking, setScannedBooking] = useState<BookingRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const scannerRef = useRef<any>(null);
  const divId = 'ssp-qr-scanner';

  const startScan = async () => {
    setScannerResult('scanning');
    const { Html5Qrcode } = await import('html5-qrcode');
    scannerRef.current = new Html5Qrcode(divId);
    scannerRef.current.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      async (decodedText: string) => {
        await scannerRef.current?.stop();
        if (!decodedText.startsWith('SSP-BOOKING:')) {
          setScannerResult('error');
          setErrorMsg('Not a valid SSP receipt QR code.');
          return;
        }
        const bookingId = decodedText.replace('SSP-BOOKING:', '').trim();
        setScannerResult('loading');
        try {
          const { data: bRow } = await supabase
            .from('seva_bookings').select('*, booking_deity_sevas(*)')
            .eq('id', bookingId).maybeSingle();
          if (!bRow) { setScannerResult('notfound'); return; }
          const { data: dRow } = await supabase
            .from('devotees').select('*').eq('phone', bRow.devotee_phone).maybeSingle();
          setScannedBooking(rowsToBookingRecord(bRow, dRow));
          setScannerResult('found');
        } catch { setScannerResult('error'); setErrorMsg('Failed to look up booking.'); }
      },
      () => { }
    ).catch(() => { setScannerResult('error'); setErrorMsg('Camera access denied.'); });
  };

  useEffect(() => {
    return () => { scannerRef.current?.stop().catch(() => { }); };
  }, []);

  const status = scannedBooking ? computeStatus(scannedBooking) : null;
  const sc = status ? STATUS_CONFIG[status] : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-[400] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="w-full max-w-sm rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(175deg,#0f0603,#1c0b05)', border: '1px solid rgba(212,175,55,0.2)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
          <div className="flex items-center gap-2">
            <ScanLine size={16} className="text-spiritual-gold/60" />
            <span className="font-ui text-[10px] uppercase tracking-widest text-warm-cream/70">Scan Receipt QR</span>
          </div>
          <button onClick={onClose}><XCircle size={18} className="text-warm-cream/30 hover:text-warm-cream transition-colors" /></button>
        </div>

        <div className="p-5">
          {scannerResult === 'idle' && (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}>
                <QrCode size={36} className="text-spiritual-gold/50" />
              </div>
              <p className="text-warm-cream/60 font-ui text-[9px] uppercase tracking-widest mb-5">Point camera at the QR code on the receipt</p>
              <button onClick={startScan}
                className="w-full py-3 rounded-xl font-ui text-[10px] uppercase tracking-widest font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#A02D23,#7a2018)', border: '1px solid rgba(212,175,55,0.2)' }}>
                Open Camera
              </button>
            </div>
          )}

          {scannerResult === 'scanning' && (
            <div>
              <div id={divId} className="w-full rounded-xl overflow-hidden" style={{ minHeight: '260px' }} />
              <p className="text-warm-cream/30 font-ui text-[8px] uppercase tracking-widest text-center mt-3">Align QR code within the frame</p>
            </div>
          )}

          {scannerResult === 'loading' && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 size={28} className="text-spiritual-gold/50 animate-spin" />
              <p className="text-warm-cream/40 font-ui text-[9px] uppercase tracking-widest">Looking up booking…</p>
            </div>
          )}

          {scannerResult === 'found' && scannedBooking && sc && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: sc.bg, border: `1px solid ${sc.border}` }}>
                <span className="font-ui text-[9px] uppercase tracking-widest font-bold" style={{ color: sc.color }}>{sc.label}</span>
                {status === 'live' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
              </div>
              <div className="p-3 rounded-xl space-y-1.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.1)' }}>
                <p className="text-spiritual-gold font-ui text-[11px] font-bold">{scannedBooking.id}</p>
                <p className="text-warm-cream/60 text-xs">{scannedBooking.devotee.name} · {scannedBooking.devotee.phone}</p>
                <p className="text-warm-cream/40 text-[10px]">{scannedBooking.date}</p>
                {scannedBooking.slot && <p className="text-warm-cream/40 text-[10px]">Slot: {scannedBooking.slot.time} — {scannedBooking.slot.name}</p>}
                <div className="flex flex-wrap gap-1 pt-1">
                  {scannedBooking.deitySevas.map((ds, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full font-ui text-[7px] uppercase tracking-wider"
                      style={{ background: 'rgba(160,45,35,0.15)', color: 'rgba(253,251,247,0.5)', border: '1px solid rgba(160,45,35,0.2)' }}>
                      {ds.deity.name.split(' ').slice(-1)[0]} · {ds.seva}
                    </span>
                  ))}
                </div>
                <p className="text-spiritual-gold font-bold text-sm pt-1">₹{scannedBooking.total.toLocaleString('en-IN')}</p>
              </div>
              {status === 'completed' && (
                <p className="text-warm-cream/25 font-ui text-[8px] uppercase tracking-widest text-center">
                  Seva completed — slot grace period elapsed
                </p>
              )}
              <button onClick={() => { setScannerResult('idle'); setScannedBooking(null); }}
                className="w-full py-2.5 rounded-xl font-ui text-[9px] uppercase tracking-widest text-warm-cream/40 hover:text-warm-cream/70 transition-colors"
                style={{ border: '1px solid rgba(212,175,55,0.1)' }}>
                Scan Another
              </button>
            </div>
          )}

          {scannerResult === 'notfound' && (
            <div className="text-center py-6">
              <AlertCircle size={28} className="text-red-400/60 mx-auto mb-3" />
              <p className="text-red-400/60 font-ui text-[10px] tracking-wider mb-4">Booking not found in our system</p>
              <button onClick={() => setScannerResult('idle')} className="px-5 py-2 rounded-xl font-ui text-[9px] uppercase tracking-widest text-warm-cream/40 hover:text-warm-cream/70 transition-colors" style={{ border: '1px solid rgba(212,175,55,0.1)' }}>Try Again</button>
            </div>
          )}

          {scannerResult === 'error' && (
            <div className="text-center py-6">
              <AlertCircle size={28} className="text-red-400/60 mx-auto mb-3" />
              <p className="text-red-400/60 font-ui text-[10px] tracking-wider mb-1">{errorMsg}</p>
              <button onClick={() => setScannerResult('idle')} className="mt-3 px-5 py-2 rounded-xl font-ui text-[9px] uppercase tracking-widest text-warm-cream/40 hover:text-warm-cream/70 transition-colors" style={{ border: '1px solid rgba(212,175,55,0.1)' }}>Try Again</button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function PhoneGate({ onVerified }: { onVerified: (phone: string) => void }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) { setError('Please enter a valid 10-digit phone number'); return; }
    // Strip country code prefix — always use last 10 digits to match what was stored at booking time
    const normalized = digits.length > 10 ? digits.slice(-10) : digits;
    onVerified(normalized);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[45vh] px-6">
      <div className="w-full max-w-sm mt-5">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(160,45,35,0.12)', border: '1px solid rgba(160,45,35,0.25)' }}>
            <Lock size={24} style={{ color: '#D4AF37' }} />
          </div>
        </div>
        <p className="font-ui text-[8px] tracking-[0.3em] uppercase text-spiritual-gold/50 mb-1 text-center">Sri Siddheswari Peetham</p>
        <h2 className="font-serif text-warm-cream text-2xl text-center mb-2">View Your Bookings</h2>
        <p className="text-warm-cream/30 font-ui text-[10px] tracking-wider text-center mb-8">
          Enter the phone number used during booking
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-cream/25" />
            <input type="tel"
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm text-warm-cream/80 outline-none transition-all placeholder-warm-cream/20 font-ui"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${error ? 'rgba(239,68,68,0.4)' : 'rgba(212,175,55,0.15)'}`, caretColor: '#D4AF37' }}
              placeholder="+91 98765 43210"
              value={phone}
              onChange={e => { setPhone(e.target.value); setError(''); }}
              maxLength={15} autoFocus />
          </div>
          {error && <p className="text-red-400/70 font-ui text-[9px] tracking-wider text-center">{error}</p>}
          <button type="submit"
            className="w-full py-3.5 rounded-2xl font-ui text-[10px] tracking-widest uppercase font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#A02D23,#7a2018)', border: '1px solid rgba(212,175,55,0.2)', boxShadow: '0 4px 20px rgba(160,45,35,0.3)' }}>
            View My Bookings
          </button>
        </form>
        <p className="text-warm-cream/15 font-ui text-[8px] tracking-widest uppercase text-center mt-6">
          Secured by Supabase · Data never leaves our servers
        </p>
      </div>
    </motion.div>
  );
}

export default function BookingStatusPage({ onBack }: BookingStatusPageProps) {
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [query, setQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const loadBookings = useCallback(async (phone: string) => {
    setLoading(true);
    setFetchError('');
    try {
      // Load bookings with nested deity sevas
      const { data: bookingRows, error: bErr } = await supabase
        .from('seva_bookings')
        .select('*, booking_deity_sevas(*)')
        .eq('devotee_phone', phone)
        .order('created_at', { ascending: false });

      if (bErr) throw bErr;

      // Load devotee profile
      const { data: devoteeRow } = await supabase
        .from('devotees')
        .select('*')
        .eq('phone', phone)
        .maybeSingle();

      setBookings((bookingRows ?? []).map(b => rowsToBookingRecord(b, devoteeRow)));
    } catch (err: any) {
      setFetchError(err?.message ?? 'Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (verifiedPhone) loadBookings(verifiedPhone);
  }, [verifiedPhone, loadBookings]);

  const filtered = bookings.filter(b => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      b.id.toLowerCase().includes(q) ||
      b.devotee.name.toLowerCase().includes(q) ||
      b.devotee.phone.includes(q) ||
      b.devotee.email.toLowerCase().includes(q) ||
      b.deitySevas.some(ds => ds.deity.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0f0603 linear-gradient(175deg,#0f0603 0%,#1c0b05 50%,#2d1209 100%)', paddingTop: '72px' }}>
      {/* Fixed Home Button */}
      <button
        type="button"
        onClick={onBack}
        aria-label="Back to Home"
        className="hidden lg:flex fixed top-9 left-8 z-[100] items-center gap-2 rounded-full bg-neutral-950/80 backdrop-blur-sm border border-white/10 text-warm-cream/70 hover:text-warm-cream hover:border-white/30 hover:bg-[#A02d23] transition-all shadow-lg px-4 py-2"
      >
        <ChevronLeft size={16} />
        <span className="font-ui text-[10px] tracking-[0.2em] uppercase">Home</span>
      </button>

      {/* QR Scanner overlay */}
      {showScanner && <QRScanner onClose={() => setShowScanner(false)} />}

      {/* Header */}
      <div className="sticky top-0 z-10 px-4 pt-20 pb-1"
        style={{ background: 'rgba(15,6,3,0.92)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(212,175,55,0.05)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-2 pt-2">
            <div>
              <p className="font-ui text-[8px] tracking-[0.3em] uppercase text-spiritual-gold/50 mb-0.5">Sri Siddheswari Peetham</p>
              <h1 className="font-serif text-warm-cream text-2xl whitespace-nowrap">My Seva Bookings</h1>
            </div>
            <div className="flex items-center gap-3 md:flex-nowrap md:justify-end whitespace-nowrap">
              {/* Scan QR button */}
              <button onClick={() => setShowScanner(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-warm-cream/40 hover:text-spiritual-gold transition-colors font-ui text-[9px] uppercase tracking-widest"
                style={{ border: '1px solid rgba(212,175,55,0.15)', background: 'rgba(212,175,55,0.05)' }}>
                <ScanLine size={11} /> Scan Receipt
              </button>
              {verifiedPhone && (
                <button onClick={() => { setVerifiedPhone(null); setBookings([]); setQuery(''); }}
                  className="flex items-center gap-1.5 text-warm-cream/25 hover:text-warm-cream/60 transition-colors font-ui text-[9px] uppercase tracking-widest">
                  <Phone size={10} /> Change
                </button>
              )}
              {verifiedPhone && bookings.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full font-ui text-[9px] uppercase tracking-widest font-bold"
                  style={{ background: 'rgba(160,45,35,0.2)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}>
                  {bookings.length} {bookings.length === 1 ? 'Booking' : 'Bookings'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {!verifiedPhone ? (
        <PhoneGate onVerified={setVerifiedPhone} />
      ) : loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <Loader2 size={28} className="text-spiritual-gold/50 animate-spin" />
          <p className="text-warm-cream/30 font-ui text-[9px] uppercase tracking-widest">Loading your bookings…</p>
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-6">
          <AlertCircle size={28} className="text-red-400/60" />
          <p className="text-red-400/60 font-ui text-[10px] tracking-wider text-center">{fetchError}</p>
          <button onClick={() => loadBookings(verifiedPhone)}
            className="px-5 py-2 rounded-xl font-ui text-[9px] uppercase tracking-widest font-bold text-white"
            style={{ background: 'rgba(160,45,35,0.5)' }}>
            Retry
          </button>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto px-4 py-5">
          {/* Verified phone badge */}
          <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <Phone size={11} className="text-emerald-400/60 flex-shrink-0" />
            <p className="text-emerald-400/60 font-ui text-[9px] uppercase tracking-widest">
              Showing bookings for +{verifiedPhone}
            </p>
          </div>

          {/* Search */}
          {bookings.length > 0 && (
            <div className="relative mb-6">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-cream/25" />
              <input
                className="w-full pl-10 pr-10 py-3 rounded-2xl text-sm text-warm-cream/80 outline-none transition-all placeholder-warm-cream/20 font-ui"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.15)', caretColor: '#D4AF37' }}
                placeholder="Search by ID, name, email, or deity…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && (
                <button onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-cream/25 hover:text-warm-cream/60 transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {/* Results */}
          {bookings.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">🙏</div>
              <h3 className="font-serif text-warm-cream text-xl mb-2">No Bookings Found</h3>
              <p className="text-warm-cream/30 font-ui text-[10px] tracking-widest uppercase mb-1">
                No seva bookings linked to this number
              </p>
              <p className="text-warm-cream/20 font-ui text-[9px] tracking-wider mb-6">
                Make sure you used the same number during booking
              </p>
              <button onClick={onBack}
                className="px-6 py-2.5 rounded-xl font-ui text-[10px] tracking-widest uppercase font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#A02D23,#7a2018)', border: '1px solid rgba(212,175,55,0.2)' }}>
                Book a Seva
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-warm-cream/30 font-ui text-[10px] tracking-widest uppercase">No results for "{query}"</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(b => <BookingCard key={b.id} booking={b} />)}
            </div>
          )}
        </div>
      )}

      <div className="bg-neutral-900 overflow-hidden py-14 mt-22">
        <ScrollVelocity
          texts={['Sri Siddheswari Peetham • Courtallam • Om Namah Shivaya • Seva Bookings • Sanatana Dharma • Mouna Swamy Mutt • ']}
          velocity={30}
          className="font-serif text-3xl italic text-warm-cream/20 mx-24 tracking-widest"
          numCopies={4}
        />
      </div>
    </div>
  );
}
