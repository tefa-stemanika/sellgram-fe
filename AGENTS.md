# order-bot-dashboard

## Commands

| Action | Command |
|--------|---------|
| Dev server | `npm run dev` (port 3000) |
| Mock API | `npm run dev:json` (port 3001, serves `json/data.json`) |
| Build | `npm run build` |
| Typecheck | `npm run test:tsc` (`tsc -p . --noEmit`) |
| Lint | `npm run lint` (`next lint`) |
| Format | `npx prettier --write .` |

Pre-commit: `lint-staged` (eslint `*.{ts,tsx}`) then `tsc --noEmit`. Pre-push: `tsc --noEmit` again. Commit-msg: `commitlint` enforces conventional commits. All block on failure.

## Project structure

Single Next.js 16 App Router package (not a monorepo).

- `app/(auth)/` — public routes (login, register)
- `app/(user)/` — authenticated dashboard routes (orders, products, bot-config, bot-credentials, dashboard)
- `app/payment/success/` — public payment success page (no auth, no admin links)
- Each feature in `(user)/` has `_components/`, page, and layout via private (underscore-prefixed) folders
- `services/` — per-feature API client modules (bot-config, bot-credentials, cashflow, orders, products, user)
- `schemas/` — zod validation schemas (auth, bot-config, bot-credentials, cashflow, products, user)
- `components/ui/` — shadcn/ui components (New York style, neutral base)
- `components/core/`, `components/shared/` — empty, unused
- `app/(user)/_components/data-table.tsx` — shared table component; accepts optional `emptyIcon` (LucideIcon) and `emptyMessage` props
- `proxy.ts` — standalone middleware file (not wired into Next.js config; contains route matcher config but no `middleware.ts` exists)

## API client

**Always use `services/fetcher.ts`** (custom `fetch` wrapper with auth handling) for new code. The axios instance in `services/index.ts` exists but is legacy. `services/cashflow/index.ts` is a stub (only endpoint string constants).

## Key conventions

- **UI strings in Indonesian** — error messages (`toast.error()`), labels, and all user-facing text
- Backend at `NEXT_PUBLIC_API_URL` (default `http://localhost:5505`), prefixed with `/api/`
- JWT in `httpOnly` cookie named `token`; server pages call `getToken()` from `actions/auth.ts` and pass token as prop to client components. Client components handle missing/empty token by rendering an empty state.
- **Status badge map** reused across Dashboard overview, Orders columns, Order Detail dialog via consistent color Record (COMPLETED→emerald, PENDING→amber, PAYMENT_PENDING→blue, CANCELLED/PAYMENT_FAILED→red, CONFIRMED→sky, PROCESSING→violet)
- `formatIDRCurrency` in `lib/utils.ts` — `Rp${amount.toLocaleString('id-ID')}`
- `formatDate` in `lib/utils.ts` — handles Date, string, number, or Firestore timestamp-like objects (`{seconds, _seconds, toDate()}`)

## Design system

`opencode.json` loads [`DESIGN.md`](./DESIGN.md) as instructions. Summary:
- IBM Plex Mono throughout
- Primary `#f97316` (orange), secondary `#2563eb` (blue)
- Frosted glass (`bg-white/20 backdrop-blur-xl border border-white/20 shadow-2xl`), gradient accent bars
- Custom font sizes in tailwind.config.ts: `page-title`, `section-header`, `subsection-header`, `card-title`, `small-header`, `body`, `body-sm`, `caption`, `label`
- Body has grid+dot background pattern (48px spacing, primary color low opacity) via `globals.css`
- `SidebarInset` in home-layout.tsx overridden with `bg-transparent` so body pattern shows through
- Table/card containers use solid `bg-white dark:bg-card` (not transparent) to block pattern bleed

## TypeScript

`strict: true`. Path alias `@/*` maps to repo root. Pre-commit and pre-push hooks run `tsc --noEmit`.

## `folder-structure.md` is manually maintained — keep in sync when changing routes/files.
