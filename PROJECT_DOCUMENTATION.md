# 🛍️ RENSTORE — Dokumentasi Komprehensif Sistem & Arsitektur E-Commerce

Dokumen resmi ini menjelaskan seluruh aspek teknis, tumpukan teknologi (tech stack), arsitektur sistem, serta katalog lengkap seluruh fitur yang ada pada aplikasi E-Commerce Fullstack **RENSTORE**.

---

## 📌 1. Tentang Proyek (Project Overview)

**RENSTORE** adalah platform e-commerce modern berskala penuh (*end-to-end fullstack web application*) yang dibangun untuk menyediakan pengalaman belanja produk gadget, fashion, dan lifestyle kelas atas (*premium lifestyle*). 

Sistem ini mengintegrasikan portal belanja pelanggan (*Customer Storefront*) dan pusat kendali administrasi (*Admin Management Console*) secara *real-time*, aman, dan responsif di berbagai perangkat (*desktop, tablet, mobile*).

### 🎯 Prinsip Utama Perancangan:
1. **Desain Bersih & Minimalis**: Menggunakan palet warna solid, tipografi modern (*Plus Jakarta Sans*), serta menghilangkan gradasi berlebihan untuk kenyamanan visual.
2. **Performa Tinggi & Tanpa Delay**: Animasi berbasis *GPU-accelerated CSS transform* yang instan dan responsif.
3. **Keandalan Transaksi (Data Integrity)**: Checkout dengan *atomic database transaction* untuk mencegah *race condition* dan selisih stok.
4. **Pembaruan Data Real-Time**: Sinkronisasi data statistik admin dan pesanan pelanggan tanpa perlu me-refresh halaman.

---

## 🏗️ 2. Tumpukan Teknologi (Technology Stack)

```
┌────────────────────────────────────────────────────────────────────────┐
│                          ARSITEKTUR RENSTORE                          │
└────────────────────────────────────────────────────────────────────────┘
                    
       ┌────────────────────────┐         ┌────────────────────────┐
       │   Frontend (Client)    │         │    Backend (Server)    │
       │  React 19 + TypeScript │ ◄─────► │  Laravel 12 (PHP 8.5)  │
       │    Vite + Tailwind     │  REST   │    Laravel Sanctum     │
       └───────────┬────────────┘  JSON   └───────────┬────────────┘
                   │                                  │
                   ▼                                  ▼
       ┌────────────────────────┐         ┌────────────────────────┐
       │     State & UX/UI      │         │   Database & Payment   │
       │ Context API + Motion   │         │ PostgreSQL 17 + Xendit │
       └────────────────────────┘         └────────────────────────┘
```

### 💻 A. Frontend Technology Stack
- **React 19**: Library UI deklaratif modern berbasis komponen.
- **TypeScript**: Pengecekan tipe statis ketat untuk mencegah *runtime bugs*.
- **Vite**: Build tool dan dev server berkecepatan tinggi dengan Hot Module Replacement (HMR).
- **Tailwind CSS**: Utility-first CSS framework untuk styling responsif dan modular.
- **Framer Motion**: Library animasi deklaratif untuk transisi halaman dan modal.
- **Lucide React**: Kumpulan ikon SVG modern dan konsisten.
- **Axios**: HTTP client dengan interceptor token Sanctum otomatis.
- **React Router DOM v6**: Manajemen perutean client-side dengan *route guards* multi-role.
- **Canvas-Confetti**: Efek partikel konfeti saat klaim voucher eksklusif.

### ⚙️ B. Backend Technology Stack
- **Laravel 12 (PHP 8.5+)**: Framework backend PHP modern berarsitektur MVC dan RESTful API.
- **Laravel Sanctum**: Sistem autentikasi berbasis token API yang aman dan ringan.
- **PostgreSQL 17**: Sistem manajemen basis data relasional (RDBMS) yang tangguh dan terindeks.
- **Eloquent ORM**: Pemetaan objek-relasional dengan relasi database lengkap (*One-to-Many, Has-Many-Through*).
- **Database Transactions (`DB::transaction`)**: Eksekusi transaksi atomik saat checkout dan pemulihan stok.
- **Carbon**: Library manipulasi tanggal dan waktu untuk analitik per jam, harian, bulanan, dan tahunan.

### 💳 C. Integrasi Pembayaran & Keamanan
- **Xendit Payment Gateway Simulator**: Simulasi Dynamic QRIS dan pembayaran instan terverifikasi.
- **Webhook Automation**: Endpoint penerima status pembayaran webhook dengan simulasi instan.
- **Role-Based Access Control (RBAC)**: Middleware proteksi hak akses `admin` dan `customer`.
- **Password Hashing (Bcrypt/Argon2)**: Keamanan enkripsi kata sandi pengguna.

---

## 🌟 3. Katalog Lengkap Fitur Aplikasi

Berikut adalah dokumentasi seluruh fitur dari fitur utama (*flagship*) hingga fitur mikro (*micro-features*):

---

### 👑 A. Fitur Unggulan (Flagship Features)

#### 1. 📊 Real-Time Admin Dashboard Analytics
- **Metrik Utama (Overview KPI Cards)**:
  - Total Pendapatan (*Ecommerce Revenue*), Total Volume Order, Rata-rata Nilai Pesanan (*AOV*), Total Pelanggan Aktif, dan Total Produk Aktif.
- **Pilihan Rentang Waktu (Time Filters)**:
  - **Hari Ini (Today)**: Breakdown penjualan real-time per slot 4 jam (00:00–04:00, 04:00–08:00, dst).
  - **7 Hari Terakhir**: Grafik performa harian dari 6 hari lalu hingga hari ini.
  - **Bulanan**: Analisis 6 bulan ke belakang.
  - **Tahunan**: Perbandingan omset 3 tahun terakhir.
- **Visualisasi Interaktif SVG Line Chart**:
  - Grafik dual-metric (Penjualan Rupiah & Jumlah Pesanan).
  - Titik hover responsif dengan tooltip harga dan kuantitas.
  - Ringkasan otomatis: Total Omset Periode, Rata-rata Nilai Tiket, Tingkat Sukses Pesanan (%), dan Periode Penjualan Tertinggi (*Peak Period*).
- **Auto-Sync & Live Polling**:
  - Sinkronisasi data otomatis setiap 5 detik (dapat diaktifkan/dinonaktifkan).
  - Deteksi fokus jendela dan perpindahan tab browser.

#### 2. 🚚 Dynamic Shipment Tracker (Pelacak Pengiriman Real-Time)
- **Visual Multi-Step Progress Tracker**: Menampilkan 4 tahap pengiriman (Pesanan Dikonfirmasi, Diproses di Gudang, Dalam Perjalanan Kurir, dan Pesanan Sampai).
- **Dukungan Multi-Ekspedisi**: JNE Express, SiCepat, J&T Express, Pos Indonesia, dan GoSend/GrabExpress.
- **Estimasi Tiba & Live Status Log**: Log riwayat transit dengan waktu, lokasi, dan kurir bertugas.
- **Aksi Cepat**: Tombol salin nomor resi (*airway bill*) dan simulasi pembaruan kurir.

#### 3. 👥 Manajemen Akun & Pengguna Admin (`/admin/users`)
- **Tabel Seluruh Akun**: Menampilkan nama, email, avatar, kontak, role badge, total pesanan, total belanja (Rp), dan tanggal pendaftaran.
- **4 Kartu Ringkasan Pengguna**: Total Akun Terdaftar, Pelanggan Aktif, Administrator, dan Pendaftaran Hari Ini.
- **Pencarian & Filter Role**: Cari akun berdasarkan nama/email/HP dan filter *Semua / Customer / Admin*.
- **Aksi Khusus Admin**:
  - **Reset Password Pengguna**: Modal instan bagi admin untuk mengatur kata sandi baru akun pelanggan.
  - **Ubah Role Pengguna**: Mengalihkan role antara Customer dan Administrator.
  - **Hapus Akun**: Penghapusan akun dengan proteksi anti self-deletion.

#### 4. 🎟️ Engine Voucher Eksklusif & Batasan 1 Email = 1 Klaim
- **Verifikasi Status Member**: Validasi instan ke database untuk membedakan member terdaftar dan pengunjung umum.
- **Aturan 1 Klaim per Email**:
  - Setiap email yang terdaftar hanya dapat mengklaim voucher diskon VIP 50% (`DISKON50`) sebanyak 1 kali.
  - Jika memasukkan email yang sama untuk kedua kalinya, sistem menolak dan memunculkan modal *VOUCHER SUDAH PERNAH DIKLAIM*.
  - Jika memasukkan email baru yang terdaftar, sistem akan memberikan voucher baru untuk akun tersebut.
  - Jika memasukkan email yang belum terdaftar, sistem mengarahkan user ke halaman registrasi akun.

#### 5. 🔑 Sistem Lupa Password & Kode Pemulihan 6 Digit (`/forgot-password`)
- **Langkah 1 (Verifikasi Email)**: Pengecekan keberadaan email di database pengguna.
- **Langkah 2 (Kode Pemulihan OTP 6 Digit)**:
  - Pembuatan kode numerik 6 digit unik yang disimpan di tabel `password_reset_tokens` dengan masa berlaku 15 menit.
  - Banner notifikasi kode dengan fitur *1-Klik Salin* dan auto-fill.
- **Langkah 3 (Pengaturan Password Baru)**: Input password baru dengan validasi konfirmasi dan minimal 8 karakter.
- **Langkah 4 (Selesai)**: Enkripsi password baru ke database dan tombol langsung menuju login.

#### 6. 🌐 Sistem Multi-Bahasa (Bilingual: ID & EN)
- Pengalihan instan antara **Bahasa Indonesia** dan **English** pada seluruh teks, header, tombol, navigasi, dan pesan notifikasi menggunakan `LocaleContext`.

---

### 🛍️ B. Fitur Belanja & Transaksi (Storefront & Customer Features)

#### 7. 🛒 Katalog Produk & Filter Dinamis (`/products`)
- **Pencarian Cepat**: Filter pencarian produk berdasarkan nama dan deskripsi secara *real-time*.
- **Filter Kategori**: Navigasi kategori dinamis (*Smartphone, Laptop, Audio, Wearables, dll*).
- **Sortir Fleksibel**: Termurah, Termahal, Terbaru, dan Terpopuler.
- **Kartu Produk Interaktif**: Gambar HD, label diskon, rating bintang, harga Rupiah, dan tombol *+ Keranjang*.

#### 8. ⚡ Flash Sale Page (`/flash-sale`)
- **Live Countdown Timer**: Penghitung mundur waktu berakhirnya diskon kilat.
- **Harga Promo Spesial**: Tampilan harga coret dan persentase potongan harga.

#### 9. 🔍 Halaman Detail Produk (`/products/:slug`)
- Galeri foto produk, status ketersediaan stok, deskripsi lengkap, pemilihan kuantitas, dan rekomendasi produk terkait.

#### 10. 🧺 Keranjang Belanja Dinamis (`/cart`)
- Penambahan/pengurangan kuantitas dengan validasi stok maksimal.
- Penghapusan item satuan atau pembersihan seluruh keranjang (*Clear Cart*).
- Kalkulasi otomatis Subtotal, Pajak/Admin, dan Total Pembayaran.

#### 11. 💳 Checkout & Integrasi Voucher Promo (`/checkout`)
- Form data penerima dan alamat pengiriman lengkap.
- Pemilihan metode pengiriman (*Reguler, Kilat Express, Kargo*).
- **Validasi Kupon Diskon**: Input kode promo (`DISKON50`, `RENSTORE2026`) dengan kalkulasi potongan harga otomatis sebelum checkout.
- Pemilihan metode pembayaran (Xendit QRIS, Transfer Bank BCA/Mandiri/BRI, E-Wallet GoPay/OVO/ShopeePay).
- **Simulasi Pembayaran Instan**: Tombol simulasi bayar QRIS untuk verifikasi status pesanan secara langsung.

#### 12. 📜 Riwayat Pesanan & Invoice Digital (`/orders`)
- Daftar seluruh pesanan milik akun yang sedang login.
- Status pesanan: *Menunggu Pembayaran, Diproses, Dikirim, Selesai, Dibatalkan*.
- Modal rincian pesanan dan cetak invoice digital.

#### 13. 👤 Manajemen Profil Pelanggan (`/profile`)
- Pembaruan nama lengkap, email, nomor HP, dan alamat default.
- Unggah foto profil (Avatar) dengan preview instan.
- Ganti password akun pelanggan.

#### 14. 📰 Artikel & Blog Lifestyle (`/blogs`)
- Halaman artikel tips teknologi, review gadget, dan panduan belanja dengan halaman detail artikel (`/blogs/:slug`).

---

### 🛡️ C. Fitur Portal Administrasi (Admin Console)

#### 15. 📦 Manajemen Produk (`/admin/products`)
- Tambah, edit, dan hapus produk.
- Pengaturan stok, harga, status aktif/non-aktif, kategori, dan URL/unggah gambar.
- **Quick Restock Alert**: Tombol instan tambah stok pada produk yang menipis (<= 5 unit).

#### 16. 🗂️ Manajemen Kategori (`/admin/categories`)
- Tambah, edit, dan hapus kategori produk.
- Otomatisasi pembuatan slug URL unik.

#### 17. 📑 Manajemen Status Pesanan (`/admin/orders`)
- Pemantauan seluruh pesanan dari semua customer.
- Pengubahan status pesanan: `pending` ➔ `processing` ➔ `completed` / `cancelled`.
- **Auto-Restoration Stok**: Pengembalian stok produk secara otomatis saat admin membatalkan pesanan.

---

### 🔍 D. Fitur Mikro & Detail UX (Micro-Features & Polish)

| No | Fitur Mikro | Deskripsi & Lokasi |
|---|---|---|
| 1 | **GPU-Accelerated Card Hover** | Animasi hover instan tanpa delay pada kartu keunggulan di footer dengan `transform-gpu`. |
| 2 | **Alert Email Belum Terdaftar** | Banner error login dengan tombol otomatis *Daftar Akun Sekarang* yang meneruskan email. |
| 3 | **Alert Email Duplikat** | Banner error register jika email sudah ada dengan tombol langsung *Masuk ke Akun*. |
| 4 | **Reactive Cart Counter** | Badge jumlah keranjang pada navbar yang terupdate secara reaktif saat ada produk baru. |
| 5 | **Collapsible Sidebar Admin** | Sidebar admin desktop yang dapat diciutkan (*collapsed*) dengan status tersimpan di `localStorage`. |
| 6 | **Mobile Navigation Drawer** | Menu drawer responsif untuk tampilan mobile dengan overlay gelap dan blur. |
| 7 | **Auto Scroll to Top** | Otomatis mengembalikan posisi scroll ke bagian paling atas layar setiap kali berganti halaman. |
| 8 | **Quick 1-Click Copy** | Tombol salin kode voucher, resi kurir, dan nomor pesanan dengan feedback visual *"Tersalin!"*. |
| 9 | **Tab Synchronization Event** | Sinkronisasi data order antar-tab browser menggunakan *storage event listeners*. |
| 10 | **Skeleton Loading States** | Efek shimmer loading saat data produk, order, atau dashboard sedang dimuat. |

---

## 📁 4. Struktur Direktori Proyek

```
renstore-project/
├── backend/                         # Backend Laravel 12 API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── AdminUserController.php   # Manajemen Akun Pengguna Admin
│   │   │   ├── AuthController.php        # Auth, Register, Login, Forgot Pwd, Voucher
│   │   │   ├── CartController.php        # Keranjang Belanja Customer
│   │   │   ├── CategoryController.php    # CRUD Kategori Produk
│   │   │   ├── DashboardController.php   # Analitik Realtime Dashboard Admin
│   │   │   ├── OrderController.php       # Checkout & Manajemen Pesanan
│   │   │   ├── ProductController.php     # CRUD Katalog Produk
│   │   │   └── WebhookController.php     # Simulasi & Webhook Pembayaran QRIS
│   │   ├── Models/                      # Model Eloquent (User, Product, Order, dll)
│   │   └── Middleware/                  # Middleware CheckRole
│   ├── database/
│   │   ├── migrations/                  # Skema Database PostgreSQL
│   │   └── seeders/                     # Seeder Data Awal (User, Produk, Kategori)
│   └── routes/
│       └── api.php                      # Definisi Seluruh Rute API RESTful
│
├── frontend/                        # Frontend React 19 + TypeScript + Vite
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.ts                 # Axios Instance dengan Token Interceptor
│   │   ├── components/                  # Komponen Reusable
│   │   │   ├── admin/
│   │   │   │   └── RealtimeLineChart.tsx # Komponen Grafik SVG Interaktif Admin
│   │   │   ├── AdminRoute.tsx           # Route Guard Admin
│   │   │   ├── Footer.tsx               # Footer dengan Klaim Voucher & Keunggulan
│   │   │   ├── Navbar.tsx               # Header Navigasi, Search, & Selector Bahasa
│   │   │   ├── ProductCard.tsx          # Kartu Produk Responsif
│   │   │   ├── ProtectedRoute.tsx       # Route Guard Customer
│   │   │   └── ShipmentTracker.tsx      # Komponen Pelacak Resi Pengiriman Live
│   │   ├── contexts/                    # State Management Global
│   │   │   ├── AuthContext.tsx          # State Autentikasi User & Role
│   │   │   ├── CartContext.tsx          # State Keranjang Belanja
│   │   │   └── LocaleContext.tsx        # State Bahasa (ID / EN)
│   │   ├── layouts/                     # Template Layout
│   │   │   ├── AdminLayout.tsx          # Layout Khusus Portal Admin
│   │   │   └── MainLayout.tsx           # Layout Publik & Customer
│   │   ├── pages/                       # Halaman Aplikasi
│   │   │   ├── admin/
│   │   │   │   ├── AdminCategoriesPage.tsx # Kelola Kategori
│   │   │   │   ├── AdminDashboardPage.tsx  # Dashboard Utama & Grafik
│   │   │   │   ├── AdminOrdersPage.tsx     # Kelola Pesanan & Status
│   │   │   │   ├── AdminProductsPage.tsx   # Kelola Produk & Stok
│   │   │   │   └── AdminUsersPage.tsx      # Kelola Akun & Pengguna
│   │   │   ├── CatalogPage.tsx          # Katalog & Filter Produk
│   │   │   ├── CheckoutPage.tsx         # Checkout, Kupon, & Pembayaran
│   │   │   ├── ForgotPasswordPage.tsx   # Pemulihan Password (OTP 6 Digit)
│   │   │   ├── HomePage.tsx             # Beranda Utama
│   │   │   ├── LoginPage.tsx            # Masuk Akun
│   │   │   ├── OrdersPage.tsx           # Riwayat Pesanan Customer
│   │   │   ├── ProfilePage.tsx          # Pengaturan Profil
│   │   │   └── RegisterPage.tsx         # Daftar Akun Baru
│   │   ├── routes/
│   │   │   └── AppRoutes.tsx            # Konfigurasi Seluruh URL & Rute
│   │   └── types/                       # TypeScript Interfaces & Types
│   └── index.html                       # Entry HTML dengan Font Plus Jakarta Sans
│
└── PROJECT_DOCUMENTATION.md             # File Dokumentasi Resmi Ini
```

---

## 🌐 5. Ringkasan Endpoint RESTful API

| Method | Endpoint | Hak Akses | Deskripsi |
|---|---|---|---|
| `POST` | `/api/auth/register` | Publik | Mendaftarkan akun customer baru |
| `POST` | `/api/auth/login` | Publik | Autentikasi akun & penerbitan token |
| `POST` | `/api/auth/forgot-password` | Publik | Meminta kode pemulihan 6 digit |
| `POST` | `/api/auth/reset-password` | Publik | Mengatur kata sandi baru dengan kode OTP |
| `POST` | `/api/newsletter/claim-voucher` | Publik | Klaim voucher diskon eksklusif (1x per email) |
| `GET` | `/api/auth/profile` | Auth | Mengambil profil user yang sedang login |
| `PUT/POST` | `/api/auth/profile` | Auth | Memperbarui profil & foto avatar |
| `POST` | `/api/auth/logout` | Auth | Mengakhiri sesi & mencabut token API |
| `GET` | `/api/categories` | Publik | Mengambil seluruh kategori produk |
| `GET` | `/api/products` | Publik | Mengambil katalog produk dengan filter & sortir |
| `GET` | `/api/products/{slug}` | Publik | Mengambil detail spesifik satu produk |
| `GET` | `/api/cart` | Auth | Mengambil item keranjang belanja |
| `POST` | `/api/cart` | Auth | Menambahkan produk ke keranjang |
| `PUT` | `/api/cart/{id}` | Auth | Mengubah kuantitas item di keranjang |
| `DELETE` | `/api/cart/{id}` | Auth | Menghapus item dari keranjang |
| `POST` | `/api/promo/validate` | Auth | Validasi kode voucher promo saat checkout |
| `POST` | `/api/checkout` | Auth | Melakukan checkout pesanan (Atomic DB Transaction) |
| `GET` | `/api/orders` | Auth | Mengambil riwayat pesanan customer |
| `GET` | `/api/orders/{order_number}` | Auth | Mengambil detail spesifik pesanan |
| `GET` | `/api/admin/dashboard/stats` | Admin | Statistik analitik dashboard & data grafik |
| `GET` | `/api/admin/users` | Admin | Mengambil daftar seluruh akun terdaftar & metrik |
| `POST` | `/api/admin/users/{id}/reset-password` | Admin | Reset password akun pengguna secara langsung |
| `PATCH`| `/api/admin/users/{id}/role` | Admin | Mengubah role akun (Admin / Customer) |
| `DELETE`| `/api/admin/users/{id}` | Admin | Menghapus akun pengguna dari sistem |
| `GET` | `/api/admin/orders` | Admin | Mengambil seluruh pesanan masuk |
| `PATCH`| `/api/admin/orders/{id}/status` | Admin | Mengubah status pesanan (dengan auto-restock) |
| `POST` | `/api/admin/products` | Admin | Menambahkan produk baru |
| `PUT` | `/api/admin/products/{id}` | Admin | Memperbarui data produk & stok |
| `DELETE`| `/api/admin/products/{id}` | Admin | Menghapus produk |

---

## 🚀 6. Panduan Menjalankan Aplikasi Secara Lokal

### Kebutuhan Sistem:
- **PHP**: Versi 8.2 atau lebih baru
- **Composer**: Dependency Manager PHP
- **Node.js**: Versi 18+ & **npm**
- **PostgreSQL**: Versi 15+

### 1. Menjalankan Backend (Laravel API):
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
# Server backend berjalan di: http://127.0.0.1:8000
```

### 2. Menjalankan Frontend (React Vite):
```bash
cd frontend
npm install
npm run dev
# Server frontend berjalan di: http://localhost:5173
```

### 3. Kredensial Akun Bawaan (Default Demo):
- **Administrator**: `admin@renstore.com` | Password: `admin123` *(Akses ke `/admin`)*
- **Customer**: `customer@renstore.com` | Password: `password123`

---

*Dokumentasi ini dibuat sebagai referensi teknis dan fungsional menyeluruh dari platform RENSTORE E-Commerce.*
