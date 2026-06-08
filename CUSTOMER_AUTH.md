Customer Auth — Penjelasan & Cara Penggunaan
Konsep
Fitur ini memungkinkan customer/reseller login ke portal mereka sendiri dengan email+password. Setiap tenant punya data customer terisolasi.

- Scoped per tenant — :userId di URL adalah ID tenant. Customer dari tenant A tidak bisa akses data tenant B.
- Token berbeda — JWT customer punya type: 'customer', terpisah dari JWT admin.
- Auto-link — Jika customer sebelumnya sudah order via Telegram (data ada di tabel Customer), registrasi akan mengaitkan akunnya dengan data yang sudah ada.

1. Register
   curl -X POST http://localhost:3000/api/portal/<TENANT_USER_ID>/register \
    -H "Content-Type: application/json" \
    -d '{
   "email": "budi@example.com",
   "password": "rahasia123",
   "name": "Budi Santoso",
   "phone": "08123456789"
   }'
   Response (201):
   {
   "success": true,
   "message": "Register success",
   "data": {
   "customer": {
   "id": "uuid-customer",
   "email": "budi@example.com",
   "name": "Budi Santoso",
   "phone": "08123456789",
   ...
   },
   "token": "eyJhbGciOiJIUzI1NiIs..."
   }
   }
2. Login
   curl -X POST http://localhost:3000/api/portal/<TENANT_USER_ID>/login \
    -H "Content-Type: application/json" \
    -d '{
   "email": "budi@example.com",
   "password": "rahasia123"
   }'
   Response (200):
   {
   "success": true,
   "message": "Login success",
   "data": {
   "customer": {
   "id": "uuid-customer",
   "email": "budi@example.com",
   "name": "Budi Santoso",
   ...
   },
   "token": "eyJhbGciOiJIUzI1NiIs..."
   }
   }
3. Get Profile
   curl http://localhost:3000/api/portal/<TENANT_USER_ID>/me \
    -H "Authorization: Bearer <CUSTOMER_JWT>"
   Response (200):
   {
   "success": true,
   "data": {
   "id": "uuid-customer",
   "email": "budi@example.com",
   "name": "Budi Santoso",
   "phone": "08123456789",
   "auth": {
   "email": "budi@example.com",
   "lastLoginAt": "2026-06-08T10:00:00.000Z",
   "isVerified": true
   }
   }
   }
4. Update Profile
   curl -X PATCH http://localhost:3000/api/portal/<TENANT_USER_ID>/me \
    -H "Authorization: Bearer <CUSTOMER_JWT>" \
    -H "Content-Type: application/json" \
    -d '{
   "name": "Budi Santoso Updated",
   "phone": "08123456788"
   }'
5. Change Password
   curl -X PATCH http://localhost:3000/api/portal/<TENANT_USER_ID>/me/password \
    -H "Authorization: Bearer <CUSTOMER_JWT>" \
    -H "Content-Type: application/json" \
    -d '{
   "oldPassword": "rahasia123",
   "newPassword": "rahasia456"
   }'
6. Get Orders
   curl "http://localhost:3000/api/portal/<TENANT_USER_ID>/me/orders?page=1&limit=10" \
    -H "Authorization: Bearer <CUSTOMER_JWT>"
   Response (200):
   {
   "success": true,
   "data": [
   {
   "id": "uuid-order",
   "orderId": "ORD-001",
   "source": "telegram",
   "status": "COMPLETED",
   "totalPrice": 50000,
   "paymentUrl": "https://payment.url",
   "paidAt": "2026-06-07T...",
   "createdAt": "2026-06-07T...",
   "orderItems": [
   {
   "id": "uuid-item",
   "quantity": 2,
   "product": {
   "id": "uuid-produk",
   "name": "Voucher 10GB",
   "emoji": "📱",
   "price": 25000
   }
   }
   ]
   }
   ],
   "metadata": {
   "total": 1,
   "page": 1,
   "limit": 10,
   "totalPages": 1
   }
   }
7. Get Order Detail
   curl http://localhost:3000/api/portal/<TENANT_USER_ID>/me/orders/<ORDER_ID> \
    -H "Authorization: Bearer <CUSTOMER_JWT>"
   Catatan Penting

- <TENANT_USER_ID> adalah ID user (tenant) yang punya bot — didapat dari dashboard. Contoh: cm7j2ry6200030hq4xvow7e0m.
- Token JWT berlaku 30 hari, tipe customer (tidak bisa dipakai di endpoint admin, dan sebaliknya).
- Endpoint /register dan /login public (tanpa auth). Sisanya pakai Authorization: Bearer <token>.
- phone bersifat opsional. Jika diisi, kolom hasWhatsapp di Customer akan otomatis true.
  ▣ Build · DeepSeek V4 Flash Free · 16.6s

* Thought: 4.9s
  Ini dia penjelasan lengkap + contoh penggunaan Customer Auth dari Bagian 2 PLANS.md:
  Arsitektur
  Platform (kamu)
  └── Tenant A (userId = uuid-a)
  └── Customer Portal → login → lihat order milik Tenant A saja
  └── Tenant B (userId = uuid-b)
  └── Customer Portal → login → lihat order milik Tenant B saja

- Semua endpoint di-prefix dengan /api/portal/:userId → :userId adalah tenant ID (scope multi-tenant).
- Customer login → dapat JWT dengan type: 'customer' (beda dengan JWT admin).
- JWT customer hanya bisa akses endpoint portal, tidak bisa akses dashboard admin.
  Endpoint
  Method Path Auth
  POST /api/portal/:userId/register Public
  POST /api/portal/:userId/login Public
  GET /api/portal/:userId/me Customer JWT
  PATCH /api/portal/:userId/me Customer JWT
  PATCH /api/portal/:userId/me/password Customer JWT
  GET /api/portal/:userId/me/orders Customer JWT
  GET /api/portal/:userId/me/orders/:orderId Customer JWT

1. Register Customer
   POST /api/portal/:userId/register
   curl -X POST http://localhost:3000/api/portal/<TENANT_USER_ID>/register \
    -H "Content-Type: application/json" \
    -d '{
   "email": "budi@email.com",
   "password": "rahasia123",
   "name": "Budi Santoso",
   "phone": "628123456789"
   }'
   Response (201):
   {
   "success": true,
   "message": "OK",
   "data": {
   "customer": {
   "id": "uuid-customer",
   "userId": "uuid-tenant",
   "email": "budi@email.com",
   "name": "Budi Santoso",
   "phone": "628123456789",
   "hasEmail": true,
   "hasWhatsapp": true,
   "source": "MANUAL",
   "createdAt": "2026-06-08T12:00:00.000Z"
   },
   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   }
   Jika customer dengan email tersebut sudah ada (dari order sebelumnya via Telegram), register akan update data customer yang sudah ada + buat akun auth baru.
2. Login Customer
   POST /api/portal/:userId/login
   curl -X POST http://localhost:3000/api/portal/<TENANT_USER_ID>/login \
    -H "Content-Type: application/json" \
    -d '{
   "email": "budi@email.com",
   "password": "rahasia123"
   }'
   Response (200):
   {
   "success": true,
   "message": "OK",
   "data": {
   "customer": {
   "id": "uuid-customer",
   "userId": "uuid-tenant",
   "email": "budi@email.com",
   "name": "Budi Santoso"
   },
   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   }
   Token expiry: 30 hari. Simpan token ini, gunakan untuk akses endpoint protected di bawah.
3. Get Profile
   GET /api/portal/:userId/me
   curl http://localhost:3000/api/portal/<TENANT_USER_ID>/me \
    -H "Authorization: Bearer <CUSTOMER_JWT>"
   Response (200):
   {
   "success": true,
   "message": "OK",
   "data": {
   "id": "uuid-customer",
   "userId": "uuid-tenant",
   "email": "budi@email.com",
   "name": "Budi Santoso",
   "phone": "628123456789",
   "createdAt": "2026-06-08T12:00:00.000Z",
   "auth": {
   "email": "budi@email.com",
   "lastLoginAt": "2026-06-08T12:30:00.000Z",
   "isVerified": true
   }
   }
   }
4. Update Profile
   PATCH /api/portal/:userId/me
   curl -X PATCH http://localhost:3000/api/portal/<TENANT_USER_ID>/me \
    -H "Authorization: Bearer <CUSTOMER_JWT>" \
    -H "Content-Type: application/json" \
    -d '{
   "name": "Budi Update",
   "phone": "628987654321"
   }'
   Response (200):
   {
   "success": true,
   "message": "OK",
   "data": {
   "id": "uuid-customer",
   "name": "Budi Update",
   "phone": "628987654321",
   "hasWhatsapp": true
   }
   }
5. Change Password
   PATCH /api/portal/:userId/me/password
   curl -X PATCH http://localhost:3000/api/portal/<TENANT_USER_ID>/me/password \
    -H "Authorization: Bearer <CUSTOMER_JWT>" \
    -H "Content-Type: application/json" \
    -d '{
   "oldPassword": "rahasia123",
   "newPassword": "rahasia456"
   }'
   Response (200):
   {
   "success": true,
   "message": "OK",
   "data": {
   "message": "Password berhasil diubah"
   }
   }
   Password baru minimal 6 karakter.
6. Get Orders (History)
   GET /api/portal/:userId/me/orders
   curl "http://localhost:3000/api/portal/<TENANT_USER_ID>/me/orders?page=1&limit=10" \
    -H "Authorization: Bearer <CUSTOMER_JWT>"
   Response (200):
   {
   "success": true,
   "message": "OK",
   "data": {
   "orders": [
   {
   "id": "uuid-order",
   "orderId": "ORD-001",
   "source": "TELEGRAM",
   "status": "COMPLETED",
   "totalPrice": 50000,
   "paymentUrl": "https://payment.example.com/pay/...",
   "paidAt": "2026-06-07T10:00:00.000Z",
   "createdAt": "2026-06-07T09:55:00.000Z",
   "orderItems": [
   {
   "id": "uuid-order-item",
   "quantity": 2,
   "price": 25000,
   "product": {
   "id": "uuid-product",
   "name": "Voucher 10GB",
   "emoji": "📱",
   "price": 25000
   }
   }
   ]
   }
   ],
   "total": 5,
   "page": 1,
   "limit": 10,
   "totalPages": 1
   }
   }
7. Get Order Detail
   GET /api/portal/:userId/me/orders/:orderId
   curl http://localhost:3000/api/portal/<TENANT_USER_ID>/me/orders/<ORDER_ID> \
    -H "Authorization: Bearer <CUSTOMER_JWT>"
   Response (200):
   {
   "success": true,
   "message": "OK",
   "data": {
   "id": "uuid-order",
   "orderId": "ORD-001",
   "source": "TELEGRAM",
   "status": "COMPLETED",
   "totalPrice": 50000,
   "paymentUrl": "https://payment.example.com/pay/...",
   "note": "Terima kasih",
   "paidAt": "2026-06-07T10:00:00.000Z",
   "createdAt": "2026-06-07T09:55:00.000Z",
   "updatedAt": "2026-06-07T10:00:00.000Z",
   "orderItems": [
   {
   "id": "uuid-order-item",
   "quantity": 2,
   "price": 25000,
   "product": {
   "id": "uuid-product",
   "name": "Voucher 10GB",
   "emoji": "📱",
   "price": 25000
   }
   }
   ]
   }
   }
   Error Response (contoh)
   Semua endpoint akan return error dalam format:
   {
   "success": false,
   "message": "Email atau password salah"
   }
   Dengan status code:

- 400 — validasi gagal (field wajib, password terlalu pendek, dll)
- 401 — email/password salah, token invalid/expired
- 403 — token valid tapi tenantId tidak cocok (Forbidden)
- 409 — email sudah terdaftar
  Flow Penggunaan

1. Register → dapat token customer
2. Login → dapat token customer
3. Simpan token di localStorage/cookie di frontend portal
4. Setiap request ke endpoint protected, kirim Authorization: Bearer <token>
5. Customer bisa lihat order miliknya sendiri saja — di-backend sudah di-filter by customerId
