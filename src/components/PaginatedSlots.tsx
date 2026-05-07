import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, RefreshCw, Edit2, Save, Ban, ToggleRight, ToggleLeft, Plus, Trash2, ChevronRight } from 'lucide-react';

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

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

// ── Main Component ────────────────────────────────────────

export default function PaginatedSlots() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBuf, setEditBuf] = useState<Partial<Slot>>({});
  const [saving, setSaving] = useState(false);
  const [newSlot, setNewSlot] = useState({ time: '', name: '', price: '', max_bookings: '50', is_active: true, available_days: [0,1,2,3,4,5,6] });
  const [adding, setAdding] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'week'>('list');
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return d.toISOString().split('T')[0];
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('ref_slots').select('*').order('sort_order');
    setSlots((data as Slot[]) ?? []);
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
    const dates = [];
    const start = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const weekDates = getWeekDates(selectedWeek);

  const fieldCls = "bg-transparent border-b text-warm-cream/80 font-sans text-sm focus:outline-none focus:border-sacred-red/60 w-full py-0.5 transition-colors";
  const fieldStyle = { borderColor: 'var(--at-border-input)' };

  // Pagination
  const totalPages = Math.ceil(slots.length / pageSize);
  const paginatedSlots = slots.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, [viewMode]);

  return (
    <div className="space-y-6">
      {/* Header - responsive */}
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
            className="px-2 py-1.5 rounded-lg font-ui text-[10px] text-warm-cream/60 focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg font-ui text-xs tracking-widest uppercase text-warm-cream/60 hover:text-warm-cream border transition-colors" style={{ borderColor: 'var(--at-border-dim)' }}>
            <RefreshCw size={13} /> <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {viewMode === 'week' && (
        <div className="rounded-xl p-4 sm:p-5 border" style={{ background: 'var(--at-card-alt)', borderColor: 'var(--at-border-mid)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <p className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/40">Week Schedule</p>
            <input
              type="date"
              value={selectedWeek}
              onChange={e => setSelectedWeek(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-sans text-warm-cream/80 focus:outline-none dark:bg-gray-800 dark:text-white w-full sm:w-auto"
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
          <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-1">
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
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr style={{ background: 'var(--at-table-head)' }}>
                    {['Time', 'Slot Name', 'Price (₹)', 'Max', 'Days', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-ui text-[10px] tracking-widest uppercase text-warm-cream/40">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedSlots.map((s, i) => (
                    <tr key={s.id} style={{ background: i % 2 === 0 ? 'var(--at-surface-2)' : 'transparent' }} className="border-t">
                      <td className="px-4 py-3">
                        {editingId === s.id ? (
                          <input className={fieldCls} style={fieldStyle} value={editBuf.time ?? ''} onChange={e => setEditBuf(p => ({ ...p, time: e.target.value }))} />
                        ) : (
                          <span className="font-ui text-xs text-warm-cream/80">{s.time}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === s.id ? (
                          <input className={fieldCls} style={fieldStyle} value={editBuf.name ?? ''} onChange={e => setEditBuf(p => ({ ...p, name: e.target.value }))} />
                        ) : (
                          <span className="font-sans text-xs text-warm-cream/70">{s.name}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === s.id ? (
                          <input type="number" className={fieldCls} style={fieldStyle} value={editBuf.price ?? ''} onChange={e => setEditBuf(p => ({ ...p, price: +e.target.value }))} />
                        ) : (
                          <span className="font-sans text-xs text-spiritual-gold">₹{s.price.toLocaleString('en-IN')}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === s.id ? (
                          <input type="number" min={1} className={fieldCls} style={fieldStyle} value={editBuf.max_bookings ?? ''} onChange={e => setEditBuf(p => ({ ...p, max_bookings: +e.target.value }))} />
                        ) : (
                          <span className="font-sans text-xs text-warm-cream/70">{s.max_bookings}</span>
                        )}
                      </td>
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
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {editingId === s.id ? (
                            <>
                              <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-sacred-red text-warm-cream font-ui text-[10px] tracking-widest uppercase hover:bg-sacred-red/80 disabled:opacity-50 transition-colors">
                                {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />} <span className="hidden sm:inline">Save</span>
                              </button>
                              <button onClick={cancelEdit} className="flex items-center gap-1 px-3 py-1 rounded-lg font-ui text-[10px] tracking-widest uppercase text-warm-cream/40 hover:text-warm-cream/70 border transition-colors" style={{ borderColor: 'var(--at-border-dim)' }}>
                                <Ban size={11} /> <span className="hidden sm:inline">Cancel</span>
                              </button>
                            </>
                          ) : (
                            <button onClick={() => startEdit(s)} className="flex items-center gap-1 px-3 py-1 rounded-lg font-ui text-[10px] tracking-widest uppercase text-warm-cream/40 hover:text-warm-cream/70 border transition-colors" style={{ borderColor: 'var(--at-border-dim)' }}>
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
                <div className="flex items-start justify-between mb-2">
                  <div>
                    {editingId === s.id ? (
                      <input className={fieldCls + ' text-sm'} style={fieldStyle} value={editBuf.name ?? ''} onChange={e => setEditBuf(p => ({ ...p, name: e.target.value }))} />
                    ) : (
                      <p className="font-sans text-sm text-warm-cream/80">{s.name}</p>
                    )}
                    {editingId === s.id ? (
                      <input className={fieldCls} style={fieldStyle} value={editBuf.time ?? ''} onChange={e => setEditBuf(p => ({ ...p, time: e.target.value }))} />
                    ) : (
                      <p className="font-ui text-xs text-warm-cream/50">{s.time}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {editingId === s.id ? (
                      <input type="number" className={fieldCls + ' text-right'} style={fieldStyle} value={editBuf.price ?? ''} onChange={e => setEditBuf(p => ({ ...p, price: +e.target.value }))} />
                    ) : (
                      <p className="font-sans text-sm text-spiritual-gold">₹{s.price.toLocaleString('en-IN')}</p>
                    )}
                    <p className="font-sans text-[11px] text-warm-cream/50">Max: {s.max_bookings}</p>
                  </div>
                </div>

                {/* Days */}
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

                {/* Actions */}
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
                        <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-sacred-red text-warm-cream font-ui text-[10px] tracking-widest uppercase hover:bg-sacred-red/80 disabled:opacity-50 transition-colors">
                          {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />} Save
                        </button>
                        <button onClick={cancelEdit} className="flex items-center gap-1 px-3 py-1 rounded-lg font-ui text-[10px] tracking-widest uppercase text-warm-cream/40 hover:text-warm-cream/70 border transition-colors" style={{ borderColor: 'var(--at-border-dim)' }}>
                          <Ban size={11} /> Cancel
                        </button>
                      </>
                    ) : (
                      <button onClick={() => startEdit(s)} className="flex items-center gap-1 px-3 py-1 rounded-lg font-ui text-[10px] tracking-widest uppercase text-warm-cream/40 hover:text-warm-cream/70 border transition-colors" style={{ borderColor: 'var(--at-border-dim)' }}>
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

      {/* Add new slot - responsive */}
      <div className="rounded-xl p-4 sm:p-5 border" style={{ background: 'var(--at-card-alt)', borderColor: 'var(--at-border-mid)' }}>
        <p className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/40 mb-4">Add New Slot</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[9px] tracking-widest uppercase text-warm-cream/35">Time *</label>
            <input
              value={newSlot.time}
              onChange={e => setNewSlot(p => ({ ...p, time: e.target.value }))}
              placeholder="e.g. 06:00 AM"
              className="px-3 py-2 rounded-lg text-xs font-sans text-warm-cream/80 focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-600"
              style={{ background: 'var(--at-surface-5)', border: '1px solid var(--at-border-mid)' }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[9px] tracking-widest uppercase text-warm-cream/35">Slot Name *</label>
            <input
              value={newSlot.name}
              onChange={e => setNewSlot(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Morning Darshan"
              className="px-3 py-2 rounded-lg text-xs font-sans text-warm-cream/80 focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-600"
              style={{ background: 'var(--at-surface-5)', border: '1px solid var(--at-border-mid)' }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[9px] tracking-widest uppercase text-warm-cream/35">Price (₹) *</label>
            <input
              type="number"
              value={newSlot.price}
              onChange={e => setNewSlot(p => ({ ...p, price: e.target.value }))}
              placeholder="0"
              className="px-3 py-2 rounded-lg text-xs font-sans text-warm-cream/80 focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-600"
              style={{ background: 'var(--at-surface-5)', border: '1px solid var(--at-border-mid)' }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[9px] tracking-widest uppercase text-warm-cream/35">Max Bookings</label>
            <input
              type="number"
              min={1}
              value={newSlot.max_bookings}
              onChange={e => setNewSlot(p => ({ ...p, max_bookings: e.target.value }))}
              placeholder="50"
              className="px-3 py-2 rounded-lg text-xs font-sans text-warm-cream/80 focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-600"
              style={{ background: 'var(--at-surface-5)', border: '1px solid var(--at-border-mid)' }}
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-3 items-start sm:items-end">
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
          <div className="flex flex-col gap-1 flex-1">
            <label className="font-ui text-[9px] tracking-widest uppercase text-warm-cream/35">Days</label>
            <div className="flex gap-0.5 flex-wrap">
              {DAY_LABELS.map((d, i) => (
                <button
                  key={d}
                  onClick={() => {
                    const days = newSlot.available_days.includes(i)
                      ? newSlot.available_days.filter((d: number) => d !== i)
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
          Max Bookings sets the maximum number of offline seva bookings allowed per slot per day. Days column shows which days of the week the slot is available (S-Sat). Toggle days in Week View to bulk-manage availability. Inactive slots are hidden from the booking form entirely.
        </p>
      </div>
    </div>
  );
}
