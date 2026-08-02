# Affiliate Storefront — Full Stack Production Starter

Aplikasi katalog affiliate lengkap dengan halaman publik, administrator, database PostgreSQL, login JWT, upload gambar, redirect affiliate yang tercatat, kategori, profil toko, dan statistik klik.

## Stack

- Frontend: React, TypeScript, Vite, React Router, Tailwind CSS, Framer Motion
- Backend: Node.js, Express, TypeScript, Prisma ORM
- Database: PostgreSQL
- Authentication: JWT + bcrypt
- Upload: local storage siap pakai; dapat diganti Cloudinary/S3

## Fitur

### Halaman publik

- Profil affiliate dan sosial media
- Search, kategori, dan filter marketplace
- Produk unggulan
- Responsive mobile/desktop
- Redirect aman ke Shopee, Tokopedia, atau TikTok
- Pencatatan klik produk

### Administrator

- Login administrator
- Dashboard statistik
- Tambah, edit, aktif/nonaktif, urutkan, dan hapus produk
- Upload gambar produk
- Kelola kategori
- Edit profil storefront
- Ganti password administrator
- Statistik klik harian dan produk teratas

## Menjalankan di Windows

### 1. Persyaratan

- Node.js 20 atau lebih baru
- PostgreSQL 14+ atau Docker Desktop

### 2. Ekstrak dan buka folder

```powershell
cd D:\Rifki\Codes\affiliate-storefront-production
```

### 3. Siapkan environment

```powershell
Copy-Item apps\api\.env.example apps\api\.env
Copy-Item apps\web\.env.example apps\web\.env
```

Ganti `JWT_SECRET` di `apps/api/.env` dengan string acak minimal 32 karakter.

### 4. Jalankan PostgreSQL

Dengan Docker Desktop:

```powershell
docker compose up -d
```

Tanpa Docker, buat database PostgreSQL sendiri lalu sesuaikan `DATABASE_URL`.

### 5. Instal dan siapkan database

```powershell
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
```

### 6. Jalankan aplikasi

```powershell
npm run dev
```

Buka:

- Storefront: http://localhost:5173
- Admin: http://localhost:5173/admin/login
- API health: http://localhost:4000/api/health

Akun awal dari seed:

- Email: `admin@affiliate.local`
- Password: `ChangeMe123!`

**Segera ganti password melalui menu Akun Admin sebelum dipakai online.**

## Struktur

```text
apps/
├── api/                Express + Prisma + PostgreSQL
│   ├── prisma/
│   ├── uploads/
│   └── src/
└── web/                React + Vite
    └── src/
```

## Deployment

1. Build frontend dengan `npm run build -w @affiliate/web`.
2. Build backend dengan `npm run build -w @affiliate/api`.
3. Atur environment production.
4. Jalankan migration dengan `npm run db:deploy`.
5. Jalankan API dengan `npm run start:api`.
6. Host `apps/web/dist` di Vercel, Cloudflare Pages, Nginx, atau static hosting lainnya. Aktifkan SPA rewrite ke `index.html` untuk route `/admin/*`.

Untuk produksi, upload lokal sebaiknya diganti object storage seperti Cloudinary/S3 agar file tidak hilang ketika server diredeploy.

## Setup otomatis Windows

Untuk setup otomatis di Windows, Anda dapat menjalankan:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\setup-windows.ps1
.\start-windows.ps1
```

Lihat `ARCHITECTURE.md` untuk detail endpoint, alur redirect, database, dan keamanan. Gunakan `PRODUCTION-CHECKLIST.md` sebelum aplikasi dipublikasikan.
