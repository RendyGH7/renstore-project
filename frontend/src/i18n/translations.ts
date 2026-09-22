export type Language = 'id' | 'en';
export type Currency = 'IDR' | 'USD';

export interface Translations {
  // Navigation & Topbar
  country_locale: string;
  free_shipping_banner: string;
  track_orders: string;
  login: string;
  register: string;
  logout: string;
  home: string;
  catalog: string;
  categories: string;
  all_categories: string;
  search_placeholder: string;
  cart: string;
  admin_dashboard: string;
  my_account: string;
  role_admin: string;
  role_customer: string;

  // Hero Section & Promo
  hero_tag: string;
  hero_title_1: string;
  hero_title_2: string;
  hero_desc: string;
  shop_now: string;
  explore_catalog: string;
  promo_title: string;
  promo_subtitle: string;
  promo_code: string;
  save_up_to: string;

  // Features / Value propositions
  feature_warranty_title: string;
  feature_warranty_desc: string;
  feature_shipping_title: string;
  feature_shipping_desc: string;
  feature_support_title: string;
  feature_support_desc: string;
  feature_payment_title: string;
  feature_payment_desc: string;

  // Catalog & Product Card
  featured_products: string;
  browse_all_products: string;
  all_products: string;
  products_count: string;
  sort_latest: string;
  sort_price_low: string;
  sort_price_high: string;
  sort_name: string;
  filter_by_category: string;
  price: string;
  add_to_cart: string;
  added_to_cart: string;
  out_of_stock: string;
  in_stock: string;
  view_details: string;
  no_products_found: string;
  no_products_desc: string;
  reset_filters: string;

  // Product Detail Page
  back_to_catalog: string;
  quantity: string;
  buy_now: string;
  product_description: string;
  product_specs: string;
  sku: string;
  category: string;
  share_product: string;
  subtotal: string;

  // Cart Page
  shopping_cart: string;
  cart_items: string;
  cart_empty_title: string;
  cart_empty_desc: string;
  start_shopping: string;
  remove_item: string;
  order_summary: string;
  shipping: string;
  free: string;
  total: string;
  proceed_to_checkout: string;
  clear_cart: string;

  // Checkout Page
  checkout_title: string;
  shipping_info: string;
  full_name: string;
  phone_number: string;
  shipping_address: string;
  city: string;
  postal_code: string;
  notes_optional: string;
  payment_method: string;
  pay_now: string;
  processing_payment: string;
  qris_scan_instruction: string;
  payment_success_title: string;
  payment_success_desc: string;
  back_to_home: string;
  view_order_status: string;
  promo_code_placeholder: string;
  apply_promo: string;
  promo_applied: string;
  promo_invalid: string;
  remove_promo: string;
  discount: string;
  direct_checkout_badge: string;
  available_promos_hint: string;

  // Profile Page
  profile_title: string;
  upload_photo: string;
  remove_photo: string;
  personal_info: string;
  security_settings: string;
  new_password: string;
  confirm_password: string;
  password_hint: string;
  save_changes: string;
  profile_updated: string;
  member_since: string;
  view_profile: string;

  // Orders Page
  orders_history: string;
  orders_empty: string;
  order_id: string;
  order_date: string;
  order_status: string;
  status_pending: string;
  status_paid: string;
  status_shipped: string;
  status_completed: string;
  status_cancelled: string;

  // Footer
  footer_tagline: string;
  footer_quick_links: string;
  footer_customer_service: string;
  footer_contact_us: string;
  footer_rights: string;
  footer_secure_payment: string;
}

export const translations: Record<Language, Translations> = {
  id: {
    // Navigation & Topbar
    country_locale: 'Indonesia',
    free_shipping_banner: 'Gratis ongkir untuk pesanan di atas IDR 500.000',
    track_orders: 'Lacak Pesanan',
    login: 'Masuk',
    register: 'Daftar',
    logout: 'Keluar',
    home: 'Beranda',
    catalog: 'Katalog Produk',
    categories: 'Kategori',
    all_categories: 'Semua Kategori',
    search_placeholder: 'Cari gadget, laptop, aksesoris...',
    cart: 'Keranjang',
    admin_dashboard: 'Admin Dashboard',
    my_account: 'Akun Saya',
    role_admin: 'Administrator',
    role_customer: 'Pelanggan',

    // Hero Section & Promo
    hero_tag: 'Rilis Produk Terbaru 2026',
    hero_title_1: 'Teknologi Canggih untuk',
    hero_title_2: 'Gaya Hidup Modern Anda',
    hero_desc: 'Temukan pilihan gadget premium, smartphone flagship, aksesoris eksklusif, dan perangkat pintar dengan garansi resmi dan pengiriman instan.',
    shop_now: 'Belanja Sekarang',
    explore_catalog: 'Jelajahi Katalog',
    promo_title: 'Penawaran Spesial Terbatas',
    promo_subtitle: 'Dapatkan diskon eksklusif untuk koleksi pilihan minggu ini.',
    promo_code: 'Kode Promo',
    save_up_to: 'Hemat hingga',

    // Features
    feature_warranty_title: '100% Produk Original',
    feature_warranty_desc: 'Garansi resmi pabrikan hingga 2 tahun penuh.',
    feature_shipping_title: 'Pengiriman Cepat & Aman',
    feature_shipping_desc: 'Packing kayu tebal & asuransi pengiriman ke seluruh Indonesia.',
    feature_support_title: 'Layanan Pelanggan 24/7',
    feature_support_desc: 'Konsultasi teknis dan bantuan pesanan kapan saja.',
    feature_payment_title: 'Pembayaran Aman QRIS',
    feature_payment_desc: 'Didukung gateway pembayaran Xendit & enkripsi SSL.',

    // Catalog & Product Card
    featured_products: 'Produk Pilihan Unggulan',

    browse_all_products: 'Lihat Semua Produk',
    all_products: 'Semua Produk',
    products_count: 'produk ditemukan',
    sort_latest: 'Terbaru',
    sort_price_low: 'Harga: Termurah',
    sort_price_high: 'Harga: Termahal',
    sort_name: 'Nama (A-Z)',
    filter_by_category: 'Filter Kategori',
    price: 'Harga',
    add_to_cart: '+ Keranjang',
    added_to_cart: 'Ditambah',
    out_of_stock: 'Stok Habis',
    in_stock: 'Tersedia',
    view_details: 'Lihat Detail',
    no_products_found: 'Tidak ada produk yang cocok',
    no_products_desc: 'Coba ubah kata kunci pencarian atau reset filter kategori.',
    reset_filters: 'Reset Filter',

    // Product Detail Page
    back_to_catalog: 'Kembali ke Katalog Produk',
    quantity: 'Jumlah',
    buy_now: 'Beli Sekarang',
    product_description: 'Deskripsi Produk',
    product_specs: 'Spesifikasi Lengkap',
    sku: 'SKU / Kode Produk',
    category: 'Kategori',
    share_product: 'Bagikan Produk',
    subtotal: 'Subtotal',

    // Cart Page
    shopping_cart: 'Keranjang Belanja',
    cart_items: 'Item di Keranjang',
    cart_empty_title: 'Keranjang Belanja Kosong',
    cart_empty_desc: 'Anda belum menambahkan produk apa pun ke keranjang.',
    start_shopping: 'Mulai Belanja',
    remove_item: 'Hapus',
    order_summary: 'Ringkasan Pesanan',
    shipping: 'Biaya Pengiriman',
    free: 'GRATIS',
    total: 'Total Pembayaran',
    proceed_to_checkout: 'Lanjut ke Pembayaran',
    clear_cart: 'Kosongkan Keranjang',

    // Checkout Page
    checkout_title: 'Checkout & Pembayaran',
    shipping_info: 'Informasi Pengiriman',
    full_name: 'Nama Lengkap',
    phone_number: 'Nomor WhatsApp / HP',
    shipping_address: 'Alamat Lengkap Pengiriman',
    city: 'Kota / Kabupaten',
    postal_code: 'Kode Pos',
    notes_optional: 'Catatan Pesanan (Opsional)',
    payment_method: 'Metode Pembayaran',
    pay_now: 'Bayar Sekarang via QRIS',
    processing_payment: 'Memproses Pembayaran...',
    qris_scan_instruction: 'Pindai kode QRIS menggunakan e-wallet (GoPay, OVO, Dana, ShopeePay) atau mobile banking Anda.',
    payment_success_title: 'Pembayaran Berhasil Dikonfirmasi!',
    payment_success_desc: 'Pesanan Anda sedang diproses oleh tim kami dan akan segera dikirimkan.',
    back_to_home: 'Kembali ke Beranda',
    view_order_status: 'Lihat Status Pesanan',
    promo_code_placeholder: 'Masukkan kode promo (contoh: DISKON50)',
    apply_promo: 'Terapkan',
    promo_applied: 'Voucher berhasil digunakan!',
    promo_invalid: 'Kode promo tidak valid atau syarat tidak terpenuhi.',
    remove_promo: 'Hapus',
    discount: 'Potongan Diskon',
    direct_checkout_badge: 'Beli Langsung (Direct Checkout)',
    available_promos_hint: 'Promo aktif: DISKON50 (Diskon 50%), RENSTORE2026 (15%), HEMAT10 (10%)',

    // Profile Page
    profile_title: 'Pengaturan Profil',
    upload_photo: 'Unggah Foto Baru',
    remove_photo: 'Hapus Foto',
    personal_info: 'Informasi Pribadi',
    security_settings: 'Keamanan & Kata Sandi',
    new_password: 'Kata Sandi Baru (Opsional)',
    confirm_password: 'Konfirmasi Kata Sandi Baru',
    password_hint: 'Kosongkan jika tidak ingin mengubah kata sandi saat ini.',
    save_changes: 'Simpan Perubahan Profil',
    profile_updated: 'Profil berhasil diperbarui!',
    member_since: 'Bergabung sejak',
    view_profile: 'Pengaturan Profil',

    // Orders Page
    orders_history: 'Riwayat Pesanan',
    orders_empty: 'Belum ada pesanan.',
    order_id: 'ID Pesanan',
    order_date: 'Tanggal Transaksi',
    order_status: 'Status Pesanan',
    status_pending: 'Menunggu Pembayaran',
    status_paid: 'Sudah Dibayar',
    status_shipped: 'Sedang Dikirim',
    status_completed: 'Selesai',
    status_cancelled: 'Dibatalkan',

    // Footer
    footer_tagline: 'Platform e-commerce gadget & elektronik terdepan dengan pelayanan terbaik dan garansi resmi terlengkap.',
    footer_quick_links: 'Tautan Cepat',
    footer_customer_service: 'Layanan Pelanggan',
    footer_contact_us: 'Hubungi Kami',
    footer_rights: 'Hak Cipta Dilindungi.',
    footer_secure_payment: 'Pembayaran Terenkripsi & Aman',
  },
  en: {
    // Navigation & Topbar
    country_locale: 'Global',
    free_shipping_banner: 'Free shipping on orders over IDR 500,000 / $35',
    track_orders: 'Track Orders',
    login: 'Log In',
    register: 'Sign Up',
    logout: 'Log Out',
    home: 'Home',
    catalog: 'Product Catalog',
    categories: 'Categories',
    all_categories: 'All Categories',
    search_placeholder: 'Search gadgets, laptops, accessories...',
    cart: 'Cart',
    admin_dashboard: 'Admin Dashboard',
    my_account: 'My Account',
    role_admin: 'Administrator',
    role_customer: 'Customer',

    // Hero Section & Promo
    hero_tag: 'New Releases 2026',
    hero_title_1: 'Cutting-Edge Technology for',
    hero_title_2: 'Your Modern Lifestyle',
    hero_desc: 'Discover premium gadgets, flagship smartphones, exclusive accessories, and smart devices with official warranty and instant shipping.',
    shop_now: 'Shop Now',
    explore_catalog: 'Explore Catalog',
    promo_title: 'Limited Special Offer',
    promo_subtitle: 'Get exclusive discounts on selected featured collections this week.',
    promo_code: 'Promo Code',
    save_up_to: 'Save up to',

    // Features
    feature_warranty_title: '100% Genuine Products',
    feature_warranty_desc: 'Official manufacturer warranty for up to 2 full years.',
    feature_shipping_title: 'Fast & Secure Delivery',
    feature_shipping_desc: 'Heavy-duty packing & full transit insurance nationwide.',
    feature_support_title: '24/7 Customer Support',
    feature_support_desc: 'Technical consultation & order assistance at any time.',
    feature_payment_title: 'Secure Payment Gateway',
    feature_payment_desc: 'Powered by Xendit Payment Gateway & SSL encryption.',

    // Catalog & Product Card
    featured_products: 'Featured Products',

    browse_all_products: 'View All Products',
    all_products: 'All Products',
    products_count: 'products found',
    sort_latest: 'Latest',
    sort_price_low: 'Price: Low to High',
    sort_price_high: 'Price: High to Low',
    sort_name: 'Name (A-Z)',
    filter_by_category: 'Filter by Category',
    price: 'Price',
    add_to_cart: '+ Add to Cart',
    added_to_cart: 'Added',
    out_of_stock: 'Out of Stock',
    in_stock: 'In Stock',
    view_details: 'View Details',
    no_products_found: 'No matching products found',
    no_products_desc: 'Try changing your search terms or resetting category filters.',
    reset_filters: 'Reset Filters',

    // Product Detail Page
    back_to_catalog: 'Back to Product Catalog',
    quantity: 'Quantity',
    buy_now: 'Buy Now',
    product_description: 'Product Description',
    product_specs: 'Specifications',
    sku: 'SKU / Product Code',
    category: 'Category',
    share_product: 'Share Product',
    subtotal: 'Subtotal',

    // Cart Page
    shopping_cart: 'Shopping Cart',
    cart_items: 'Items in Cart',
    cart_empty_title: 'Your Cart is Empty',
    cart_empty_desc: 'You have not added any products to your shopping cart yet.',
    start_shopping: 'Start Shopping',
    remove_item: 'Remove',
    order_summary: 'Order Summary',
    shipping: 'Shipping Cost',
    free: 'FREE',
    total: 'Total Payment',
    proceed_to_checkout: 'Proceed to Checkout',
    clear_cart: 'Clear Cart',

    // Checkout Page
    checkout_title: 'Checkout & Payment',
    shipping_info: 'Shipping Information',
    full_name: 'Full Name',
    phone_number: 'Phone / WhatsApp Number',
    shipping_address: 'Full Shipping Address',
    city: 'City / District',
    postal_code: 'Postal Code',
    notes_optional: 'Order Notes (Optional)',
    payment_method: 'Payment Method',
    pay_now: 'Pay Now via QRIS',
    processing_payment: 'Processing Payment...',
    qris_scan_instruction: 'Scan the QRIS code using your e-wallet (GoPay, OVO, Dana, ShopeePay) or mobile banking app.',
    payment_success_title: 'Payment Successfully Confirmed!',
    payment_success_desc: 'Your order is being processed by our team and will be dispatched shortly.',
    back_to_home: 'Back to Home',
    view_order_status: 'View Order Status',
    promo_code_placeholder: 'Enter promo code (e.g. DISKON50)',
    apply_promo: 'Apply',
    promo_applied: 'Voucher applied successfully!',
    promo_invalid: 'Promo code is invalid or requirements are not met.',
    remove_promo: 'Remove',
    discount: 'Discount',
    direct_checkout_badge: 'Direct Buy Checkout',
    available_promos_hint: 'Available Promos: DISKON50 (50% Off), RENSTORE2026 (15% Off), HEMAT10 (10% Off)',

    // Profile Page
    profile_title: 'Profile Settings',
    upload_photo: 'Upload New Photo',
    remove_photo: 'Remove Photo',
    personal_info: 'Personal Information',
    security_settings: 'Security & Password',
    new_password: 'New Password (Optional)',
    confirm_password: 'Confirm New Password',
    password_hint: 'Leave blank if you do not wish to change your password.',
    save_changes: 'Save Profile Changes',
    profile_updated: 'Profile updated successfully!',
    member_since: 'Member since',
    view_profile: 'Profile Settings',

    // Orders Page
    orders_history: 'Order History',
    orders_empty: 'No orders placed yet.',
    order_id: 'Order ID',
    order_date: 'Transaction Date',
    order_status: 'Order Status',
    status_pending: 'Pending Payment',
    status_paid: 'Paid',
    status_shipped: 'Shipped',
    status_completed: 'Completed',
    status_cancelled: 'Cancelled',

    // Footer
    footer_tagline: 'Leading gadget & tech e-commerce platform delivering exceptional customer experiences and authentic warranties.',
    footer_quick_links: 'Quick Links',
    footer_customer_service: 'Customer Care',
    footer_contact_us: 'Contact Us',
    footer_rights: 'All Rights Reserved.',
    footer_secure_payment: 'Encrypted & Secure Payment',
  },
};
