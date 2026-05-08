import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import {
  Loader2, RefreshCw, Edit2, Save, Ban, ToggleRight, ToggleLeft,
  Plus, Search, ChevronDown, X, AlertCircle, ChevronUp,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────

interface Slot {
  id: string;
  time: string;
  name: string;
  price: number;
  sort_order: number;
  max_bookings: number;
  is_active: boolean;
  available_days: number[];
}

interface Seva {
  name: string;
  price: number;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

// ── Seva searchable dropdown ──────────────────────────────────────────────────

function SevaDropdown({
  sevas,
  value,
  onChange,
  placeholder = 'Search & select seva…',
}: {
  sevas: Seva[];
  value: string;
  onChange: (s: Seva | null) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query
    ? sevas.filter(s => s.name.toLowerCase().includes(query.toLowerCase()))
    : sevas;

  const displayValue = open ? query : value;

  return (
    <div ref={containerRef} className="relative">
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ background: 'var(--at-surface-5)', border: '1px solid var(--at-border-mid)' }}
      >
        <Search size={11} className="text-warm-cream/30 flex-shrink-0" />
        <input
          value={displayValue}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { setOpen(true); setQuery(''); }}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent focus:outline-none text-xs font-sans text-warm-cream/80 placeholder:text-warm-cream/30"
        />
        {value && !open && (
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); onChange(null); }}
            className="text-warm-cream/30 hover:text-warm-cream/60 flex-shrink-0"
          >
            <X size={11} />
          </button>
        )}
        <ChevronDown
          size={11}
          className="text-warm-cream/30 flex-shrink-0 transition-transform duration-150"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </div>

      {open && (
        <div
          className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg overflow-hidden shadow-2xl max-h-52 overflow-y-auto"
          style={{ background: 'var(--at-sidebar-bg)', border: '1px solid var(--at-border-mid)' }}
        >
          {sevas.length === 0 ? (
            <p className="px-3 py-3 text-xs text-warm-cream/40 font-ui tracking-wider">
              No sevas found — add sevas in the Sevas tab first
            </p>
          ) : filtered.length === 0 ? (
            <p className="px-3 py-2.5 text-xs text-warm-cream/40 font-ui tracking-wider">No match</p>
          ) : filtered.map(s => (
            <button
              key={s.name}
              onMouseDown={e => { e.preventDefault(); onChange(s); setOpen(false); setQuery(''); }}
              className="w-full px-3 py-2.5 flex items-center justify-between text-left transition-colors hover:bg-white/5"
              style={{ background: s.name === value ? 'rgba(160,45,35,0.15)' : 'transparent' }}
            >
              <span className="text-xs font-sans text-warm-cream/85 truncate mr-3">{s.name}</span>
              <span className="text-xs font-sans text-spiritual-gold flex-shrink-0">₹{s.price.toLocaleString('en-IN')}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────

export default function PaginatedSlots() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [sevas, setSevas] = useState<Seva[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBuf, setEditBuf] = useState<Partial<Slot>>({});
  const [saving, setSaving] = useState(false);
  const [newSlot, setNewSlot] = useState({
    time: '', name: '', price: '', max_bookings: '50', is_active: true, available_days: [0,1,2,3,4,5,6],
  });
  const [adding, setAdding] = useState(false);
  const [showUnmapped, setShowUnmapped] = useState(true);
  const addFormRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'list' | 'week'>('list');
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().split('T')[0];
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: slotsData }, { data: sevasData }] = await Promise.all([
      supabase.from('ref_slots').select('*').order('sort_order'),
      supabase.from('ref_sevas').select('*').order('name'),
    ]);
    setSlots((slotsData as Slot[]) ?? []);
    setSevas((sevasData as Seva[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (s: Slot) => { setEditingId(s.id); setEditBuf(s); };
  const cancelEdit = () => { setEditingId(null); setEditBuf({}); };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    const { error } = await supabase.from('ref_slots').update({
      time: editBuf.time,
      name: editBuf.name,
      price: editBuf.price,
      max_bookings: editBuf.max_bookings,
      is_active: editBuf.is_active,
      available_days: editBuf.available_days,
    }).eq('id', editingId);
    if (!error) {
      setSlots(prev => prev.map(s => s.id === editingId ? { ...s, ...editBuf } as Slot : s));
      setEditingId(null);
      setEditBuf({});
    }
    setSaving(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('ref_slots').update({ is_active: !current }).eq('id', id);
    setSlots(prev => prev.map(s => s.id === id ? { ...s, is_active: !current } : s));
  };

  const toggleDay = async (id: string, day: number) => {
    const slot = slots.find(s => s.id === id);
    if (!slot) return;
    const days = slot.available_days.includes(day)
      ? slot.available_days.filter(d => d !== day)
      : [...slot.available_days, day].sort();
    await supabase.from('ref_slots').update({ available_days: days }).eq('id', id);
    setSlots(prev => prev.map(s => s.id === id ? { ...s, available_days: days } : s));
  };

  const toggleDayInEdit = (day: number) => {
    const days = editBuf.available_days || [];
    const newDays = days.includes(day) ? days.filter(d => d !== day) : [...days, day].sort();
    setEditBuf(p => ({ ...p, available_days: newDays }));
  };

  const addSlot = async () => {
    if (!newSlot.time || !newSlot.name || !newSlot.price) return;
    setAdding(true);
    const maxOrder = slots.reduce((m, s) => Math.max(m, s.sort_order), 0);
    const id = `slot-${Date.now()}`;
    const { error } = await supabase.from('ref_slots').insert({
      id,
      time: newSlot.time,
      name: newSlot.name,
      price: +newSlot.price,
      max_bookings: +newSlot.max_bookings,
      is_active: newSlot.is_active,
      available_days: newSlot.available_days,
      sort_order: maxOrder + 1,
    });
    if (!error) {
      setNewSlot({ time: '', name: '', price: '', max_bookings: '50', is_active: true, available_days: [0,1,2,3,4,5,6] });
      load();
    }
    setAdding(false);
  };

  const getWeekDates = (startDate: string) => {
    const start = new Date(startDate);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates(selectedWeek);

  const fieldCls = "bg-transparent border-b text-warm-cream/80 font-sans text-sm focus:outline-none focus:border-sacred-red/60 w-full py-0.5 transition-colors";
  const fieldStyle = { borderColor: 'var(--at-border-input)' };

  const totalPages = Math.ceil(slots.length / pageSize);
  const paginatedSlots = slots.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, [viewMode]);

  const linkedSevaNames = new Set(sevas.map(s => s.name));

  // Sevas that have no slot mapped to them yet
  const unmappedSevas = useMemo(
    () => sevas.filter(sv => !slots.some(sl => sl.name === sv.name)),
    [sevas, slots]
  );

  const prefillFromSeva = (sv: Seva) => {
    setNewSlot(p => ({ ...p, name: sv.name, price: String(sv.price) }));
    addFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-warm-cream">Slot Management</h2>
          <p className="font-ui text-xs tracking-widest uppercase text-warm-cream/30 mt-0.5">
            {slots.length} total · Page {page}/{totalPages || 1}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={pageSize}
            onChange={e => { setPageSize(+e.target.value); setPage(1); }}
            className="px-2 py-1.5 rounded-lg font-ui text-[10px] text-warm-cream/60 focus:outline-none"
            style={{ background: 'var(--at-surface-5)', border: '1px solid var(--at-border-mid)' }}
          >
            {[5, 10, 20, 50].map(n => (
              <option key={n} value={n}>{n} per page</option>
            ))}
          </select>
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--at-border-dim)' }}>
            {(['list', 'week'] as const).map(m => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className="px-3 py-1.5 font-ui text-[10px] tracking-widest uppercase transition-colors"
                style={{
                  background: viewMode === m ? '#A02D23' : 'transparent',
                  color: viewMode === m ? '#fff' : 'var(--at-text-muted)',
                }}
              >
                {m === 'list' ? 'List' : 'Week'}
              </button>
            ))}
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-ui text-xs tracking-widest uppercase text-warm-cream/60 hover:text-warm-cream border transition-colors"
            style={{ borderColor: 'var(--at-border-dim)' }}
          >
            <RefreshCw size={13} /> <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Week view */}
      {viewMode === 'week' && (
        <div className="rounded-xl p-4 sm:p-5 border" style={{ background: 'var(--at-card-alt)', borderColor: 'var(--at-border-mid)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <p className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/40">Week Schedule</p>
            <input
              type="date"
              value={selectedWeek}
              onChange={e => setSelectedWeek(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-sans text-warm-cream/80 focus:outline-none w-full sm:w-auto"
              style={{ background: 'var(--at-surface-5)', border: '1px solid var(--at-border-mid)' }}
            />
          </div>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 min-w-[400px]">
              {DAY_LABELS.map((d, i) => (
                <div key={d} className="text-center">
                  <p className="font-ui text-[9px] tracking-widest uppercase text-warm-cream/30 mb-1">{d}</p>
                  <p className="font-sans text-xs text-warm-cream/60">{weekDates[i].getDate()}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {slots.filter(s => s.is_active).map(s => (
              <div key={s.id} className="rounded-lg p-3" style={{ background: 'var(--at-surface-2)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-ui text-xs text-warm-cream/80">{s.time} — {s.name}</span>
                  <span className="font-sans text-[10px] text-spiritual-gold">₹{s.price}</span>
                </div>
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-7 gap-1 min-w-[400px]">
                    {DAY_LABELS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => toggleDay(s.id, i)}
                        className="rounded py-1.5 text-center font-ui text-[9px] tracking-wider transition-all"
                        style={{
                          background: s.available_days.includes(i) ? DAY_COLORS[i] + '33' : 'rgba(255,255,255,0.03)',
                          color: s.available_days.includes(i) ? DAY_COLORS[i] : 'var(--at-text-dim)',
                          border: `1px solid ${s.available_days.includes(i) ? DAY_COLORS[i] + '66' : 'var(--at-border-faint)'}`,
                        }}
                      >
                        {s.available_days.includes(i) ? 'ON' : 'OFF'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-sacred-red" /></div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block rounded-xl overflow-hidden border" style={{ borderColor: 'var(--at-border-mid)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[760px]">
                <thead>
                  <tr style={{ background: 'var(--at-table-head)' }}>
                    {['Time', 'Seva / Slot Name', 'Price (₹)', 'Max', 'Days', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-ui text-[10px] tracking-widest uppercase text-warm-cream/40">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedSlots.map((s, i) => (
                    <tr key={s.id} style={{ background: i % 2 === 0 ? 'var(--at-surface-2)' : 'transparent' }} className="border-t">
                      {/* Time */}
                      <td className="px-4 py-3">
                        {editingId === s.id ? (
                          <input className={fieldCls} style={fieldStyle} value={editBuf.time ?? ''} onChange={e => setEditBuf(p => ({ ...p, time: e.target.value }))} />
                        ) : (
                          <span className="font-ui text-xs text-warm-cream/80">{s.time}</span>
                        )}
                      </td>
                      {/* Seva / Slot Name */}
                      <td className="px-4 py-3 min-w-[200px]">
                        {editingId === s.id ? (
                          <SevaDropdown
                            sevas={sevas}
                            value={editBuf.name ?? ''}
                            onChange={sv => setEditBuf(p => ({ ...p, name: sv?.name ?? '', price: sv !== null ? sv.price : p.price }))}
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-sans text-xs text-warm-cream/80">{s.name}</span>
                            {linkedSevaNames.has(s.name) && (
                              <span
                                className="px-1.5 py-0.5 rounded font-ui text-[8px] tracking-wider uppercase"
                                style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37' }}
                              >
                                seva
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      {/* Price */}
                      <td className="px-4 py-3">
                        {editingId === s.id ? (
                          <input
                            type="number"
                            className={fieldCls}
                            style={fieldStyle}
                            value={editBuf.price ?? ''}
                            onChange={e => setEditBuf(p => ({ ...p, price: +e.target.value }))}
                          />
                        ) : (
                          <span className="font-sans text-xs text-spiritual-gold">₹{s.price.toLocaleString('en-IN')}</span>
                        )}
                      </td>
                      {/* Max */}
                      <td className="px-4 py-3">
                        {editingId === s.id ? (
                          <input
                            type="number"
                            min={1}
                            className={fieldCls}
                            style={fieldStyle}
                            value={editBuf.max_bookings ?? ''}
                            onChange={e => setEditBuf(p => ({ ...p, max_bookings: +e.target.value }))}
                          />
                        ) : (
                          <span className="font-sans text-xs text-warm-cream/70">{s.max_bookings}</span>
                        )}
                      </td>
                      {/* Days */}
                      <td className="px-4 py-3">
                        <div className="flex gap-0.5 flex-wrap">
                          {DAY_LABELS.map((d, di) => (
                            editingId === s.id ? (
                              <button
                                key={d}
                                onClick={() => toggleDayInEdit(di)}
                                className="w-6 h-6 sm:w-7 sm:h-7 rounded text-[9px] font-ui transition-all"
                                style={{
                                  background: (editBuf.available_days || []).includes(di) ? DAY_COLORS[di] + '44' : 'rgba(255,255,255,0.03)',
                                  color: (editBuf.available_days || []).includes(di) ? DAY_COLORS[di] : 'var(--at-text-dim)',
                                }}
                              >
                                {d[0]}
                              </button>
                            ) : (
                              <span
                                key={d}
                                className="w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center text-[9px] font-ui"
                                style={{
                                  background: s.available_days.includes(di) ? DAY_COLORS[di] + '22' : 'transparent',
                                  color: s.available_days.includes(di) ? DAY_COLORS[di] : 'var(--at-text-dim)',
                                }}
                              >
                                {d[0]}
                              </span>
                            )
                          ))}
                        </div>
                      </td>
                      {/* Status toggle */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => editingId === s.id
                            ? setEditBuf(p => ({ ...p, is_active: !p.is_active }))
                            : toggleActive(s.id, s.is_active)
                          }
                          className="flex items-center gap-1.5 text-xs font-ui"
                        >
                          {(editingId === s.id ? editBuf.is_active : s.is_active)
                            ? <><ToggleRight size={18} className="text-emerald-400" /><span className="text-emerald-400">On</span></>
                            : <><ToggleLeft size={18} className="text-warm-cream/30" /><span className="text-warm-cream/30">Off</span></>
                          }
                        </button>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {editingId === s.id ? (
                            <>
                              <button
                                onClick={saveEdit}
                                disabled={saving}
                                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-sacred-red text-warm-cream font-ui text-[10px] tracking-widest uppercase hover:bg-sacred-red/80 disabled:opacity-50 transition-colors"
                              >
                                {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
                                <span className="hidden sm:inline">Save</span>
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="flex items-center gap-1 px-3 py-1 rounded-lg font-ui text-[10px] tracking-widest uppercase text-warm-cream/40 hover:text-warm-cream/70 border transition-colors"
                                style={{ borderColor: 'var(--at-border-dim)' }}
                              >
                                <Ban size={11} /> <span className="hidden sm:inline">Cancel</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => startEdit(s)}
                              className="flex items-center gap-1 px-3 py-1 rounded-lg font-ui text-[10px] tracking-widest uppercase text-warm-cream/40 hover:text-warm-cream/70 border transition-colors"
                              style={{ borderColor: 'var(--at-border-dim)' }}
                            >
                              <Edit2 size={11} /> <span className="hidden sm:inline">Edit</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile card view */}
          <div className="sm:hidden space-y-3">
            {paginatedSlots.map(s => (
              <div key={s.id} className="rounded-xl p-4 border" style={{ background: 'var(--at-card-bg)', borderColor: 'var(--at-border-mid)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-3">
                    {editingId === s.id ? (
                      <SevaDropdown
                        sevas={sevas}
                        value={editBuf.name ?? ''}
                        onChange={sv => setEditBuf(p => ({ ...p, name: sv?.name ?? '', price: sv !== null ? sv.price : p.price }))}
                      />
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-sans text-sm text-warm-cream/80 truncate">{s.name}</p>
                        {linkedSevaNames.has(s.name) && (
                          <span
                            className="px-1.5 py-0.5 rounded font-ui text-[8px] tracking-wider uppercase"
                            style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37' }}
                          >
                            seva
                          </span>
                        )}
                      </div>
                    )}
                    {editingId === s.id ? (
                      <input className={fieldCls + ' mt-1'} style={fieldStyle} value={editBuf.time ?? ''} onChange={e => setEditBuf(p => ({ ...p, time: e.target.value }))} />
                    ) : (
                      <p className="font-ui text-xs text-warm-cream/50 mt-0.5">{s.time}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    {editingId === s.id ? (
                      <input
                        type="number"
                        className={fieldCls + ' text-right w-20'}
                        style={fieldStyle}
                        value={editBuf.price ?? ''}
                        onChange={e => setEditBuf(p => ({ ...p, price: +e.target.value }))}
                      />
                    ) : (
                      <p className="font-sans text-sm text-spiritual-gold">₹{s.price.toLocaleString('en-IN')}</p>
                    )}
                    <p className="font-sans text-[11px] text-warm-cream/50">Max: {s.max_bookings}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="font-ui text-[9px] tracking-widest uppercase text-warm-cream/30 mb-1">Available Days</p>
                  <div className="flex gap-1 flex-wrap">
                    {DAY_LABELS.map((d, di) => (
                      editingId === s.id ? (
                        <button
                          key={d}
                          onClick={() => toggleDayInEdit(di)}
                          className="w-7 h-7 rounded text-[9px] font-ui transition-all"
                          style={{
                            background: (editBuf.available_days || []).includes(di) ? DAY_COLORS[di] + '44' : 'rgba(255,255,255,0.03)',
                            color: (editBuf.available_days || []).includes(di) ? DAY_COLORS[di] : 'var(--at-text-dim)',
                          }}
                        >
                          {d[0]}
                        </button>
                      ) : (
                        <span
                          key={d}
                          className="w-7 h-7 rounded flex items-center justify-center text-[9px] font-ui"
                          style={{
                            background: s.available_days.includes(di) ? DAY_COLORS[di] + '22' : 'transparent',
                            color: s.available_days.includes(di) ? DAY_COLORS[di] : 'var(--at-text-dim)',
                          }}
                        >
                          {d[0]}
                        </span>
                      )
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--at-border-dim)' }}>
                  <button
                    onClick={() => editingId === s.id
                      ? setEditBuf(p => ({ ...p, is_active: !p.is_active }))
                      : toggleActive(s.id, s.is_active)
                    }
                    className="flex items-center gap-1 text-xs font-ui"
                  >
                    {(editingId === s.id ? editBuf.is_active : s.is_active)
                      ? <><ToggleRight size={16} className="text-emerald-400" /><span className="text-emerald-400">Active</span></>
                      : <><ToggleLeft size={16} className="text-warm-cream/30" /><span className="text-warm-cream/30">Inactive</span></>
                    }
                  </button>
                  <div className="flex items-center gap-2">
                    {editingId === s.id ? (
                      <>
                        <button
                          onClick={saveEdit}
                          disabled={saving}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-sacred-red text-warm-cream font-ui text-[10px] tracking-widest uppercase hover:bg-sacred-red/80 disabled:opacity-50 transition-colors"
                        >
                          {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />} Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg font-ui text-[10px] tracking-widest uppercase text-warm-cream/40 hover:text-warm-cream/70 border transition-colors"
                          style={{ borderColor: 'var(--at-border-dim)' }}
                        >
                          <Ban size={11} /> Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(s)}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg font-ui text-[10px] tracking-widest uppercase text-warm-cream/40 hover:text-warm-cream/70 border transition-colors"
                        style={{ borderColor: 'var(--at-border-dim)' }}
                      >
                        <Edit2 size={11} /> Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-4 flex-wrap">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg font-ui text-[10px] tracking-widest uppercase text-warm-cream/40 hover:text-warm-cream/70 border transition-colors disabled:opacity-30"
                style={{ borderColor: 'var(--at-border-dim)' }}
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let p: number;
                const totalP = totalPages;
                if (totalP <= 5) p = i + 1;
                else if (page <= 3) p = i + 1;
                else if (page >= totalP - 2) p = totalP - 4 + i;
                else p = page - 2 + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
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
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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

      {/* ── Unmapped sevas ─────────────────────────────────────── */}
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
            <div className="flex items-center gap-2">
              {unmappedSevas.length > 0 ? (
                <AlertCircle size={14} className="text-sacred-red/70 flex-shrink-0" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/60 flex-shrink-0" />
              )}
              <span className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/70">
                Unmapped Sevas
              </span>
              <span
                className="font-ui text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: unmappedSevas.length > 0 ? 'rgba(160,45,35,0.25)' : 'rgba(5,150,105,0.2)',
                  color: unmappedSevas.length > 0 ? '#fca5a5' : '#4ade80',
                }}
              >
                {unmappedSevas.length}
              </span>
              {unmappedSevas.length === 0 && (
                <span className="font-sans text-[10px] text-emerald-400/70">All sevas have slots assigned</span>
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
                These sevas exist in the Sevas list but don't have a slot assigned yet. Click "Create Slot →" to add one.
              </p>
              <div className="flex flex-wrap gap-2">
                {unmappedSevas.map(sv => (
                  <div
                    key={sv.name}
                    className="flex items-center gap-2 pl-3 pr-2 py-2 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(160,45,35,0.2)' }}
                  >
                    <div className="min-w-0">
                      <p className="font-sans text-xs text-warm-cream/80 leading-none">{sv.name}</p>
                      <p className="font-sans text-[10px] text-spiritual-gold/70 mt-0.5">₹{sv.price.toLocaleString('en-IN')}</p>
                    </div>
                    <button
                      onClick={() => prefillFromSeva(sv)}
                      className="flex items-center gap-1 px-2 py-1 rounded font-ui text-[9px] tracking-widest uppercase text-sacred-red hover:bg-sacred-red/10 border border-sacred-red/20 hover:border-sacred-red/40 transition-colors flex-shrink-0"
                    >
                      <Plus size={9} /> Create Slot
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add new slot */}
      <div ref={addFormRef} className="rounded-xl p-4 sm:p-5 border" style={{ background: 'var(--at-card-alt)', borderColor: 'var(--at-border-mid)' }}>
        <p className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/40 mb-4">Add New Slot</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          {/* Time */}
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[9px] tracking-widest uppercase text-warm-cream/35">Time *</label>
            <input
              value={newSlot.time}
              onChange={e => setNewSlot(p => ({ ...p, time: e.target.value }))}
              placeholder="e.g. 06:00 AM"
              className="px-3 py-2 rounded-lg text-xs font-sans text-warm-cream/80 focus:outline-none"
              style={{ background: 'var(--at-surface-5)', border: '1px solid var(--at-border-mid)' }}
            />
          </div>
          {/* Seva dropdown */}
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[9px] tracking-widest uppercase text-warm-cream/35">
              Select Seva * {sevas.length === 0 && <span className="text-red-400/70">(add sevas first)</span>}
            </label>
            <SevaDropdown
              sevas={sevas}
              value={newSlot.name}
              onChange={sv => setNewSlot(p => ({
                ...p,
                name: sv?.name ?? '',
                price: sv !== null ? String(sv.price) : p.price,
              }))}
            />
          </div>
          {/* Price — auto-filled */}
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[9px] tracking-widest uppercase text-warm-cream/35">
              Price (₹) *
              {newSlot.name && sevas.find(sv => sv.name === newSlot.name) && (
                <span className="ml-1 text-spiritual-gold/60">auto-filled</span>
              )}
            </label>
            <input
              type="number"
              value={newSlot.price}
              onChange={e => setNewSlot(p => ({ ...p, price: e.target.value }))}
              placeholder="Auto-filled from seva"
              className="px-3 py-2 rounded-lg text-xs font-sans focus:outline-none"
              style={{
                background: 'var(--at-surface-5)',
                border: '1px solid var(--at-border-mid)',
                color: newSlot.price ? '#D4AF37' : 'rgba(253,251,247,0.45)',
              }}
            />
          </div>
          {/* Max bookings */}
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[9px] tracking-widest uppercase text-warm-cream/35">Max Bookings</label>
            <input
              type="number"
              min={1}
              value={newSlot.max_bookings}
              onChange={e => setNewSlot(p => ({ ...p, max_bookings: e.target.value }))}
              placeholder="50"
              className="px-3 py-2 rounded-lg text-xs font-sans text-warm-cream/80 focus:outline-none"
              style={{ background: 'var(--at-surface-5)', border: '1px solid var(--at-border-mid)' }}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-3 items-start sm:items-end">
          {/* Active toggle */}
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[9px] tracking-widest uppercase text-warm-cream/35">Active</label>
            <button
              onClick={() => setNewSlot(p => ({ ...p, is_active: !p.is_active }))}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-ui"
              style={{ background: 'var(--at-surface-5)', border: '1px solid var(--at-border-mid)' }}
            >
              {newSlot.is_active
                ? <><ToggleRight size={16} className="text-emerald-400" /><span className="text-emerald-400">Yes</span></>
                : <><ToggleLeft size={16} className="text-warm-cream/30" /><span className="text-warm-cream/30">No</span></>
              }
            </button>
          </div>
          {/* Days */}
          <div className="flex flex-col gap-1 flex-1">
            <label className="font-ui text-[9px] tracking-widest uppercase text-warm-cream/35">Days</label>
            <div className="flex gap-0.5 flex-wrap">
              {DAY_LABELS.map((d, i) => (
                <button
                  key={d}
                  onClick={() => {
                    const days = newSlot.available_days.includes(i)
                      ? newSlot.available_days.filter(x => x !== i)
                      : [...newSlot.available_days, i].sort();
                    setNewSlot(p => ({ ...p, available_days: days }));
                  }}
                  className="w-7 h-7 rounded text-[9px] font-ui transition-all"
                  style={{
                    background: newSlot.available_days.includes(i) ? DAY_COLORS[i] + '44' : 'rgba(255,255,255,0.03)',
                    color: newSlot.available_days.includes(i) ? DAY_COLORS[i] : 'var(--at-text-dim)',
                    border: `1px solid ${newSlot.available_days.includes(i) ? DAY_COLORS[i] + '66' : 'var(--at-border-faint)'}`,
                  }}
                >
                  {d[0]}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={addSlot}
            disabled={adding || !newSlot.time || !newSlot.name || !newSlot.price}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-sacred-red text-warm-cream rounded-lg font-ui text-xs tracking-widest uppercase hover:bg-sacred-red/80 disabled:opacity-50 transition-colors w-full sm:w-auto"
          >
            {adding ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Add Slot
          </button>
        </div>
      </div>

      <div className="rounded-xl p-4 border" style={{ background: 'var(--at-gold-hint)', borderColor: 'var(--at-gold-border)' }}>
        <p className="font-ui text-[10px] tracking-widest uppercase text-spiritual-gold mb-1">How slot scheduling works</p>
        <p className="font-sans text-xs text-warm-cream/50 leading-relaxed">
          Select a seva from the dropdown to name the slot — the price is auto-filled from the seva rate (editable). Max Bookings sets the cap per slot per day. Toggle days in Week View to bulk-manage availability.
        </p>
      </div>
    </div>
  );
}
