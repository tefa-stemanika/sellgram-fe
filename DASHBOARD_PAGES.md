# DASHBOARD_PAGES.md — Instruksi Implementasi Per Halaman

---

## proxy.ts

Buat file `proxy.ts` di **root project** (sejajar dengan `app/`):

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register']

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons|images).*)'],
}
```

---

## `app/(auth)/login/page.tsx`

**Server Component** yang render `LoginLayout`.

```
Fungsi halaman:
- Render form login dengan field: email, password
- Validasi dengan loginSchema dari schemas/auth.ts
- Submit → panggil login() dari services/user
- Jika sukses → panggil setToken() dari actions/auth.ts → redirect ke '/'
- Jika gagal → tampilkan error message via toast.error()
- Ada link ke /register

Komponen yang dibutuhkan:
- Form menggunakan shadcn Form, FormField, FormItem, FormLabel, FormControl, FormMessage
- Input untuk email dan password
- Button submit dengan loading state
- Semua dalam LoginLayout yang sudah ada

Letakkan semua komponen form di dalam login-layout.tsx atau page.tsx langsung
karena tidak akan dipakai di halaman lain.
```

---

## `app/(auth)/register/page.tsx`

**Server Component** yang render `RegisterLayout`.

```
Fungsi halaman:
- Render form register dengan field: name, email, password
- Validasi dengan registerSchema dari schemas/auth.ts
- Submit → panggil register() dari services/user
- Jika sukses → panggil setToken() → redirect ke '/'
- Jika gagal → tampilkan error via toast.error()
- Ada link ke /login
```

---

## `app/(user)/page.tsx` — Dashboard Home

**Server Component.**

```
Fungsi halaman:
- Ambil token dari cookies via getToken()
- Render komponen overview/ringkasan
- Tampilkan: total produk, total order, order terbaru (5 terakhir)
- Fetch getProducts() dan getOrders(token, 5) di server component
- Oper data ke client component untuk render

Isi overview:
- Card: Jumlah Produk Aktif
- Card: Total Order
- Card: Total Pendapatan (sum totalPrice dari order COMPLETED)
- Tabel order terbaru (5 baris, tanpa pagination)

Komponen spesifik halaman ini simpan di app/(user)/_components/ yang sudah ada.
```

---

## `app/(user)/products/page.tsx` + `_components/`

**Server Component** yang fetch data, client component yang handle interaksi.

```
Fungsi halaman:
- Tampilkan tabel semua produk dengan kolom:
  emoji | nama | deskripsi | harga | status (tersedia/tidak) | aksi (edit, hapus)
- Tombol "Tambah Produk" membuka dialog form create
- Klik edit → buka dialog form update (pre-filled dengan data produk)
- Klik hapus → buka dialog konfirmasi hapus

File yang dibuat:
1. page.tsx (server component)
   - getToken() → ambil token
   - getProducts(token) → fetch data
   - render ProductsClient dengan token dan initialData

2. _components/product-columns.tsx
   - Definisi kolom TanStack Table untuk Product
   - Kolom: emoji, name, description, price (format Rupiah), 
     isAvailable (Badge hijau/merah), actions (edit & delete button)
   - Columns menerima callback onEdit(product) dan onDelete(product) sebagai parameter

3. _components/product-form.tsx
   - Form untuk create dan update produk
   - Props: defaultValues?, onSubmit, isLoading
   - Field: name (Input), description (Textarea), price (Input number), 
     emoji (Input), isAvailable (Switch — hanya tampil saat update)
   - Schema: createProductSchema atau updateProductSchema dari schemas/products.ts

4. _components/delete-product-dialog.tsx
   - AlertDialog konfirmasi hapus
   - Props: product, open, onOpenChange, onConfirm, isLoading

5. _components/products-client.tsx (main client component)
   - State: products (array), isLoading, dialog states
   - Fungsi: handleCreate, handleUpdate, handleDelete
   - Render: Button tambah + DataTable + Dialog form + Dialog delete
   - Setelah aksi sukses: refresh data dengan fetch ulang getProducts()
```

---

## `app/(user)/bot-config/page.tsx` + `_components/`

```
Fungsi halaman:
- Tampilkan form konfigurasi bot yang sudah terisi dengan nilai saat ini
- Jika belum ada config → tampilkan form kosong dengan nilai default
- Submit form → jika belum ada config: createBotConfig(), jika sudah ada: updateBotConfig()

File yang dibuat:
1. page.tsx (server component)
   - getToken() → ambil token
   - getBotConfig(token) → fetch config yang ada
   - render BotConfigClient dengan token dan initialConfig

2. _components/bot-config-form.tsx
   - Form update/create bot config
   - Props: defaultValues?, onSubmit, isLoading
   - Field:
     * botMode: Select dengan opsi ["polling", "webhook"]
     * aiEnabled: Switch (AI Mode aktif/nonaktif)
     * geminiModel: Select dengan opsi model Gemini
       ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-flash-latest"]
     * midtransIsProduction: Switch (Sandbox/Production)
   - Schema: botConfigSchema dari schemas/bot-config.ts
   - Tampilkan deskripsi/helper text di bawah setiap field untuk menjelaskan fungsinya

3. _components/bot-config-client.tsx
   - Terima token dan initialConfig
   - Handle submit: bedakan create vs update berdasarkan ada/tidaknya initialConfig
   - Tampilkan toast sukses/error
```

---

## `app/(user)/bot-credentials/page.tsx` + `_components/`

```
Fungsi halaman:
- Tampilkan tabel semua credentials yang tersimpan
- PENTING: nilai credential TIDAK ditampilkan (untuk keamanan) — hanya key-nya
- Tombol "Tambah Credential" membuka dialog form create
- Klik edit → buka dialog form update (hanya field value, karena key tidak bisa diubah)
- Klik hapus → buka dialog konfirmasi

File yang dibuat:
1. page.tsx (server component)
   - getToken() → ambil token
   - getBotCredentials(token) → fetch data
   - render CredentialsClient

2. _components/credential-columns.tsx
   - Kolom: key, value (tampilkan "••••••••" bukan nilai asli), 
     updatedAt (format tanggal), actions (edit, delete)

3. _components/credential-form.tsx
   - Untuk CREATE: 
     * key: Select dari CREDENTIAL_KEYS (dari schemas/bot-credentials.ts)
     * value: Input type="password" dengan toggle show/hide
   - Untuk UPDATE:
     * Hanya field value (Input type="password")
     * Tampilkan label key di atas sebagai read-only text
   - Props: mode: 'create' | 'update', credentialKey?: string, onSubmit, isLoading

4. _components/delete-credential-dialog.tsx
   - AlertDialog konfirmasi hapus
   - Tampilkan nama key yang akan dihapus di pesan konfirmasi

5. _components/credentials-client.tsx
   - Handle CRUD dengan refresh data setelah setiap aksi
```

---

## `app/(user)/orders/page.tsx` + `_components/`

```
Fungsi halaman:
- Tampilkan tabel semua order (read-only, tidak ada create/update/delete)
- Klik baris atau tombol detail → buka dialog detail order
- Filter status order (opsional: semua, pending, completed, failed)

File yang dibuat:
1. page.tsx (server component)
   - getToken() → ambil token
   - getOrders(token, 50) → fetch data
   - render OrdersClient

2. _components/order-columns.tsx
   - Kolom: orderId, username/firstName, total (format Rupiah), 
     status (Badge warna berbeda per status), paidAt, createdAt, aksi (detail)
   
   Status badge colors:
   - PAYMENT_PENDING → Badge kuning/warning
   - COMPLETED → Badge hijau/success  
   - PAYMENT_FAILED / CANCELLED → Badge merah/destructive
   - CONFIRMED / PROCESSING → Badge biru/info
   - PENDING → Badge abu/secondary

3. _components/order-detail-dialog.tsx
   - Dialog tampilkan detail lengkap satu order
   - Props: order: Order | null, open, onOpenChange
   - Tampilkan: info pembeli (nama, username, telegram ID), 
     detail item (produk, qty, harga satuan), total, status, waktu bayar
   - Tombol "Buka Link Pembayaran" jika paymentUrl tersedia

4. _components/orders-client.tsx
   - State: selectedOrder untuk detail dialog
   - Handle klik baris untuk buka detail
```

---

## Navigasi Sidebar (`app/(user)/_layouts/home-layout.tsx`)

```
Tambahkan navigasi ke semua halaman baru:

Menu items:
- Dashboard (icon: LayoutDashboard) → /
- Produk (icon: Package) → /products
- Bot Config (icon: Settings) → /bot-config
- Credentials (icon: KeyRound) → /bot-credentials
- Order (icon: ShoppingCart) → /orders

Tambahkan tombol logout di bagian bawah sidebar:
- Klik → panggil logout() dari services/user
- Lalu panggil removeToken() dari actions/auth.ts
- Redirect ke /login

Gunakan usePathname() untuk highlight menu yang aktif.
Gunakan komponen Sidebar yang sudah ada di components/ui/sidebar.tsx.
```
