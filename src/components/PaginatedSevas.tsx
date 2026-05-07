import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, RefreshCw, Plus, Edit2, Save, Ban, Trash2, ChevronRight } from 'lucide-react';

// ── Types ────────────────────────────────────────────//

interface Seva {
  name: string;
  price: number;
}

// ── Main Component ───────────────────────────────────────//

export default function PaginatedSevas() {
  const [sevas, setSevas] = useState<Seva[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editBuf, setEditBuf] = useState<Partial<Seva>>({});
  const [saving, setSaving] = useState(false);
  const [newSeva, setNewSeva] = useState({ name: '', price: '' });
  const [adding, setAdding] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('ref_sevas').select('*').order('name');
    setSevas((data as Seva[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (s: Seva) => { setEditingName(s.name); setEditBuf(s); };
  const cancelEdit = () => { setEditingName(null); setEditBuf({}); };

  const saveEdit = async () => {
    if (!editingName) return;
    setSaving(true);
    const { error } = await supabase.from('ref_sevas').update({ price: editBuf.price }).eq('name', editingName);
    if (!error) {
      setSevas(prev => prev.map(s => s.name === editingName ? { ...s, price: editBuf.price ?? s.price } : s));
      setEditingName(null);
    }
    setSaving(false);
  };

  const addSeva = async () => {
    if (!newSeva.name || !newSeva.price) return;
    setAdding(true);
    const { error } = await supabase.from('ref_sevas').insert({ name: newSeva.name, price: +newSeva.price });
    if (!error) { setNewSeva({ name: '', price: '' }); load(); }
    setAdding(false);
  };

  const deleteSeva = async (name: string) => {
    if (!confirm(`Delete seva "${name}"?`)) return;
    await supabase.from('ref_sevas').delete().eq('name', name);
    setSevas(prev => prev.filter(s => s.name !== name));
  };

  const fieldCls = "bg-transparent border-b text-warm-cream/80 font-sans text-sm focus:outline-none w-full py-0.5 transition-colors";
  const fieldStyle = { borderColor: 'var(--at-border-input)' };

  // Pagination
  const totalPages = Math.ceil(sevas.length / pageSize);
  const paginatedSevas = sevas.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, []);

  return (
    <div className="space-y-6">
      {/* Header - responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-warm-cream">Seva Management</h2>
          <p className="font-ui text-xs tracking-widest uppercase text-warm-cream/30 mt-0.5">
            {sevas.length} total · Page {page}/{totalPages || 1}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={e => { setPageSize(+e.target.value); setPage(1); }}
            className="px-2 py-1.5 rounded-lg font-ui text-[10px] text-warm-cream/60 focus:outline-none dark:bg-gray-800 dark:text-white"
            style={{ background: 'var(--at-surface-5)', border: '1px solid var(--at-border-mid)' }}
          >
            {[5, 10, 20, 50].map(n => (
              <option key={n} value={n}>{n} per page</option>
            ))}
          </select>
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg font-ui text-xs tracking-widest uppercase text-warm-cream/60 hover:text-warm-cream border transition-colors" style={{ borderColor: 'var(--at-border-dim)' }}>
            <RefreshCw size={13} /> <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Add new seva - responsive */}
      <div className="rounded-xl p-4 sm:p-5 border" style={{ background: 'var(--at-card-alt)', borderColor: 'var(--at-border-mid)' }}>
        <p className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/40 mb-4">Add New Seva</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={newSeva.name}
            onChange={e => setNewSeva(p => ({ ...p, name: e.target.value }))}
            placeholder="Seva name"
            className="flex-1 min-w-0 px-3 py-2 rounded-lg text-xs font-sans text-warm-cream/80 focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-600"
            style={{ background: 'var(--at-surface-5)', border: '1px solid var(--at-border-mid)' }}
          />
          <input
            type="number"
            value={newSeva.price}
            onChange={e => setNewSeva(p => ({ ...p, price: e.target.value }))}
            placeholder="Price (₹)"
            className="w-full sm:w-32 px-3 py-2 rounded-lg text-xs font-sans text-warm-cream/80 focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-600"
            style={{ background: 'var(--at-surface-5)', border: '1px solid var(--at-border-mid)' }}
          />
          <button
            onClick={addSeva}
            disabled={adding || !newSeva.name || !newSeva.price}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-sacred-red text-warm-cream rounded-lg font-ui text-xs tracking-widest uppercase hover:bg-sacred-red/80 disabled:opacity-50 transition-colors w-full sm:w-auto"
          >
            {adding ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Add
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-sacred-red" /></div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block rounded-xl overflow-hidden border" style={{ borderColor: 'var(--at-border-mid)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr style={{ background: 'var(--at-table-head)' }}>
                    {['Seva Name', 'Price (₹)', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-ui text-[10px] tracking-widest uppercase text-warm-cream/40">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedSevas.map((s, i) => (
                    <tr key={s.name} style={{ background: i % 2 === 0 ? 'var(--at-surface-2)' : 'transparent' }} className="border-t">
                      <td className="px-4 py-3">
                        <span className="font-sans text-xs text-warm-cream/70">{s.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        {editingName === s.name ? (
                          <input type="number" className={fieldCls} style={fieldStyle} value={editBuf.price ?? ''} onChange={e => setEditBuf(p => ({ ...p, price: +e.target.value }))} />
                        ) : (
                          <span className="font-sans text-xs text-spiritual-gold">₹{s.price.toLocaleString('en-IN')}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {editingName === s.name ? (
                            <>
                              <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-sacred-red text-warm-cream font-ui text-[10px] tracking-widest uppercase hover:bg-sacred-red/80 disabled:opacity-50 transition-colors">
                                {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />} <span className="hidden sm:inline">Save</span>
                              </button>
                              <button onClick={cancelEdit} className="flex items-center gap-1 px-3 py-1 rounded-lg font-ui text-[10px] tracking-widest uppercase text-warm-cream/40 hover:text-warm-cream/70 border transition-colors" style={{ borderColor: 'var(--at-border-dim)' }}>
                                <Ban size={11} /> <span className="hidden sm:inline">Cancel</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(s)} className="flex items-center gap-1 px-3 py-1 rounded-lg font-ui text-[10px] tracking-widest uppercase text-warm-cream/40 hover:text-warm-cream/70 border transition-colors" style={{ borderColor: 'var(--at-border-dim)' }}>
                                <Edit2 size={11} /> <span className="hidden sm:inline">Edit</span>
                              </button>
                              <button onClick={() => deleteSeva(s.name)} className="flex items-center gap-1 px-3 py-1 rounded-lg font-ui text-[10px] tracking-widest uppercase text-red-400/60 hover:text-red-400 border border-red-500/10 hover:border-red-500/30 transition-colors">
                                <Trash2 size={11} /> <span className="hidden sm:inline">Delete</span>
                              </button>
                            </>
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
            {paginatedSevas.map(s => (
              <div key={s.name} className="rounded-xl p-4 border" style={{ background: 'var(--at-card-bg)', borderColor: 'var(--at-border-mid)' }}>
                <div className="flex items-start justify-between mb-3">
                  <p className="font-sans text-sm text-warm-cream/80 flex-1 min-w-0 truncate">{s.name}</p>
                  <p className="font-sans text-base text-spiritual-gold ml-3">₹{s.price.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: 'var(--at-border-dim)' }}>
                  {editingName === s.name ? (
                    <>
                      <input type="number" className={fieldCls + ' flex-1'} style={fieldStyle} value={editBuf.price ?? ''} onChange={e => setEditBuf(p => ({ ...p, price: +e.target.value }))} />
                      <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sacred-red text-warm-cream font-ui text-[10px] tracking-widest uppercase hover:bg-sacred-red/80 disabled:opacity-50 transition-colors">
                        {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />} Save
                      </button>
                      <button onClick={cancelEdit} className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-ui text-[10px] tracking-widest uppercase text-warm-cream/40 hover:text-warm-cream/70 border transition-colors" style={{ borderColor: 'var(--at-border-dim)' }}>
                        <Ban size={11} /> Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(s)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-ui text-[10px] tracking-widest uppercase text-warm-cream/40 hover:text-warm-cream/70 border transition-colors flex-1 justify-center" style={{ borderColor: 'var(--at-border-dim)' }}>
                        <Edit2 size={11} /> Edit
                      </button>
                      <button onClick={() => deleteSeva(s.name)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-ui text-[10px] tracking-widest uppercase text-red-400/60 hover:text-red-400 border border-red-500/10 hover:border-red-500/30 transition-colors">
                        <Trash2 size={11} /> Delete
                      </button>
                    </>
                  )}
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
    </div>
  );
}
