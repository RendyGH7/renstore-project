# DESIGN DOCUMENT (DESIGN.md)
## RENSTORE — E-Commerce Website

**Versi:** 2.0 (Definitive UI/UX Overhaul)  
**Status:** Dokumen turunan dari `PRD-renstore.md` dan Acuan Desain Visual  
**Tipe dokumen:** Technical & Visual Design Reference untuk AI Coding Agent  

---

## 0. Panduan Desain Visual Definitif (100% Style-Match)

### 0.1 Aturan Warna & Visual (Strict Zero-Gradient Rule)
- **Hapus SEMUA kelas gradasi** (`bg-gradient-...`, `from-...`, `to-...`, `bg-clip-text`). Semua background dan tombol menggunakan warna solid flat berkarakter.
- **Customer Storefront (Acuan Gambar 1 - Cozy Commerce Style)**:
  * **Background**: Pure white (`bg-white`) dan canvas abu-abu lembut (`bg-slate-50`).
  * **Primary Accent**: Royal / Electric Blue solid (`#2563eb` atau `#1d4ed8`) untuk badge diskon, tombol utama CTA, tab aktif, dan status penting.
  * **Card & Container**: Sudut melengkung halus (`rounded-2xl` / `rounded-xl`), border tipis (`border-slate-100` / `border-slate-200`), dan bayangan sangat lembut (`shadow-sm`).
- **Admin Portal (Acuan Gambar 2 - Subcom SaaS Dark-Sidebar Style)**:
  * **Sidebar**: Deep Dark Slate (`bg-[#111827]` atau `bg-slate-900`) dengan teks kontras tinggi (`text-white` / `text-slate-400`) dan badge status hijau mint (`#10b981`).
  * **Content Canvas**: `bg-[#f8fafc]` atau `bg-slate-50`.
  * **Stat Metric KPI Cards**: Kartu metrik dengan background warna solid pastel yang sangat lembut:
    - Soft Peach / Coral (`bg-[#fff1ed]` / `bg-orange-50`)
    - Soft Green / Mint (`bg-[#ecfdf5]` / `bg-emerald-50`)
    - Soft Cyan / Blue (`bg-[#eff6ff]` / `bg-blue-50`)
    - Soft Yellow / Amber (`bg-[#fefce8]` / `bg-amber-50`)
    - Soft Purple / Lavender (`bg-[#f5f3ff]` / `bg-purple-50`)
    dengan teks angka tebal hitam (`text-slate-900 text-2xl font-bold`).

### 0.2 Aset & Zero-Emoticon Rule
- **DILARANG menggunakan emotikon teks / Unicode emoji** (seperti 🔥, 🛍️, 👑, ✨) di seluruh halaman mana pun.
- **Semua ikon WAJIB memakai icon pack SVG profesional** (`lucide-react`) atau render SVG murni dengan stroke seragam.
- **Storefront Browse by Category**: Komponen berbentuk lingkaran (`rounded-full bg-slate-100 border border-slate-200/60`) yang menampung gambar/ikon produk terpusat dengan label rapi di bawahnya.
- **Storefront Banner Hero**: Grid 2 kolom — sisi kiri kartu promo utama (diskon 30% SALE OFF, headline tebal, tombol CTA solid), sisi kanan 2 kartu promo bertumpuk (iPhone & MacBook).

### 0.3 UX, Interaktivitas, & Responsivitas
- **Interaksi Elemen**: Hover transisi halus (`transition-all duration-200 ease-in-out`), active state, dan focus ring yang rapi pada setiap form input (`focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600`).
- **Tombol CTA**: State loading interaktif (spinner / disabled) saat proses submit form atau Add to Cart berjalan.
- **Responsif 100%**: Rapi dari mobile (320px) hingga layar desktop lebar (1440px+).

---

## 1. Skema Database PostgreSQL

Konvensi umum:
- Primary key: `BIGSERIAL` / `BIGINT GENERATED ALWAYS AS IDENTITY`.
- Uang disimpan sebagai `NUMERIC(12,2)` (Rupiah).
- Nama tabel snake_case jamak (`users`, `categories`, `products`, `carts`, `cart_items`, `orders`, `order_items`).

---

## 2. Kontrak REST API

- Base URL: `/api`
- Auth: Laravel Sanctum (`Bearer {token}`)
- Endpoint Publik: `/api/products`, `/api/categories`, `/api/products/{slug}`
- Endpoint Customer: `/api/cart`, `/api/orders`, `/api/auth/*`
- Endpoint Admin: `/api/admin/dashboard/stats`, `/api/admin/products`, `/api/admin/orders`, `/api/admin/categories`

---

## 3. Design Tokens

```js
colors: {
  storefront: {
    bg: '#F8FAFC',
    card: '#FFFFFF',
    primary: '#2563EB',      // Royal Blue solid
    primaryHover: '#1D4ED8',
    textMain: '#0F172A',
    textMuted: '#64748B',
    border: '#F1F5F9',
  },
  admin: {
    sidebarBg: '#111827',    // Deep Dark Slate
    sidebarActive: '#1F2937',
    badgeMint: '#10B981',
    canvasBg: '#F8FAFC',
    cardBg: '#FFFFFF',
    pastelPeach: '#FFF1ED',
    pastelGreen: '#ECFDF5',
    pastelBlue: '#EFF6FF',
    pastelYellow: '#FEFCE8',
    pastelPurple: '#F5F3FF',
  }
}
```
