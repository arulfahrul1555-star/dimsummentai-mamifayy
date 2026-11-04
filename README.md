# Dimsummentai Mamifayy 🥟🔥
Aplikasi CRM UMKM, Manajemen Pesanan & Katalog Pemesanan Mandiri Publik berbasis Next.js 14 App Router, TypeScript, Tailwind CSS, dan Supabase.

---

## 🌟 Fitur Utama
1. **Katalog Pemesanan Mandiri (Customer-Facing Web)**:
   - Akses via link di bio Instagram / WhatsApp.
   - Pilihan Menu: Dimsum Mentai (porsi isi 6, 8, 10, 16 pcs), Dimsum Ayam Original, Mix Platter Box, Pangsit Goreng Renyah.
   - Pilihan Topping: Original, Keju Mozzarella (+Rp 5.000), Keju Melting Torched (+Rp 6.000).
   - Pengiriman: Kurir Toko (ongkir dihitung adil oleh admin) atau Ambil di Outlet (Pickup).
   - Pembayaran: QRIS / Transfer Bank atau Bayar Tunai di Tempat (COD).
   - Live Order Tracking real-time bagi pelanggan.

2. **Panel Admin & Persetujuan Order (Admin Hub)**:
   - Login Akun Admin:
     - **Email:** `adminmamifay@gmail.com`
     - **Password:** `admin123`
   - **Persetujuan Order**: Notifikasi pesanan baru masuk, **input nominal ongkir kurir toko secara manual**, kalkulasi total tagihan otomatis, tombol [Setujui] atau [Tolak].
   - **Otomasi WhatsApp 1-Klik**: Sekali klik langsung membuka WhatsApp menuju pelanggan dengan format teks tagihan + rekening QRIS, notifikasi kurir berangkat, dan ucapan terima kasih/ulasan.

3. **Papan Operasional Dapur & Pengantaran**:
   - Status terbagi: `Antre Dapur` ➡️ `Sedang Ditorch 🔥` ➡️ `Diantar Kurir Toko 🛵 / Siap Pickup 🥡` ➡️ `Selesai ❤️`.
   - Toggle status pembayaran: Lunas (QRIS) atau Belum Bayar (COD).

4. **Database Pelanggan & CRM Retensi**:
   - Pencatatan otomatis nama, nomor WA, alamat, menu favorit, total transaksi, dan total rupiah belanja.
   - Tag otomatis: **Pelanggan Baru**, **Pelanggan Setia / VIP**, dan **Lama Tidak Order (>14 Hari)**.
   - Tombol 1-klik WhatsApp: **Sapa Promo Akhir Pekan** khusus pelanggan yang sudah lama tidak belanja.

5. **Laporan Finansial & Audit Kas Kurir**:
   - Rekap omzet harian & kumulatif.
   - **Audit Kas Kurir:** Memisahkan total uang tunai COD yang harus disetor kurir toko vs uang yang masuk rekening QRIS.
   - Statistik porsi terlaris (isi 4, 6, 8, 10, 16 pcs) dan menu favorit.

6. **Kasir Kilat (POS Input Manual)**:
   - Input langsung pesanan jika ada pembeli yang datang ke gerai fisik atau memesan via chat manual.

---

## 🗄️ Panduan Integrasi Supabase

Aplikasi mendukung arsitektur hybrid:
- Jika environment variables Supabase belum diset, aplikasi secara mulus menggunakan fallback local JSON (`data/db.json`).
- Jika environment variables Supabase diset, seluruh data pesanan, produk, pelanggan, dan pengaturan otomatis tersimpan di cloud database PostgreSQL Supabase.

### Langkah Setup Supabase:
1. Buat akun dan buat project baru di [Supabase Dashboard](https://supabase.com/dashboard).
2. Setelah project siap, buka menu **SQL Editor** di sidebar kiri.
3. Buka file [`supabase/schema.sql`](supabase/schema.sql) di proyek ini, copy seluruh isinya, paste ke SQL Editor Supabase, lalu klik **Run**.
   - Ini akan otomatis membuat tabel: `products`, `orders`, `order_items`, `customers`, `store_settings`, `otps`, menyetel index performa, mengaktifkan Row Level Security (RLS), dan mengisi data awal (seed).
   - *Catatan:* Skrip ini bersifat idempoten (`IF NOT EXISTS`, `DROP POLICY IF EXISTS`, `ON CONFLICT DO NOTHING`), sehingga aman dijalankan ulang kapan pun tanpa menyebabkan duplikasi atau error.
4. Buka menu **Project Settings** ➡️ **API**.
5. Salin 3 nilai berikut:
   - **Project URL**
   - **anon / public key**
   - **service_role key** (klik reveal key)
6. Masukkan ke file `.env.local` di komputer Anda untuk pengujian lokal:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
   ```

---

## 🐙 Panduan Push ke GitHub

Repositori Git lokal sudah diinisialisasi pada branch `main`. Anda dapat langsung menghubungkannya ke repositori GitHub baru:

### Langkah Menggunakan Git Terminal:
1. Buat repository baru di [GitHub](https://github.com/new) (misal: `dimsummentai-mamifayy`), jangan centang "Initialize with README" atau ".gitignore" (karena file proyek lokal sudah lengkap).
2. Buka terminal (PowerShell / Command Prompt) di folder proyek:
   ```powershell
   cd C:\Users\acer\.gemini\antigravity\scratch\dimsummentai-mamifayy
   ```
3. Commit dan push ke repository GitHub Anda:
   ```powershell
   git add .
   git commit -m "feat: integrasi Supabase PostgreSQL, deployment Vercel, dan manajemen pesanan UMKM Mamifayy"
   git branch -M main
   git remote add origin https://github.com/USERNAME-ANDA/dimsummentai-mamifayy.git
   git push -u origin main
   ```
*(Ganti `USERNAME-ANDA` dengan username akun GitHub Anda).*

---

## 🚀 Panduan Deployment ke Vercel

1. Buka [Vercel Dashboard](https://vercel.com/dashboard) dan login menggunakan akun GitHub Anda.
2. Klik tombol **Add New...** ➡️ **Project**.
3. Pilih repository `dimsummentai-mamifayy` yang baru saja Anda push ke GitHub, lalu klik **Import**.
4. Di bagian **Environment Variables**, tambahkan 3 variabel dari Supabase Anda:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://xxxxxx.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOi...`
   - `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOi...`
5. Klik **Deploy**.
6. Vercel akan otomatis melakukan build dan memberikan URL website aktif (misal `https://dimsummentai-mamifayy.vercel.app`) yang bisa diakses dosen dan pelanggan langsung!

---

## 💻 Menjalankan di Komputer Lokal

1. Buka terminal di folder proyek:
   ```powershell
   cd C:\Users\acer\.gemini\antigravity\scratch\dimsummentai-mamifayy
   ```

2. Jalankan server pengembangan (Development Server):
   ```powershell
   npm run dev
   ```

3. Buka di browser:
   - **Katalog Pemesanan Publik (Pelanggan):** `http://localhost:3000`
   - **Login Member (OTP):** Masukkan no. HP, kode 4-digit simulasi akan muncul otomatis di layar. Anda juga bisa menggunakan kode master demo: `1234` atau `8888`.
   - **Panel Admin & CRM:** `http://localhost:3000/admin` (Login: `adminmamifay@gmail.com` / `admin123`)
