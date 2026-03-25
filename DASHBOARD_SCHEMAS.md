# DASHBOARD_SCHEMAS.md — Semua Schema Zod

Semua schema disimpan di folder `schemas/`. Digunakan oleh react-hook-form di form komponen.

---

## `schemas/auth.ts` (sudah ada — pastikan sesuai ini)

```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(6, 'Password minimal 6 karakter'),
})

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama wajib diisi')
    .max(100, 'Nama maksimal 100 karakter'),
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(6, 'Password minimal 6 karakter'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
```

---

## `schemas/products.ts` (BUAT BARU)

```typescript
import { z } from 'zod'

export const productSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama produk wajib diisi')
    .max(100, 'Nama maksimal 100 karakter'),
  description: z
    .string()
    .min(1, 'Deskripsi wajib diisi'),
  price: z.coerce
    .number({ invalid_type_error: 'Harga harus berupa angka' })
    .min(1, 'Harga minimal Rp 1')
    .max(99_999_999, 'Harga terlalu besar'),
  emoji: z
    .string()
    .min(1, 'Emoji wajib diisi')
    .max(10, 'Emoji terlalu panjang'),
  isAvailable: z.boolean().default(true),
})

// Untuk create: semua field kecuali isAvailable (default true)
export const createProductSchema = productSchema.omit({ isAvailable: true })

// Untuk update: semua field opsional
export const updateProductSchema = productSchema.partial()

export type ProductFormValues = z.infer<typeof productSchema>
export type CreateProductFormValues = z.infer<typeof createProductSchema>
export type UpdateProductFormValues = z.infer<typeof updateProductSchema>
```

---

## `schemas/bot-config.ts` (BUAT BARU)

```typescript
import { z } from 'zod'

export const botConfigSchema = z.object({
  botMode: z.enum(['polling', 'webhook'], {
    errorMap: () => ({ message: 'Mode harus polling atau webhook' }),
  }),
  aiEnabled: z.boolean(),
  geminiModel: z.enum([
    'gemini-2.0-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-flash-latest',
  ], {
    errorMap: () => ({ message: 'Pilih model Gemini yang valid' }),
  }),
  midtransIsProduction: z.boolean(),
})

export type BotConfigFormValues = z.infer<typeof botConfigSchema>
```

---

## `schemas/bot-credentials.ts` (BUAT BARU)

```typescript
import { z } from 'zod'

// Daftar key yang diizinkan (sesuai dengan yang ada di backend)
export const CREDENTIAL_KEYS = [
  'TELEGRAM_BOT_TOKEN',
  'ADMIN_BOT_TOKEN',
  'ADMIN_CHAT_ID',
  'GEMINI_API_KEY',
  'MIDTRANS_SERVER_KEY',
  'MIDTRANS_CLIENT_KEY',
] as const

export type CredentialKey = typeof CREDENTIAL_KEYS[number]

export const createCredentialSchema = z.object({
  key: z.enum(CREDENTIAL_KEYS, {
    errorMap: () => ({ message: 'Pilih credential key yang valid' }),
  }),
  value: z
    .string()
    .min(1, 'Nilai credential wajib diisi'),
})

export const updateCredentialSchema = z.object({
  value: z
    .string()
    .min(1, 'Nilai credential wajib diisi'),
})

export type CreateCredentialFormValues = z.infer<typeof createCredentialSchema>
export type UpdateCredentialFormValues = z.infer<typeof updateCredentialSchema>
```
