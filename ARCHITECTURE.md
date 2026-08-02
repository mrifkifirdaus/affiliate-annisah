# Arsitektur Aplikasi

## Alur publik

1. React mengambil profil, kategori, dan produk aktif dari API.
2. Pengunjung menekan kartu produk.
3. Browser membuka `GET /r/:slug` pada backend.
4. Backend menyimpan event klik dan menaikkan `clickCount`.
5. Backend mengirim HTTP 302 menuju link affiliate marketplace.

## Alur administrator

1. Administrator login melalui `POST /api/auth/login`.
2. Backend memverifikasi password bcrypt dan mengirim JWT.
3. Frontend menyimpan JWT di localStorage dan mengirim Bearer token pada request admin.
4. Middleware backend memverifikasi token sebelum mengizinkan CRUD.

## Endpoint utama

### Public

- `GET /api/health`
- `GET /api/public/store`
- `GET /api/public/categories`
- `GET /api/public/products`
- `GET /r/:slug`

### Auth

- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/change-password`

### Admin

- `GET|POST /api/admin/products`
- `GET|PUT|DELETE /api/admin/products/:id`
- `PATCH /api/admin/products/:id/status`
- `GET|POST /api/admin/categories`
- `PUT|DELETE /api/admin/categories/:id`
- `GET|PUT /api/admin/profile`
- `GET /api/admin/stats`
- `POST /api/admin/upload`

## Database

- `User`: akun administrator.
- `StoreProfile`: identitas storefront.
- `Category`: kategori produk.
- `Product`: katalog dan link affiliate.
- `ProductClick`: histori redirect untuk statistik.

## Keamanan yang sudah disertakan

- Password bcrypt.
- JWT kedaluwarsa.
- Helmet security headers.
- CORS allowlist.
- Rate limiter.
- Validasi request menggunakan Zod.
- Domain affiliate allowlist untuk mencegah open redirect.
- Batas ukuran dan tipe file upload.
- IP pengunjung disimpan sebagai hash, bukan nilai mentah.
