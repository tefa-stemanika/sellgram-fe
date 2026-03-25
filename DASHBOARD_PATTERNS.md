# DASHBOARD_PATTERNS.md — Konvensi & Pattern Kode

## 1. Konvensi Folder

Komponen yang **hanya dipakai di satu halaman** disimpan di `_components/` dalam folder halaman tersebut.
Komponen yang dipakai di **banyak halaman** disimpan di `components/shared/` atau `components/core/`.

```
app/(user)/products/
├── page.tsx                    ← server component
└── _components/
    ├── product-columns.tsx     ← hanya dipakai di halaman products
    ├── product-form.tsx
    └── delete-product-dialog.tsx
```

---

## 2. Pattern Auth — Token di Cookies

### Server Action (`actions/auth.ts`)
Server action yang sudah ada menangani simpan/hapus token di cookies.
Pastikan ada dua fungsi:

```typescript
// actions/auth.ts
'use server'

import { cookies } from 'next/headers'

export async function setToken(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 hari
    path: '/',
  })
}

export async function removeToken() {
  const cookieStore = await cookies()
  cookieStore.delete('token')
}

export async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get('token')?.value
}
```

### Server Component — ambil token lalu oper ke Client
```typescript
// app/(user)/products/page.tsx
import { getToken } from '@/actions/auth'
import { ProductsClient } from './_components/products-client'

export default async function ProductsPage() {
  const token = await getToken()
  return <ProductsClient token={token ?? ''} />
}
```

### Client Component — terima token sebagai prop
```typescript
// app/(user)/products/_components/products-client.tsx
'use client'

interface Props {
  token: string
}

export function ProductsClient({ token }: Props) {
  // gunakan token untuk fetch data
}
```

---

## 3. Pattern Form (react-hook-form + zod + shadcn)

Selalu gunakan pola ini untuk semua form:

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// 1. Definisi schema (biasanya di file schemas/ terpisah)
const formSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  price: z.coerce.number().min(1, 'Harga wajib diisi'),
})

type FormValues = z.infer<typeof formSchema>

// 2. Komponen form
interface Props {
  onSubmit: (values: FormValues) => void
  defaultValues?: Partial<FormValues>
  isLoading?: boolean
}

export function ExampleForm({ onSubmit, defaultValues, isLoading }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      price: 0,
      ...defaultValues,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan nama" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </form>
    </Form>
  )
}
```

---

## 4. Pattern Service Function

Semua service function adalah **plain async function** yang menerima `token` sebagai parameter.
Tidak ada state management di layer service — hanya pure fetch.

```typescript
// services/products/index.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export type Product = {
  id: number
  name: string
  description: string
  price: number
  emoji: string
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

export type CreateProductPayload = {
  name: string
  description: string
  price: number
  emoji: string
}

export type UpdateProductPayload = Partial<CreateProductPayload> & {
  isAvailable?: boolean
}

export async function getProducts(token: string): Promise<Product[]> {
  const res = await fetch(`${BASE_URL}/products`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Gagal mengambil produk')
  const json = await res.json()
  return json.data
}

export async function createProduct(
  token: string,
  payload: CreateProductPayload
): Promise<Product> {
  const res = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Gagal membuat produk')
  const json = await res.json()
  return json.data
}

export async function updateProduct(
  token: string,
  id: number,
  payload: UpdateProductPayload
): Promise<Product> {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Gagal mengupdate produk')
  const json = await res.json()
  return json.data
}

export async function deleteProduct(token: string, id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Gagal menghapus produk')
}
```

---

## 5. Pattern Middleware

File `middleware.ts` di root project (bukan proxy.ts):

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  // Belum login dan akses halaman protected → redirect ke login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Sudah login dan akses halaman auth → redirect ke dashboard
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

## 6. Pattern DataTable

Gunakan komponen `DataTable` yang sudah ada di `app/(user)/_components/data-table.tsx`.
Definisikan kolom di file `_components/<entity>-columns.tsx` terpisah menggunakan TanStack Table:

```typescript
// app/(user)/products/_components/product-columns.tsx
'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Product } from '@/services/products'

export const productColumns: ColumnDef<Product>[] = [
  {
    accessorKey: 'emoji',
    header: '',
    cell: ({ row }) => <span>{row.original.emoji}</span>,
  },
  {
    accessorKey: 'name',
    header: 'Nama Produk',
  },
  {
    accessorKey: 'price',
    header: 'Harga',
    cell: ({ row }) =>
      new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(row.original.price),
  },
  // ... kolom aksi (edit, delete)
]
```

---

## 7. Pattern Toast Notification

Gunakan `sonner` (sudah ada di `components/ui/sonner.tsx`) untuk notifikasi:

```typescript
import { toast } from 'sonner'

// Sukses
toast.success('Produk berhasil disimpan')

// Error
toast.error('Gagal menyimpan produk')
```

Pastikan `<Toaster />` sudah ada di `app/layout.tsx`.

---

## 8. Pattern Loading & Error State

```typescript
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

async function handleSubmit(values: FormValues) {
  setIsLoading(true)
  setError(null)
  try {
    await createProduct(token, values)
    toast.success('Berhasil disimpan')
    // refresh data / close dialog
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan'
    toast.error(message)
  } finally {
    setIsLoading(false)
  }
}
```
