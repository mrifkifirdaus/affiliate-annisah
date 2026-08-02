# Checklist Sebelum Online

- Ganti `JWT_SECRET` dan `IP_HASH_SALT` dengan nilai acak yang kuat.
- Ganti password administrator melalui menu **Akun Admin**.
- Atur `CORS_ORIGIN` sesuai domain frontend production.
- Atur `PUBLIC_API_URL`, `VITE_API_URL`, dan `VITE_API_ORIGIN` sesuai domain API.
- Gunakan PostgreSQL dengan backup otomatis.
- Gunakan HTTPS untuk frontend dan API.
- Ganti upload lokal dengan Cloudinary/S3 jika server menggunakan ephemeral filesystem.
- Pastikan `AFFILIATE_ALLOWED_HOSTS` hanya berisi domain yang memang digunakan.
- Atur rewrite SPA agar semua route frontend mengarah ke `index.html`.
- Jalankan `npm run build` dan `npm run db:deploy` sebelum start production.
- Simpan file `.env` di server dan jangan commit ke Git.
