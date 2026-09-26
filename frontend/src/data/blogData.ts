export interface BlogPost {
  id: string;
  slug: string;
  titleId: string;
  titleEn: string;
  excerptId: string;
  excerptEn: string;
  category: 'Review' | 'Guide' | 'Tips' | 'Lifestyle' | 'News';
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishDate: string;
  readTime: string;
  coverImage: string;
  tags: string[];
  contentId: string;
  contentEn: string;
  likesCount: number;
  viewsCount: number;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-1',
    slug: 'review-iphone-16-pro-camera-performance',
    titleId: 'Review Mendalam iPhone 16 Pro Max: Lompatan Kamera & Performa A18 Pro',
    titleEn: 'In-Depth Review iPhone 16 Pro Max: Camera Leap & A18 Pro Performance',
    excerptId: 'Ulasan komprehensif tentang inovasi tombol Camera Control, lensa 5x Telephoto terbaru, dan ketahanan baterai untuk produktivitas harian.',
    excerptEn: 'A comprehensive review of Camera Control innovation, new 5x Telephoto lens, and battery longevity for daily productivity.',
    category: 'Review',
    author: {
      name: 'Rendy Pratama',
      role: 'Tech Lead & Gadget Reviewer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
    },
    publishDate: '22 Sep 2026',
    readTime: '6 min read',
    coverImage: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=1000&auto=format&fit=crop',
    tags: ['Apple', 'iPhone', 'Flagship', 'Smartphone Photography'],
    likesCount: 342,
    viewsCount: 2450,
    contentId: `
### Inovasi Tombol Camera Control yang Mengubah Alur Kerja

Apple kembali menghadirkan pembaruan menarik pada jajaran iPhone 16 Pro series dengan memperkenalkan tombol fisik kapasitif **Camera Control**. Tombol ini memungkinkan pengguna membuka kamera secara instan, mengatur zoom optik, hingga memilih tone visual hanya dengan usapan jari secara presisi.

### Performa Chipset A18 Pro: Efisiensi & Kekuatan AI

Didukung arsitektur 3nm generasi kedua, chip Apple A18 Pro menawarkan peningkatan efisiensi termal yang sangat signifikan. Pengujian rendering video 4K ProRes 120fps dan gaming berat seperti *Death Stranding* berjalan sangat stabil dengan suhu bodi titanium yang tetap terjaga dingin.

### Daya Tahan Baterai & Kesimpulan

Dengan kapasitas baterai yang lebih padat dan optimasi sistem iOS terbaru, iPhone 16 Pro Max mampu bertahan hingga 33 jam pemutaran video terus-menerus. Untuk para kreator konten dan profesional yang mendambakan kualitas kamera teratas, smartphone ini merupakan investasi terbaik tahun ini.
    `,
    contentEn: `
### The Camera Control Button Revolution

Apple introduces an exciting addition to the iPhone 16 Pro line with the **Camera Control** capacitive button. This allows creators to instantly trigger the camera, adjust optical zoom, and switch color styles with seamless swipe gestures.

### A18 Pro Performance: AI Powerhouse & Thermal Efficiency

Built on 2nd-gen 3nm architecture, Apple's A18 Pro chip delivers significant thermal efficiency. 4K ProRes 120fps video rendering and AAA mobile gaming remain rock-solid without excessive heat dissipation.

### Battery Longevity & Verdict

With dense battery architecture and iOS refinements, iPhone 16 Pro Max effortlessly powers through heavy workdays. For mobile creators and power users, it remains the ultimate flagship purchase of 2026.
    `,
  },
  {
    id: 'blog-2',
    slug: 'panduan-memilih-mechanical-keyboard-terbaik-2026',
    titleId: 'Panduan Lengkap Memilih Mechanical Keyboard untuk Kerja & Gaming di 2026',
    titleEn: 'Complete Guide to Choosing the Best Mechanical Keyboard for Work & Gaming',
    excerptId: 'Mengenal switch linier, tactile, gasket mount, hingga konektivitas wireless multi-device agar kenyamanan mengetik meningkat drastis.',
    excerptEn: 'Understanding linear, tactile switches, gasket mount structures, and multi-device wireless for supreme typing satisfaction.',
    category: 'Guide',
    author: {
      name: 'Sarah Wijaya',
      role: 'Workspace Setup Enthusiast',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200',
    },
    publishDate: '19 Sep 2026',
    readTime: '5 min read',
    coverImage: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=1000&auto=format&fit=crop',
    tags: ['Keyboard', 'Setup Workspace', 'Mechanical Keyboard', 'Tech Guide'],
    likesCount: 289,
    viewsCount: 1980,
    contentId: `
### Menentukan Jenis Switch: Linear, Tactile, atau Clicky?

Switch adalah jantung dari mechanical keyboard. Jika Anda menyukai ketikan mulus tanpa hambatan (cocok untuk gaming dan kantor terbuka), pilih **Linear Switch** (seperti Red atau Yellow). Jika menginginkan feedback sentuhan di setiap ketikan tanpa suara berisik, **Tactile Switch** (Brown atau Holy Panda) adalah opsi ideal.

### Struktur Gasket Mount dan Peredam Busa (Foam)

Tren keyboard modern saat ini menitikberatkan pada akustik "thocky" yang renyah. Pilihlah keyboard dengan struktur **Gasket Mount** dan pre-lubed stabilizer dari pabrik untuk menghindari suara rattling yang mengganggu.

### Konektivitas Tri-Mode (Bluetooth, 2.4GHz Dongle, Type-C)

Pastikan keyboard Anda mendukung konektivitas tri-mode agar mudah berpindah antara MacBook, PC Windows, dan tablet secara mulus dalam hitungan detik.
    `,
    contentEn: `
### Picking Your Switch Profile: Linear, Tactile, or Clicky?

The switch is the soul of any mechanical keyboard. For smooth actuations during gaming or office work, **Linear Switches** are king. For tactile bump feedback without loud clicks, **Tactile Switches** provide the golden balance.

### Gasket Mount Structures & Acoustic Dampening

Modern keyboard enthusiasts prioritize satisfying "thocky" sound profiles. Opt for gasket-mounted boards with pre-lubed stabilizers straight from the factory.

### Tri-Mode Connectivity for Seamless Multitasking

Make sure your board offers Bluetooth 5.3, low-latency 2.4GHz wireless, and Type-C wired modes for rapid switching across laptops and tablets.
    `,
  },
  {
    id: 'blog-3',
    slug: 'macbook-pro-m4-chip-performance-guide',
    titleId: 'Komparasi MacBook Pro M4 vs M3 Max: Apakah Layak untuk Upgrade?',
    titleEn: 'MacBook Pro M4 vs M3 Max Comparison: Is It Worth Upgrading?',
    excerptId: 'Analisis performa arsitektur Apple Silicon M4 dalam tugas berat: kompilasi kode, rendering 3D, dan pemrosesan AI lokal.',
    excerptEn: 'Deep-dive analysis of Apple Silicon M4 architecture in coding compilation, 3D rendering, and local on-device AI tasks.',
    category: 'Review',
    author: {
      name: 'Rendy Pratama',
      role: 'Tech Lead & Gadget Reviewer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
    },
    publishDate: '15 Sep 2026',
    readTime: '7 min read',
    coverImage: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1000&auto=format&fit=crop',
    tags: ['MacBook', 'Apple Silicon', 'Laptop', 'Productivity'],
    likesCount: 412,
    viewsCount: 3100,
    contentId: `
### Neural Engine Generasi Terbaru untuk Komputasi AI

Chip M4 membawa Neural Engine 16-core yang mampu mengeksekusi lebih dari 38 triliun operasi per detik (TOPS). Hal ini membuat pemrosesan model LLM lokal dan fitur kecerdasan cerdas berjalan instan tanpa mengirim data ke cloud.

### Layar Liquid Retina XDR dengan Opsi Nano-Texture

Bagi para profesional visual yang sering bekerja di lingkungan berpencahayaan tinggi atau outdoor, opsi kaca nano-texture pada layar MacBook Pro M4 secara dramatis mengurangi pantulan cahaya tanpa mengorbankan kontras warna hitam pekat.

### Efisiensi Energi: Tetap Kencang Tanpa Colokan Listrik

Salah satu keunggulan terbesar MacBook Pro adalah performa yang tidak menurun meskipun bekerja menggunakan daya baterai, dengan masa pakai baterai riil mencapai 22 jam.
    `,
    contentEn: `
### Next-Gen Neural Engine for On-Device AI

The M4 chip packs a 16-core Neural Engine capable of over 38 TOPS, enabling snappy local LLM inferencing and generative features directly on device without cloud lag.

### Liquid Retina XDR with Nano-Texture Option

For creative pros working in bright studios or outdoor setups, the nano-texture glass minimizes glare while maintaining vibrant colors and deep blacks.

### Sustained Unplugged Performance

Unlike traditional x86 machines, MacBook Pro M4 delivers 100% peak performance even on battery, lasting up to 22 continuous hours of real-world use.
    `,
  },
  {
    id: 'blog-4',
    slug: '5-tips-merawat-tws-dan-headphone-agar-awet-bertahun-tahun',
    titleId: '5 Tips Merawat TWS & Headphone Wireless Agar Baterai & Suara Tetap Prima',
    titleEn: '5 Tips to Maintain Your Wireless Earbuds & Headphones for Years',
    excerptId: 'Panduan membersihkan driver suara, merawat kesehatan baterai lithium-ion, dan penyimpanan yang tepat agar terhindar dari kerusakan.',
    excerptEn: 'Guidelines on cleaning acoustic drivers, lithium-ion battery health tips, and proper storage practices.',
    category: 'Tips',
    author: {
      name: 'Dimas Kurniawan',
      role: 'Audio Engineer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
    },
    publishDate: '10 Sep 2026',
    readTime: '4 min read',
    coverImage: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1000&auto=format&fit=crop',
    tags: ['Audio', 'Headphone', 'Earbuds', 'Maintenance Tips'],
    likesCount: 195,
    viewsCount: 1420,
    contentId: `
### 1. Hindari Menguras Baterai Hingga 0%

Baterai lithium-ion pada earbuds TWS memiliki kapasitas kecil. Biasakan mengisi daya saat sisa baterai berada di kisaran 20%-30% untuk memperpanjang siklus umur baterai.

### 2. Bersihkan Mesh dan Eartips Secara Berkala

Kotoran telinga dan debu halus yang menempel pada mesh filter dapat menurunkan volume suara hingga 40%. Bersihkan dengan sikat berbulu halus dan cairan alkohol isopropil 70% secara lembut.

### 3. Jauhkan dari Kelembapan dan Suhu Ekstrem

Jangan tinggalkan TWS di dalam mobil yang terpapar terik matahari langsung, karena suhu di atas 45°C dapat merusak komponen baterai dan membran driver audio.
    `,
    contentEn: `
### 1. Avoid Draining to 0%

TWS batteries have small capacities. Recharging when reaching 20%-30% significantly extends battery health cycles.

### 2. Clean Eartips & Acoustic Mesh Regularly

Debris on mesh filters can diminish audio output by 40%. Gently clean with a soft brush and 70% isopropyl alcohol.

### 3. Avoid Extreme Heat and Moisture

Never leave earbuds inside a sun-baked car. Temperatures above 45°C degrade battery chemistry and acoustic membranes.
    `,
  },
];
