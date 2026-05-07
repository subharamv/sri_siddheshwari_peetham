import re

with open('src/components/AdminDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Change 1: Update OverviewSection function signature
content = content.replace(
    'function OverviewSection({ stats, recentBookings }: { stats: Stats; recentBookings: Booking[] }) {',
    'function OverviewSection({ stats, recentBookings, onNavigateToBookings }: { stats: Stats; recentBookings: Booking[]; onNavigateToBookings: () => void }) {'
)

# Change 2: Add View All button to Recent Bookings section
old_recent = '''      {/* Recent bookings */}
      <div>
        <h3 className="font-ui text-xs tracking-widest uppercase text-warm-cream/40 mb-4">Recent Bookings</h3>'''

new_recent = '''      {/* Recent bookings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-ui text-xs tracking-widest uppercase text-warm-cream/40">Recent Bookings</h3>
          <button
            onClick={onNavigateToBookings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-ui text-[9px] tracking-widest uppercase text-sacred-red hover:text-sacred-red/80 border border-sacred-red/30 hover:border-sacred-red/50 transition-colors"
          >
            View All <ChevronRight size={11} />
          </button>
        </div>'''

content = content.replace(old_recent, new_recent)

# Change 3: Update OverviewSection call to pass navigation prop
content = content.replace(
    ': <OverviewSection stats={stats} recentBookings={recentBookings} />',
    ': <OverviewSection stats={stats} recentBookings={recentBookings} onNavigateToBookings={() => setActiveSection(\'bookings\')} />'
)

with open('src/components/AdminDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Changes applied successfully')
