# DASHBOARD_PLAN.md — Master Plan Implementasi Dashboard

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (sudah tersedia di `components/ui/`)
- **Form**: react-hook-form + zod
- **Auth**: Token JWT disimpan di cookies via Server Action

---

## Struktur Halaman yang Dibutuhkan

```
app/
├── (auth)/
│   ├── login/
│   │   ├── _layouts/login-layout.tsx     ← sudah ada
│   │   └── page.tsx                      ← IMPLEMENT
│   └── register/
│       ├── _layouts/register-layout.tsx  ← sudah ada
│       └── page.tsx                      ← IMPLEMENT
│
└── (user)/
    ├── page.tsx                          ← IMPLEMENT (dashboard home/overview)
    ├── _layouts/home-layout.tsx          ← sudah ada
    │
    ├── products/
    │   ├── page.tsx                      ← IMPLEMENT
    │   └── _components/
    │       ├── product-columns.tsx       ← BUAT BARU
    │       ├── product-form.tsx          ← BUAT BARU
    │       └── delete-product-dialog.tsx ← BUAT BARU
    │
    ├── bot-config/
    │   ├── page.tsx                      ← IMPLEMENT
    │   └── _components/
    │       └── bot-config-form.tsx       ← BUAT BARU
    │
    ├── bot-credentials/
    │   ├── page.tsx                      ← IMPLEMENT
    │   └── _components/
    │       ├── credential-columns.tsx    ← BUAT BARU
    │       ├── credential-form.tsx       ← BUAT BARU
    │       └── delete-credential-dialog.tsx ← BUAT BARU
    │
    └── orders/
        ├── page.tsx                      ← IMPLEMENT
        └── _components/
            ├── order-columns.tsx         ← BUAT BARU
            └── order-detail-dialog.tsx   ← BUAT BARU
```

---

## File Baru di Luar `app/`

```
actions/
├── auth.ts          ← sudah ada (simpan/hapus token di cookies)
├── products.ts      ← BUAT BARU
├── bot-config.ts    ← BUAT BARU
└── bot-credentials.ts ← BUAT BARU

services/
├── fetcher.ts       ← sudah ada
├── index.ts         ← sudah ada
├── user/index.ts    ← sudah ada
├── products/
│   └── index.ts     ← BUAT BARU
├── bot-config/
│   └── index.ts     ← BUAT BARU
├── bot-credentials/
│   └── index.ts     ← BUAT BARU
└── orders/
    └── index.ts     ← BUAT BARU

schemas/
├── auth.ts          ← sudah ada
├── user.ts          ← sudah ada
├── products.ts      ← BUAT BARU
├── bot-config.ts    ← BUAT BARU
└── bot-credentials.ts ← BUAT BARU

middleware.ts        ← BUAT BARU (proteksi route)
```

---

## Urutan Implementasi yang Disarankan

1. `middleware.ts` — proteksi semua route `/` dari user yang belum login
2. `actions/auth.ts` — pastikan `setToken` dan `removeToken` sudah ada
3. `schemas/` — semua schema Zod
4. `services/` — semua service function
5. Auth pages — login & register
6. `app/(user)/_layouts/home-layout.tsx` — sidebar/navbar layout
7. Dashboard home — `app/(user)/page.tsx`
8. Products — full CRUD
9. Bot Config — form update
10. Bot Credentials — full CRUD
11. Orders — read only + detail

---

## API Base URL

Semua request ke backend: `http://localhost:3000/api` (development).
Simpan di `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Semua request authenticated menggunakan header:
```
Authorization: Bearer <token>
```

Token diambil dari cookies di Server Component, lalu dioper ke Client Component atau service.
