# order-bot-dashboard

## Commands

| Action | Command |
|--------|---------|
| Dev server | `npm run dev` (port 5506) |
| Mock API | `npm run dev:json` (port 3001, serves `json/data.json`) |
| Build | `npm run build` |
| Typecheck | `npm run test:tsc` (`tsc -p . --noEmit`) |
| Lint | `npx eslint <files>` (`npm run lint` is broken — Next 16 removed `next lint`; 3 baseline `react-hooks/exhaustive-deps` warnings are acceptable) |
| Format | `npx prettier --write .` |

Pre-commit: `lint-staged` (eslint `*.{ts,tsx}`) then `tsc --noEmit`. Pre-push: `tsc --noEmit`. Commit-msg: `commitlint` enforces conventional commits. All block on failure.

## API client

**Always use `services/fetcher.ts`** for new code. The axios instance in `services/index.ts` is legacy. `services/cashflow/index.ts` is a stub with misnamed endpoint constants (use `services/orders/` instead).

Backend at `NEXT_PUBLIC_API_URL` (default `http://localhost:5505`), path prefixed with `/api/`. JWT in `httpOnly` cookie named `token`; server pages call `getToken()` from `actions/auth.ts` and pass token as prop to client components. Client components handle missing/empty token by rendering an empty state.

## Route groups

- `app/(auth)/` — login, register (no sidebar)
- `app/(user)/` — authenticated dashboard (sidebar layout): dashboard, orders, products, templates, tickets, customers, broadcasts, fulfillment, bot-config, bot-credentials, plan
- `app/(public)/store/[userId]/` — public storefront (product list, order page, plus customer-facing login/register/profile)
- `app/payment/success/` — public payment success page (no auth, uses `useSearchParams` to read `order_id`, wrapped in `<Suspense>`)

## Feature modules

- `services/tickets/` — Kanban board with dnd-kit, per-status pagination (6 statuses), labels, comments. Status-filtered endpoint `/tickets/status/{STATUS}?page=N&limit=M`
- `services/customers/` — full CRUD with search, source/order-source filters, order history
- `services/public/` — store profile, products, order creation + status, order detail
- `app/(user)/_components/data-table.tsx` — shared table component; props `columns, data, onRowClick?, isLoading?, emptyIcon?, emptyMessage?, emptyDescription?, pagination?: { page, totalPages, onPageChange, total?, totalLabel? }, stickyHeader?, className?`; pagination renders `components/shared/data-table-pagination.tsx`
- `proxy.ts` — standalone middleware file with route matcher config but no `middleware.ts` exists

## UI conventions

- **UI strings in Indonesian** — all user-facing text, toast messages, labels
- **Status tones via `lib/status-tokens.ts`** — single source of truth: `StatusKind` (order, ticket-status, ticket-priority, broadcast, fulfillment, invoice, stock, source) maps each value to a `Tone` (success/warning/error/info/processing/confirmed/neutral) with ID+EN labels. Render with `<StatusBadge kind= value= />` (`components/shared/status-badge.tsx`); tone class pattern `border-{tone}/25 bg-{tone}/12 text-{tone}`. Filters use `statusOptions(kind, allLabel)`. Never hardcode per-status color maps again.
- `formatIDRCurrency` in `lib/utils.ts` — `Rp${amount.toLocaleString('id-ID')}`
- `formatDate` in `lib/utils.ts` — handles Date, string, number, or Firestore timestamp-like objects

## Design system

"Signal Charcoal" — full spec in [`DESIGN.md`](./DESIGN.md) (loaded via `opencode.json`). Key rules:
- Typography: Space Grotesk for display/UI + IBM Plex Mono for data (`tabular` numerals). Weight ceiling 700 — no 800/900.
- Single accent: signal citron hue 78° (light `#5B7029`, dark `#B8D86E`). Never use it as a gradient stop, blob, badge fill, or metric-card icon tint.
- Surfaces are opaque tokens with tinted shadows `shadow-l1/l2/l3` (`.surface` utility). `backdrop-blur` is budgeted to exactly 2 sites: mobile sticky bar (`app/(user)/_layouts/home-layout.tsx`) and storefront navbar (`app/(public)/store/[userId]/layout.tsx`).
- Dark-first charcoal in both modes; sidebar stays a dark rail in light mode (`bg-sidebar` tokens).
- Custom font sizes in tailwind.config.ts: `page-title`, `section-header`, `subsection-header`, `card-title`, `small-header`, `body`, `body-sm`, `caption`, `label`, `mono-data`; utilities `.kicker`, `.tabular`, `.signal-glow` (auth/landing only), `animate-fade-in-up`.
- Body has grid+dot paper background via `globals.css` (`.bg-grid-paper`); data surfaces use solid token backgrounds to prevent pattern bleed.
- No raw palette literals (`slate-*`, `gray-*`, etc.) outside `components/ui/switch.tsx`'s sanctioned knob `bg-white` and chat-preview bubbles.

## TypeScript

`strict: true`. Path alias `@/*` maps to repo root.

## `folder-structure.md` is manually maintained — keep in sync when changing routes/files.
