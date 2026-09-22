# Product Requirements Document (PRD)
## RENSTORE — E-Commerce Website

**Versi:** 1.1
**Status:** Draft untuk eksekusi AI Coding Agent
**Tipe dokumen:** Scope-locked PRD (agent tidak boleh menambah scope besar tanpa izin)

---

## 1. Ringkasan Proyek

RENSTORE adalah website e-commerce full-stack yang dibuat untuk membuktikan kemampuan membangun sistem lengkap: frontend, backend, database, dan API — bukan sekadar tampilan (UI mockup). Website harus terlihat dan berperilaku seperti toko online perusahaan sungguhan, bukan proyek latihan/template generik.

## 2. Tujuan

- Membuktikan kompetensi full-stack (frontend + backend + database + API).
- Menghasilkan produk yang terlihat profesional, bukan template AI generik ("AI slop").
- Semua fitur harus berfungsi end-to-end (bukan dummy/placeholder tanpa logic).

## 3. Aturan Kerja untuk AI Agent (WAJIB DIPATUHI)

Ini bagian paling penting. AI agent **boleh berpikir dan mengembangkan detail teknis** (struktur folder, penamaan komponen, validasi, edge case, arsitektur kode) selama itu memperkuat fitur yang sudah didefinisikan di PRD ini. Tapi ada batas keras yang **tidak boleh dilanggar**:

1. **Dilarang menambah fitur besar di luar daftar fitur** pada bagian 5, kecuali diminta eksplisit oleh user. Boleh menambah detail kecil pendukung (misal: pagination, empty state, loading state) karena itu bagian wajar dari fitur yang sudah ada.
2. **Dilarang keras berimprovisasi di bagian desain.** Ikuti Design Guidelines (bagian 7) secara ketat. Jangan menambah elemen visual "kreatif" sendiri di luar guideline.
3. **Tidak boleh ada gradasi warna** dalam bentuk apa pun (background, button, text, shadow, dsb).
4. **Tidak boleh ada emoticon/emoji** di UI, copy text, commit message, maupun komentar kode yang tampil ke user.
5. **Semua aset visual harus dibuat sendiri** (icon, ilustrasi, logo placeholder) — bukan hasil scraping foto stok berlisensi atau logo brand asli. Icon boleh berupa SVG custom/minimalis buatan sendiri, foto produk boleh placeholder polos.
6. **Dilarang tampilan generik ala template AI**: hindari hero section dengan judul besar clichê + gradient blob + emoji + stock photo campuran gaya. Semua harus terasa dirancang, bukan "auto-generated".
7. **Alur (flow) di bagian 6 wajib diikuti langkah demi langkah.** Agent tidak boleh memotong/menggabungkan langkah alur tanpa alasan teknis yang jelas.
8. Jika agent ragu apakah sebuah ide termasuk "boleh dikembangkan" atau "keluar dari scope", **default-nya adalah tidak melakukan itu** dan cukup implementasi versi paling sederhana yang benar secara fungsional.

## 4. Tech Stack (Fixed — tidak boleh diganti)

| Layer | Teknologi |
|---|---|
| Frontend | React |
| Styling | Tailwind CSS |
| Backend | Laravel |
| Database | PostgreSQL |
| Komunikasi Frontend-Backend | REST API |

Tidak ada penggantian stack (contoh: tidak boleh diganti ke Next.js, MySQL, GraphQL, dll) kecuali diminta eksplisit oleh user.

## 5. Ruang Lingkup Fitur

### 5.1 Sisi Pelanggan (Customer-facing)

| # | Fitur | Deskripsi Singkat |
|---|---|---|
| 1 | Homepage | Menampilkan produk unggulan/kategori, navigasi utama |
| 2 | Product Listing | Daftar produk dengan pagination |
| 3 | Search | Pencarian produk berdasarkan nama/kata kunci |
| 4 | Filter & Sorting | Filter kategori/harga, sorting (termurah, terbaru, dll) |
| 5 | Product Detail | Halaman detail produk (gambar, deskripsi, harga, stok) |
| 6 | Shopping Cart | Tambah/kurang/hapus item, hitung subtotal |
| 7 | Wishlist | Simpan produk favorit |
| 8 | Login/Register | Autentikasi user (email + password) |
| 9 | Checkout | Proses dari cart ke pemesanan (alamat, ringkasan order) |
| 10 | Order History | Riwayat pesanan user yang login |
| 11 | User Profile | Edit data diri, ubah password |

### 5.2 Sisi Admin

| # | Fitur | Deskripsi Singkat |
|---|---|---|
| 12 | Admin Dashboard | Ringkasan data (total order, produk, pendapatan) |
| 13 | CRUD Produk | Tambah/edit/hapus/lihat produk |
| 14 | Statistik Penjualan | Grafik/angka penjualan (harian/bulanan) |

### 5.3 Di Luar Scope (Out of Scope) untuk v1

- Payment gateway sungguhan (cukup simulasi status pembayaran: pending/paid/failed)
- Multi-vendor/marketplace
- Notifikasi email/SMS real-time
- Multi-bahasa/multi-currency
- Aplikasi mobile native

## 6. Alur Pengguna (User Flow) — WAJIB DIIKUTI

Bagian ini menjabarkan urutan langkah tiap alur secara rinci. Agent harus mengimplementasikan setiap langkah, termasuk kondisi gagal/edge case yang disebutkan.

### 6.1 Alur Customer

**A. Auth (Login/Register)**
1. User membuka `/register`, mengisi nama, email, password (+ konfirmasi password).
2. Validasi: email valid & belum terdaftar, password minimal sesuai aturan (misal min. 8 karakter).
3. Jika sukses → akun tersimpan, arahkan ke `/login` atau langsung login otomatis.
4. Di `/login`, user memasukkan email + password.
5. Jika salah → tampilkan pesan error yang jelas (tanpa emoji, tanpa bahasa lebay).
6. Jika berhasil → simpan sesi/token, arahkan ke Homepage.
7. Fitur logout tersedia dari halaman manapun saat sudah login (di navbar/profile).
8. Halaman yang butuh login (Checkout, Order History, Profile, Wishlist) harus redirect ke `/login` jika user belum login.

**B. Katalog (Product Listing)**
1. User membuka `/products` → sistem menampilkan produk dari database (bukan data statis hardcode), dengan pagination.
2. Setiap kartu produk menampilkan: gambar, nama, harga, dan status stok (tersedia/habis).
3. Klik kartu produk → menuju halaman Product Detail (`/products/:id`).
4. Jika produk kosong (belum ada data) → tampilkan empty state yang jelas, bukan halaman kosong.

**C. Search & Filter**
1. User mengetik kata kunci di search bar → hasil ter-filter sesuai nama produk (query ke backend, bukan filter di frontend saja jika data besar).
2. User bisa memilih filter kategori dan rentang harga.
3. User bisa memilih sorting: termurah, termahal, terbaru.
4. Search, filter, dan sorting bisa dikombinasikan sekaligus dalam satu query.
5. Jika hasil tidak ditemukan → tampilkan pesan "produk tidak ditemukan" yang jelas.

**D. Product Detail**
1. Menampilkan gambar produk, nama, deskripsi lengkap, harga, dan stok.
2. Tombol "Tambah ke Keranjang" — nonaktif/disable jika stok habis.
3. Tombol "Tambah ke Wishlist" (toggle: tambah/hapus dari wishlist).
4. User bisa memilih jumlah (quantity) sebelum menambah ke keranjang, dengan batas maksimal sesuai stok.

**E. Keranjang (Shopping Cart)**
1. Halaman `/cart` menampilkan semua item yang ditambahkan user, dengan gambar, nama, harga satuan, quantity, dan subtotal per item.
2. User bisa mengubah quantity langsung dari halaman cart (update otomatis ke total).
3. User bisa menghapus item dari cart.
4. Sistem menghitung total keseluruhan otomatis.
5. Jika cart kosong → tampilkan empty state dengan tombol arahkan ke `/products`.
6. Tombol "Checkout" hanya aktif jika cart berisi minimal 1 item.

**F. Checkout**
1. User yang klik checkout dari cart diarahkan ke `/checkout`.
2. User mengisi/memilih alamat pengiriman.
3. Sistem menampilkan ringkasan order: daftar item, subtotal, (opsional ongkir jika di-scope-kan), total akhir.
4. User konfirmasi pesanan → sistem membuat record order baru dengan status awal (misal `pending`), lalu mengosongkan cart.
5. Setelah berhasil, user diarahkan ke halaman konfirmasi/detail order atau ke `/orders`.
6. Simulasi status pembayaran cukup berupa status pesanan (`pending` → `paid`/`failed`), tanpa integrasi payment gateway sungguhan (sesuai bagian 5.3 out of scope).

**G. Order History**
1. Halaman `/orders` menampilkan daftar pesanan milik user yang sedang login saja (bukan semua user).
2. Setiap order menampilkan: tanggal, status, total, dan daftar item.
3. User bisa klik order untuk melihat detail lengkap.
4. Jika belum pernah order → tampilkan empty state.

### 6.2 Alur Admin

**A. Auth (Admin)**
1. Admin login melalui halaman login yang sama (`/login`), dibedakan lewat role di database (bukan tabel/login terpisah).
2. Setelah login, jika role = admin → tampilkan menu/akses ke area `/admin`.
3. User biasa (role bukan admin) tidak bisa mengakses `/admin` sama sekali (baik lewat UI maupun langsung lewat URL/API — proteksi harus di backend, bukan hanya disembunyikan di frontend).

**B. CRUD Produk**
1. Admin membuka `/admin/products` → melihat daftar seluruh produk dalam bentuk tabel (nama, harga, stok, kategori, aksi).
2. **Create**: form tambah produk baru (nama, deskripsi, harga, stok, kategori, gambar) dengan validasi input.
3. **Read**: admin bisa melihat detail satu produk dari tabel.
4. **Update**: admin bisa mengedit data produk yang sudah ada, perubahan langsung tersimpan ke database.
5. **Delete**: admin bisa menghapus produk, dengan konfirmasi sebelum penghapusan (bukan langsung hilang tanpa konfirmasi).
6. Perubahan pada produk (misal stok habis) langsung berdampak ke tampilan customer (Katalog & Detail) karena mengambil dari sumber data yang sama.

**C. Ringkasan Statistik Penjualan**
1. Admin membuka `/admin/statistics` atau melihat ringkasan langsung di `/admin` (dashboard).
2. Menampilkan minimal: total pendapatan, total order, total produk terjual, dalam rentang waktu tertentu (misal harian/bulanan).
3. Data statistik dihitung dari data order & order_items yang sesungguhnya di database (bukan angka dummy statis).
4. Boleh ditampilkan dalam bentuk grafik sederhana (bar/line chart flat, tanpa gradasi) atau tabel ringkas, sesuai Design Guidelines di bagian 7.

## 7. Design Guidelines (WAJIB)

**Prinsip utama: clean, modern, minimal, fungsional.**

### Boleh:
- Warna solid/flat (bukan gradasi), palet netral (putih, hitam/abu gelap, satu warna aksen)
- Whitespace yang cukup, grid layout rapi
- Tipografi jelas, maksimal 2 jenis font (1 untuk heading, 1 untuk body — boleh sama)
- Icon custom sederhana (line icon/minimalis), konsisten satu gaya di seluruh halaman
- Micro-interaction sederhana (hover state, transisi halus) — tidak berlebihan

### Tidak Boleh:
- Gradasi warna dalam bentuk apa pun
- Emoji/emoticon di UI maupun teks
- Bayangan/efek glassmorphism berlebihan, neon glow, efek 3D berlebihan
- Stock photo bergaya editorial acak/watermark
- Layout template generik "AI landing page" (hero besar + 3 kartu fitur + testimonial acak tanpa konteks)
- Warna brand pihak ketiga (logo asli brand lain)

### Referensi Warna (contoh, boleh disesuaikan asal tetap solid/flat):
- Base: putih (#FFFFFF) / near-black (#111111 atau sejenis)
- Neutral: abu-abu (#F5F5F5, #E5E5E5, #6B7280)
- Aksen: satu warna tegas (misal navy, hijau tua, atau hitam pekat) — dipakai konsisten untuk CTA/button/link

## 8. Struktur Halaman (Frontend)

```
/                       -> Homepage
/products               -> Product Listing (+ filter, sort, search)
/products/:id           -> Product Detail
/cart                   -> Shopping Cart
/wishlist               -> Wishlist
/login
/register
/checkout
/orders                 -> Order History
/profile
/admin                  -> Admin Dashboard
/admin/products         -> CRUD Produk
/admin/statistics       -> Statistik Penjualan
```

## 9. Skema Database (Garis Besar)

Tabel inti minimal:
- `users` (id, name, email, password, role, timestamps)
- `products` (id, name, description, price, stock, category_id, image_url, timestamps)
- `categories` (id, name)
- `carts` / `cart_items` (user_id, product_id, quantity)
- `wishlists` (user_id, product_id)
- `orders` (id, user_id, status, total, address, timestamps)
- `order_items` (order_id, product_id, quantity, price)

Detail kolom tambahan (index, foreign key, soft delete) boleh dikembangkan agent sesuai best practice Laravel, selama tidak mengubah struktur fitur di atas.

## 10. API (Garis Besar REST Endpoints)

```
GET    /api/products
GET    /api/products/{id}
GET    /api/categories
POST   /api/auth/register
POST   /api/auth/login
POST   /api/cart
GET    /api/cart
DELETE /api/cart/{id}
POST   /api/wishlist
GET    /api/wishlist
POST   /api/orders
GET    /api/orders
GET    /api/admin/products (protected, role: admin)
POST   /api/admin/products
PUT    /api/admin/products/{id}
DELETE /api/admin/products/{id}
GET    /api/admin/statistics
```

Agent boleh menambahkan endpoint pendukung kecil (misal endpoint update quantity cart) selama masih dalam scope fitur yang sama.

## 11. Kriteria Selesai (Acceptance Criteria)

- Semua fitur di bagian 5.1 dan 5.2 berfungsi end-to-end (bukan dummy data statis tanpa backend).
- Seluruh langkah pada alur di bagian 6 (customer maupun admin) berjalan sesuai urutan yang dijabarkan.
- Autentikasi berjalan (register, login, proteksi halaman yang butuh login, proteksi role admin di backend).
- Role admin terpisah dari user biasa, dan halaman admin terproteksi baik di frontend maupun backend.
- Desain konsisten mengikuti bagian 7 di seluruh halaman, tanpa gradasi/emoji.
- Tidak ada bagian UI yang terasa template/generik tanpa penyesuaian.
- Kode terstruktur rapi sesuai konvensi Laravel & React (folder terorganisir, tidak semua logic dalam satu file).

---

*Dokumen ini adalah acuan tunggal (single source of truth) untuk AI coding agent. Jika ada instruksi lain yang bertentangan dengan PRD ini, PRD ini yang menjadi acuan utama.*
