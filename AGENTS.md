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

Pre-commit runs `lint-staged` (eslint: `*.{ts,tsx}`) then `tsc --noEmit`. Pre-push runs `tsc --noEmit` again. Both block on failure. Commits require conventional commit format (`commitlint`).

## Project structure

Single Next.js 16 App Router package (not a monorepo).

- `app/(auth)/` — public routes (login, register)
- `app/(user)/` — authenticated dashboard routes (orders, products, bot-config, bot-credentials)
- Each feature in `(user)/` has `_components/`, page, and layout via private (underscore-prefixed) folders
- `services/` — API client layer
- `schemas/` — zod validation schemas
- `components/ui/` — shadcn/ui components (New York style, neutral base)
- `actions/auth.ts` — server actions for token cookie management
- `proxy.ts` — standalone middleware (not wired; contains route matcher config)

## API client

**Always use `services/fetcher.ts`** (custom fetch wrapper with auth handling) for new code. The axios instance in `services/index.ts` exists but is legacy. `services/cashflow/index.ts` is a stub (only endpoint string constants).

## Key conventions

- **UI strings in Indonesian** — error messages (`toast.error()`), labels, and all user-facing text
- Backend at `NEXT_PUBLIC_API_URL` (default `http://localhost:5505`), prefixed with `/api/`
- JWT token stored in `httpOnly` cookie named `token`; pages read via `getToken()` server action

## `folder-structure.md` is manually maintained — keep in sync when changing routes/files.

## TypeScript

`strict: true`. Path alias `@/*` maps to repo root. Hooks run `tsc --noEmit` before commits and pushes.
