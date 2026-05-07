import re

# Read the original file
with open('src/components/AdminDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Change 1: Update OverviewSection function signature
content = content.replace(
    'function OverviewSection({ stats, recentBookings }: { stats: Stats; recentBookings: Booking[] }) {',
    'function OverviewSection({ stats, recentBookings, onNavigateToBookings }: { stats: Stats; recentBookings: Booking[]; onNavigateToBookings: () => void }) {'
)

# Change 2: Add View All button to Recent Bookings section
content = content.replace(
    '        <h3 className="font-ui text-xs tracking-widest uppercase text-warm-cream/40 mb-4">Recent Bookings</h3>',
    '''        <div className="flex items-center justify-between mb-4">
          <h3 className="font-ui text-xs tracking-widest uppercase text-warm-cream/40">Recent Bookings</h3>
          <button
            onClick={onNavigateToBookings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-ui text-[9px] tracking-widest uppercase text-sacred-red hover:text-sacred-red/80 border border-sacred-red/30 hover:border-sacred-red/50 transition-colors"
          >
            View All <ChevronRight size={11} />
          </button>
        </div>'''
)

# Change 3: Update OverviewSection call to pass navigation prop
content = content.replace(
    ': <OverviewSection stats={stats} recentBookings={recentBookings} />',
    ': <OverviewSection stats={stats} recentBookings={recentBookings} onNavigateToBookings={() => setActiveSection(\'bookings\')} />'
)

# Change 4: Add pagination state to BookingsSection
content = content.replace(
    '  const [expanded, setExpanded] = useState<string | null>(null);\n  const [updatingId, setUpdatingId] = useState<string | null>(null);',
    '  const [expanded, setExpanded] = useState<string | null>(null);\n  const [updatingId, setUpdatingId] = useState<string | null>(null);\n  const [page, setPage] = useState(1);\n  const [pageSize, setPageSize] = useState(10);'
)

# Change 5: Add pagination logic before return in BookingsSection
content = content.replace(
    '    return false;\n  }).length;\n\n  return (',
    '''    return false;
  }).length;

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedBookings = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, [activeTab, search, filterType, filterStatus]);

  return ('''
)

# Change 6: Update BookingsSection header with pagination info
content = content.replace(
    '            {filtered.length} shown · {bookings.length} total',
    '{filtered.length} total · Page {page}/{totalPages || 1}'
)

# Change 7: Add page size selector to header
content = content.replace(
    '        <button\n          onClick={load}\n          className="flex items-center gap-2 px-4 py-2 rounded-lg font-ui text-xs tracking-widest uppercase text-warm-cream/60 hover:text-warm-cream border transition-colors"\n          style={{ borderColor: \'var(--at-border-dim)\' }}\n        >\n          <RefreshCw size={13} /> Refresh\n        </button>\n      </div>',
    '''        <div className="flex items-center gap-2">
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
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-ui text-xs tracking-widest uppercase text-warm-cream/60 hover:text-warm-cream border transition-colors"
            style={{ borderColor: 'var(--at-border-dim)' }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>'''
)

# Change 8: Update booking list to use paginatedBookings
content = content.replace(
    '          {filtered.map(b => (',
    '          {paginatedBookings.map(b => ('
)

# Change 9: Add pagination controls after booking list
content = content.replace(
    '          {filtered.length === 0 && (',
    '''          {paginatedBookings.length === 0 && ('''
)

# Write the updated content
with open('src/components/AdminDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('All changes applied successfully!')
