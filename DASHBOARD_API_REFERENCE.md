# DASHBOARD_API_REFERENCE.md — Referensi API Lengkap

Base URL: `http://localhost:3000/api` (development)
Semua endpoint protected (kecuali auth) membutuhkan header: `Authorization: Bearer <token>`

---

## Auth

### POST `/api/auth/register`
Daftarkan user baru.

**Request body:**
```json
{
  "email": "owner@example.com",
  "password": "password123",
  "name": "Store Owner"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Register berhasil",
  "data": {
    "user": {
      "id": 1,
      "email": "owner@example.com",
      "name": "Store Owner",
      "plan": "FREE",
      "isActive": true
    },
    "token": "Bearer <jwt_token>"
  }
}
```

**Catatan:** Token yang disimpan ke cookies adalah value dari `data.token`.
Jika format token adalah `"Bearer <jwt>"`, strip prefix "Bearer " sebelum simpan,
atau simpan as-is dan tambahkan "Bearer " saat dipakai di Authorization header.

---

### POST `/api/auth/login`
**Request body:**
```json
{
  "email": "owner@example.com",
  "password": "password123"
}
```
**Response:** sama seperti register.

---

### GET `/api/auth/me`
Ambil data user yang sedang login.
**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "owner@example.com",
    "name": "Store Owner",
    "plan": "FREE",
    "isActive": true
  }
}
```

---

### POST `/api/auth/logout`
**Response 200:** `{ "success": true }`

---

## Bot Config

### GET `/api/bot-config`
Ambil konfigurasi bot milik user yang login.
**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "botMode": "polling",
    "aiEnabled": false,
    "geminiModel": "gemini-2.0-flash",
    "midtransIsProduction": false,
    "isActive": true,
    "createdAt": "2026-03-24T12:00:00.000Z",
    "updatedAt": "2026-03-24T12:00:00.000Z"
  }
}
```
Bisa return `null` jika belum ada config.

---

### POST `/api/bot-config`
Buat konfigurasi baru.
**Request body:**
```json
{
  "botMode": "polling",
  "aiEnabled": true,
  "geminiModel": "gemini-2.0-flash",
  "midtransIsProduction": false
}
```

---

### PUT `/api/bot-config/:id`
Update konfigurasi yang sudah ada. Semua field opsional.
**Request body:**
```json
{
  "aiEnabled": false,
  "botMode": "polling"
}
```

---

## Bot Credentials

### GET `/api/bot-credentials`
Ambil semua credentials (value TIDAK dikembalikan — hanya key).
**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "key": "TELEGRAM_BOT_TOKEN",
      "createdAt": "2026-03-24T12:00:00.000Z",
      "updatedAt": "2026-03-24T12:00:00.000Z"
    }
  ]
}
```

---

### POST `/api/bot-credentials`
Simpan credential baru (value dienkripsi di backend).
**Request body:**
```json
{
  "key": "TELEGRAM_BOT_TOKEN",
  "value": "123456:ABCDEF"
}
```

**Keys yang valid:**
- `TELEGRAM_BOT_TOKEN`
- `ADMIN_BOT_TOKEN`
- `ADMIN_CHAT_ID`
- `GEMINI_API_KEY`
- `MIDTRANS_SERVER_KEY`
- `MIDTRANS_CLIENT_KEY`

---

### PUT `/api/bot-credentials/:id`
Update nilai credential (key tidak bisa diubah).
**Request body:**
```json
{
  "value": "new-secret-value"
}
```

---

### DELETE `/api/bot-credentials/:id`
Hapus credential.
**Response 200:** `{ "success": true }`

---

## Products

### GET `/api/products`
Ambil semua produk milik user.
**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Nasi Goreng",
      "description": "Nasi goreng spesial",
      "price": 25000,
      "emoji": "🍳",
      "isAvailable": true,
      "createdAt": "2026-03-24T12:00:00.000Z",
      "updatedAt": "2026-03-24T12:00:00.000Z"
    }
  ]
}
```

---

### GET `/api/products/:id`
Ambil satu produk by ID.

---

### POST `/api/products`
Buat produk baru.
**Request body:**
```json
{
  "name": "Nasi Goreng",
  "description": "Nasi goreng spesial",
  "price": 25000,
  "emoji": "🍳"
}
```

---

### PUT `/api/products/:id`
Update produk. Semua field opsional.
**Request body:**
```json
{
  "price": 27000,
  "isAvailable": true
}
```

---

### DELETE `/api/products/:id`
Soft delete — set `isAvailable = false`, produk tidak muncul di bot.
**Response 200:** `{ "success": true }`

---

## Orders

### GET `/api/orders?limit=50`
Ambil list order milik user. Query param `limit` opsional (default 50).
**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "orderId": "ORD-20260324-1234",
      "telegramId": "123456789",
      "username": "johndoe",
      "firstName": "John",
      "totalPrice": 80000,
      "status": "COMPLETED",
      "paymentUrl": "https://app.sandbox.midtrans.com/snap/...",
      "paidAt": "2026-03-24T12:05:00.000Z",
      "createdAt": "2026-03-24T12:00:00.000Z",
      "updatedAt": "2026-03-24T12:05:00.000Z",
      "orderItems": [
        {
          "id": 1,
          "productId": 1,
          "quantity": 2,
          "unitPrice": 40000,
          "product": {
            "id": 1,
            "name": "Ayam Bakar",
            "emoji": "🍗"
          }
        }
      ]
    }
  ]
}
```

---

### GET `/api/orders/:id`
Ambil satu order by ID (integer, bukan orderId string).

---

## Status Order

| Status | Arti |
|---|---|
| `PENDING` | Baru dibuat |
| `PAYMENT_PENDING` | Menunggu pembayaran |
| `CONFIRMED` | Dikonfirmasi (manual) |
| `PROCESSING` | Sedang diproses |
| `COMPLETED` | Pembayaran diterima |
| `CANCELLED` | Dibatalkan user |
| `PAYMENT_FAILED` | Pembayaran gagal/expired |

---

## Error Response

Semua error menggunakan format:
```json
{
  "success": false,
  "message": "Pesan error"
}
```

HTTP status yang umum:
- `400` — Request body tidak valid
- `401` — Token tidak valid atau expired
- `403` — Tidak punya akses ke resource ini
- `404` — Resource tidak ditemukan
- `500` — Internal server error
