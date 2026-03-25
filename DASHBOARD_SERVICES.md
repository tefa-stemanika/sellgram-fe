# DASHBOARD_SERVICES.md — Semua Service Function

Semua service adalah **pure async function** — tidak ada React state di sini.
Menerima `token: string` sebagai parameter pertama untuk Authorization header.
Response dari API selalu berbentuk `{ success: boolean, data: T, message?: string }`.

Base URL: `process.env.NEXT_PUBLIC_API_URL` (default: `http://localhost:3000/api`)

---

## `services/fetcher.ts` (sudah ada — pastikan ada helper ini)
anda perbaiki langi fungsi fetcher.ts yang ada pada project saya ini agar dapat reusable!

---

## `services/user/index.ts` (sudah ada — pastikan ada fungsi login & register)

```typescript
// services/user/index.ts
import { fetcher } from '../fetcher'

export type User = {
  id: number
  email: string
  name: string
  plan: 'FREE' | 'STARTER' | 'PRO'
  isActive: boolean
}

export type AuthResponse = {
  success: boolean
  message: string
  data: {
    user: User
    token: string
  }
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return fetcher<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  return fetcher<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
}

export async function getCurrentUser(token: string): Promise<User> {
  const res = await fetcher<{ success: boolean; data: User }>('/auth/me', {
    token,
  })
  return res.data
}

export async function logout(token: string): Promise<void> {
  await fetcher('/auth/logout', {
    method: 'POST',
    token,
  })
}
```

---

## `services/products/index.ts` (BUAT BARU)

```typescript
// services/products/index.ts
import { fetcher } from '../fetcher'

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
  const res = await fetcher<{ success: boolean; data: Product[] }>('/products', {
    token,
  })
  return res.data
}

export async function getProductById(token: string, id: number): Promise<Product> {
  const res = await fetcher<{ success: boolean; data: Product }>(`/products/${id}`, {
    token,
  })
  return res.data
}

export async function createProduct(
  token: string,
  payload: CreateProductPayload
): Promise<Product> {
  const res = await fetcher<{ success: boolean; data: Product }>('/products', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  })
  return res.data
}

export async function updateProduct(
  token: string,
  id: number,
  payload: UpdateProductPayload
): Promise<Product> {
  const res = await fetcher<{ success: boolean; data: Product }>(`/products/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  })
  return res.data
}

export async function deleteProduct(token: string, id: number): Promise<void> {
  await fetcher(`/products/${id}`, {
    method: 'DELETE',
    token,
  })
}
```

---

## `services/bot-config/index.ts` (BUAT BARU)

```typescript
// services/bot-config/index.ts
import { fetcher } from '../fetcher'

export type BotConfig = {
  id: number
  botMode: 'polling' | 'webhook'
  aiEnabled: boolean
  geminiModel: string
  midtransIsProduction: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type BotConfigPayload = {
  botMode?: 'polling' | 'webhook'
  aiEnabled?: boolean
  geminiModel?: string
  midtransIsProduction?: boolean
}

export async function getBotConfig(token: string): Promise<BotConfig | null> {
  try {
    const res = await fetcher<{ success: boolean; data: BotConfig }>('/bot-config', {
      token,
    })
    return res.data
  } catch {
    return null
  }
}

export async function createBotConfig(
  token: string,
  payload: BotConfigPayload
): Promise<BotConfig> {
  const res = await fetcher<{ success: boolean; data: BotConfig }>('/bot-config', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  })
  return res.data
}

export async function updateBotConfig(
  token: string,
  id: number,
  payload: BotConfigPayload
): Promise<BotConfig> {
  const res = await fetcher<{ success: boolean; data: BotConfig }>(`/bot-config/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  })
  return res.data
}
```

---

## `services/bot-credentials/index.ts` (BUAT BARU)

```typescript
// services/bot-credentials/index.ts
import { fetcher } from '../fetcher'

export type BotCredential = {
  id: number
  key: string
  // value TIDAK dikembalikan dari API untuk keamanan
  // hanya key yang tampil di list
  createdAt: string
  updatedAt: string
}

export type CreateCredentialPayload = {
  key: string
  value: string
}

export type UpdateCredentialPayload = {
  value: string
}

export async function getBotCredentials(token: string): Promise<BotCredential[]> {
  const res = await fetcher<{ success: boolean; data: BotCredential[] }>(
    '/bot-credentials',
    { token }
  )
  return res.data
}

export async function createBotCredential(
  token: string,
  payload: CreateCredentialPayload
): Promise<BotCredential> {
  const res = await fetcher<{ success: boolean; data: BotCredential }>(
    '/bot-credentials',
    {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    }
  )
  return res.data
}

export async function updateBotCredential(
  token: string,
  id: number,
  payload: UpdateCredentialPayload
): Promise<BotCredential> {
  const res = await fetcher<{ success: boolean; data: BotCredential }>(
    `/bot-credentials/${id}`,
    {
      method: 'PUT',
      token,
      body: JSON.stringify(payload),
    }
  )
  return res.data
}

export async function deleteBotCredential(
  token: string,
  id: number
): Promise<void> {
  await fetcher(`/bot-credentials/${id}`, {
    method: 'DELETE',
    token,
  })
}
```

---

## `services/orders/index.ts` (BUAT BARU)

```typescript
// services/orders/index.ts
import { fetcher } from '../fetcher'

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_FAILED'

export type OrderItem = {
  id: number
  productId: number
  quantity: number
  unitPrice: number
  product: {
    id: number
    name: string
    emoji: string
  }
}

export type Order = {
  id: number
  orderId: string
  telegramId: string
  username: string | null
  firstName: string | null
  totalPrice: number
  status: OrderStatus
  paymentUrl: string | null
  paidAt: string | null
  createdAt: string
  updatedAt: string
  orderItems: OrderItem[]
}

export async function getOrders(
  token: string,
  limit = 50
): Promise<Order[]> {
  const res = await fetcher<{ success: boolean; data: Order[] }>(
    `/orders?limit=${limit}`,
    { token }
  )
  return res.data
}

export async function getOrderById(
  token: string,
  id: number
): Promise<Order> {
  const res = await fetcher<{ success: boolean; data: Order }>(
    `/orders/${id}`,
    { token }
  )
  return res.data
}
```
