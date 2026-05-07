# Plan: Hash-Based → Path-Based Routing + Sub-page SEO Fixes

## Files to Modify

| File | Changes |
|------|---------|
| `vite.config.ts` | Add `appType: 'spa'` for SPA fallback |
| `src/App.tsx` | Rewrite routing from hash to path-based; update all navigation |
| `src/components/CardNav.tsx` | Update links to use paths instead of hashes |
| `src/components/AdminLoginPage.tsx` | Fix heading hierarchy (add missing H2) |
| `src/components/AdminDashboardPage.tsx` | Fix redundant H1/H2, fix alt="SSP" |
| `index.html` | Update static meta description, update OG tags |

---

## Step 1: Vite Config — SPA Fallback

Add `appType: 'spa'` so all routes serve `index.html`:

```ts
export default defineConfig(({mode}) => {
  return {
    appType: 'spa',  // <-- add this
    plugins: [react(), tailwindcss()],
    ...
  };
});
```

---

## Step 2: Update `src/App.tsx` — Path-Based Routing

### 2a. Path → Page mapping

Replace hash-based state initialization with path-based:

```ts
const PATH_MAP: Record<string, 'home' | 'donate' | 'swami' | 'about' | 'visit' | 'contact' | 'activities' | 'publications' | 'booking-status' | 'admin'> = {
  '/': 'home',
  '/about': 'about',
  '/donate': 'donate',
  '/visit': 'visit',
  '/contact': 'contact',
  '/swami': 'swami',
  '/activities': 'activities',
  '/publications': 'publications',
  '/bookings': 'booking-status',
  '/admin': 'admin',
};
```

### 2b. Page state — read from `pathname`

```ts
const [page, setPage] = useState<...>(() => {
  if (typeof window === 'undefined') return 'home';
  const p = window.location.pathname;
  // Handle /swami/0, /swami/1, etc.
  if (p.startsWith('/swami/')) return 'swami';
  return PATH_MAP[p] || 'home';
});
```

### 2c. Swami index — read from pathname

```ts
const [selectedSwamiIndex, setSelectedSwamiIndex] = useState(() => {
  if (typeof window === 'undefined') return 0;
  const match = window.location.pathname.match(/^\/swami\/(\d+)$/);
  if (match) {
    return Math.max(0, Math.min(parseInt(match[1], 10), 5));
  }
  return 0;
});
```

### 2d. Update all navigation handlers

Each `goToXxxPage()` function changes from:
```ts
window.history.replaceState(null, '', '#about');
```
to:
```ts
window.history.pushState(null, '', '/about');
```

And add a `navigate()` helper:
```ts
const navigate = (path: string) => {
  closeNav();
  window.history.pushState(null, '', path);
  syncPageFromPath();
  window.scrollTo({ top: 0, behavior: 'auto' });
};
```

### 2e. Update hashchange/popstate → popstate/path-based

Rename `syncPageFromHash` to `syncPageFromPath`. Replace:
```ts
const hash = window.location.hash;
```
with:
```ts
const p = window.location.pathname;
```

Remove the `hashchange` listener, keep only `popstate`. The initial sync already runs on mount via the same function.

### 2f. Section anchor handling

For section anchors within the home page (teachings, deities, calendar, etc.):

**Navigation approach**: Keep section anchors as hash links:

```ts
// When user clicks #teachings from navbar:
// If on home page: scrollIntoView directly
// If on another page: navigate to '/#teachings' or use pendingScrollTarget
```

Use state-based approach:
- Clicking "Teachings" from another page → `navigate('/')` + `pendingScrollTarget.current = '#teachings'`
- The existing `useEffect` on `page === 'home'` fires and scrolls

### 2g. Update SEO/replaceState calls

Update the `seo.url` and Helmet canonical URL:
```ts
url: `${baseUrl}${pathname}`  // no hash
```

---

## Step 3: Update `CardNav.tsx` — Link URLs

Change `href` values from `#about` to `/about`, etc.

The `CARD_NAV_ITEMS` in `App.tsx` currently has hash-based `href` values. The `onNavigate` handler passes these to navigation functions. Since we use a handler-based approach (the `onNavigate` function in App.tsx), the `href` values just need to be unique identifiers that the handler maps to actions.

**Approach**: Keep `href` values as identifiers but make them paths:
- `#home` → `/`
- `#about` → `/about`
- `#visit` → `/visit`
- `#swamiji` → `/swami`
- `#teachings` → `/teachings` (scrolling)
- etc.

The `onNavigate` handler maps these to the correct behavior.

---

## Step 4: Fix Sub-page SEO Issues

### 4a. `AdminLoginPage.tsx`

```tsx
// Add missing H2:
<h1 className="font-serif text-2xl text-warm-cream tracking-wide">Sri Siddheswari Peetham</h1>
<p className="font-ui text-xs tracking-widest uppercase text-warm-cream/40 mb-8">Admin Portal</p>
```
Change `<p>` to `<h2>`:
```tsx
<h2 className="font-ui text-xs tracking-widest uppercase text-warm-cream/40 mb-8">Admin Portal</h2>
```

Fix alt text:
```tsx
alt="SSP" → alt="Sri Siddheswari Peetham Logo"
```

### 4b. `AdminDashboardPage.tsx`

Fix redundant heading: remove `<h1>` in the sticky header or change it to a `<div>`:
```tsx
// Change: <h1 className="font-ui text-xs tracking-widest uppercase text-warm-cream/70">{sectionLabel}</h1>
// To: <div className="font-ui text-xs tracking-widest uppercase text-warm-cream/70">{sectionLabel}</div>
```

Fix alt text:
```tsx
alt="SSP" → alt="Sri Siddheswari Peetham Logo"
```

---

## Step 5: Verification

1. `npm run build` — Ensure no TypeScript/build errors
2. Manual URL checks:
   - Visit `/` → home page
   - Visit `/about` → about page
   - Visit `/swami/2` → swami page with index 2
   - Visit `/donate` → donate page
   - Click "Teachings" from navbar → scrolls to teachings section
   - Browser back/forward works correctly
   - Refresh on `/about` → loads about page (SPA fallback works)
3. Verify all sub-pages still mount correctly with `onBack` handlers
4. Check that section anchors (teachings, deities, calendar) still scroll properly from within home page and from other pages
5. Verify footer links still work
