# order-bot-dashboard

## Commands

| Action | Command |
|--------|---------|
| Dev server | `npm run dev` (port 5506) |
| Mock API | `npm run dev:json` (port 3001, serves `json/data.json`) |
| Build | `npm run build` |
| Typecheck | `npm run test:tsc` (`tsc -p . --noEmit`) |
| Lint | `npm run lint` (`next lint`) |
| Format | `npx prettier --write .` |

Pre-commit: `lint-staged` (eslint `*.{ts,tsx}`) then `tsc --noEmit`. Pre-push: `tsc --noEmit`. Commit-msg: `commitlint` enforces conventional commits. All block on failure.

## API client

**Always use `services/fetcher.ts`** for new code. The axios instance in `services/index.ts` is legacy. `services/cashflow/index.ts` is a stub with misnamed endpoint constants (use `services/orders/` instead).

Backend at `NEXT_PUBLIC_API_URL` (default `http://localhost:5505`), path prefixed with `/api/`. JWT in `httpOnly` cookie named `token`; server pages call `getToken()` from `actions/auth.ts` and pass token as prop to client components. Client components handle missing/empty token by rendering an empty state.

## Route groups

- `app/(auth)/` — login, register (no sidebar)
- `app/(user)/` — authenticated dashboard (sidebar layout): dashboard, orders, products, bot-config, bot-credentials, customers, tickets
- `app/(public)/store/[userId]/` — public storefront (product list, order page)
- `app/payment/success/` — public payment success page (no auth, uses `useSearchParams` to read `order_id`, wrapped in `<Suspense>`)

## Feature modules

- `services/tickets/` — Kanban board with dnd-kit, per-status pagination (6 statuses), labels, comments. Status-filtered endpoint `/tickets/status/{STATUS}?page=N&limit=M`
- `services/customers/` — full CRUD with search, source/order-source filters, order history
- `services/public/` — store profile, products, order creation + status, order detail
- `app/(user)/_components/data-table.tsx` — shared table component; optional `emptyIcon` (LucideIcon) and `emptyMessage` props
- `proxy.ts` — standalone middleware file with route matcher config but no `middleware.ts` exists

## UI conventions

- **UI strings in Indonesian** — all user-facing text, toast messages, labels
- **Status badge color map** (consistent across dashboard, orders, tickets):
  COMPLETED→emerald, PENDING→amber, PAYMENT_PENDING→blue, CANCELLED/PAYMENT_FAILED→red, CONFIRMED→sky, PROCESSING→violet
- `formatIDRCurrency` in `lib/utils.ts` — `Rp${amount.toLocaleString('id-ID')}`
- `formatDate` in `lib/utils.ts` — handles Date, string, number, or Firestore timestamp-like objects

## Design system

`opencode.json` loads [`DESIGN.md`](./DESIGN.md). Key points:
- IBM Plex Mono throughout, primary `#f97316` (orange), secondary `#2563eb` (blue)
- Frosted glass (`bg-white/20 backdrop-blur-xl border border-white/20 shadow-2xl`)
- Custom font sizes in tailwind.config.ts: `page-title`, `section-header`, `subsection-header`, `card-title`, `small-header`, `body`, `body-sm`, `caption`, `label`
- Body has grid+dot background via `globals.css`; table/card containers use solid `bg-white dark:bg-card` to prevent pattern bleed
- `SidebarInset` in home-layout.tsx overridden with `bg-transparent`

## TypeScript

`strict: true`. Path alias `@/*` maps to repo root.

## `folder-structure.md` is manually maintained — keep in sync when changing routes/files.
