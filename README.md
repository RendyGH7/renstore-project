# RENSTORE — Modern Full-Stack E-Commerce Platform

![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

RENSTORE adalah aplikasi e-commerce *full-stack* modern dengan arsitektur *decoupled* (*Client-Server*). Sistem ini mengintegrasikan **Laravel RESTful API** di sisi backend, basis data **PostgreSQL**, antarmuka **React 18 TypeScript** dengan desain solid minimalis, serta integrasi sistem pembayaran otomatis **Xendit Dynamic QRIS**.

---

## Fitur Utama

### 1. Customer Storefront
- **Katalog & Navigasi:** Pencarian produk real-time, filter kategori dinamis, dan sortir harga.
- **Keranjang Belanja:** Sinkronisasi kuantitas belanja dengan kalkulasi harga terpusat di server.
- **Checkout & Integritas Stok:** Validasi stok menggunakan `DB::transaction` untuk mencegah selisih inventaris (*race conditions*).
- **Payment Gateway Otomatis:** Pembayaran QRIS dinamis via Xendit API lengkap dengan webhook callback untuk verifikasi instan.
- **Riwayat Pesanan:** Pelacakan status transaksi secara rinci.

### 2. Admin Portal & Dashboard
- **Metrik Analitik:** Kartu ringkasan omset penjualan, total pesanan, jumlah produk, dan grafik transaksi.
- **Manajemen Produk:** Operasi CRUD katalog lengkap beserta kontrol kuantitas inventaris.
- **Manajemen Pesanan:** Pembaruan status pesanan (*Pending*, *Processing*, *Completed*, *Cancelled*) dengan mekanisme pengembalian stok otomatis (*stock restoration*) saat pesanan dibatalkan.

---

### Tech Stack
- **Backend:** PHP 8.5+, Laravel 11/12, Laravel Sanctum (RBAC)
- **Frontend:** React 18, TypeScript (TSX), Vite, Tailwind CSS, Lucide Icons
- **Database:** PostgreSQL
- **Payment Gateway:** Xendit (Dynamic QRIS API)

---

## Arsitektur Sistem

```text
[ React TSX + Tailwind ] 
        │
    (REST API)
        ▼
[ Laravel 11/12 API ] ──(DB::transaction)──► [ PostgreSQL ]
        │
   (HTTP Webhook)
        ▲
[ Xendit Payment Gateway ]
