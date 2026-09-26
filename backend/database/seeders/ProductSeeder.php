<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds with pure white / isolated studio cutout images.
     */
    public function run(): void
    {
        $electronics = Category::where('slug', 'electronics-gadgets')->first();
        $laptops = Category::where('slug', 'laptops-computers')->first();
        $audio = Category::where('slug', 'audio-headphones')->first();
        $gaming = Category::where('slug', 'gaming-consoles')->first();
        $smartwatches = Category::where('slug', 'smartwatches-wearables')->first();
        $cameras = Category::where('slug', 'cameras-photography')->first();
        $fashion = Category::where('slug', 'fashion-apparel')->first();
        $footwear = Category::where('slug', 'footwear-sneakers')->first();
        $accessories = Category::where('slug', 'accessories-watches')->first();
        $home = Category::where('slug', 'home-living')->first();
        $health = Category::where('slug', 'health-sports')->first();
        $beauty = Category::where('slug', 'beauty-care')->first();

        $products = [
            // Electronics & Gadgets
            [
                'category_id' => $electronics ? $electronics->id : 1,
                'name' => 'Apple iPhone 16 Pro Max 256GB Natural Titanium',
                'slug' => 'apple-iphone-16-pro-max-natural-titanium',
                'description' => 'Smartphone flagship Apple dengan chip A18 Pro, Camera Control tactile button, dan bodi titanium kelas kedirgantaraan.',
                'price' => 24999000.00,
                'stock' => 20,
                'image_url' => 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],
            [
                'category_id' => $electronics ? $electronics->id : 1,
                'name' => 'Samsung Galaxy S24 Ultra 5G Titanium Black',
                'slug' => 'samsung-galaxy-s24-ultra-5g-black',
                'description' => 'Galaxy AI terintegrasi, stylus S-Pen built-in, layar 120Hz Dynamic AMOLED 2X, dan kamera 200MP Quad Tele System.',
                'price' => 21499000.00,
                'stock' => 15,
                'image_url' => 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],

            // Laptops & Computers
            [
                'category_id' => $laptops ? $laptops->id : 1,
                'name' => 'MacBook Pro 14 M4 Pro Chip 512GB Space Black',
                'slug' => 'macbook-pro-14-m4-pro-space-black',
                'description' => 'Performa profesional bertenaga chip Apple M4 Pro dengan Liquid Retina XDR display dan daya tahan baterai hingga 24 jam.',
                'price' => 31999000.00,
                'stock' => 10,
                'image_url' => 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],
            [
                'category_id' => $laptops ? $laptops->id : 1,
                'name' => 'Keychron K2 Pro Wireless Custom Mechanical Keyboard',
                'slug' => 'keychron-k2-pro-mechanical-keyboard',
                'description' => 'Keyboard mekanikal nirkabel 75% dengan switch QMK/VIA programmable, RGB backlight, dan kompatibilitas Mac OS & Windows.',
                'price' => 1750000.00,
                'stock' => 40,
                'image_url' => 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],

            // Audio & Sound
            [
                'category_id' => $audio ? $audio->id : 1,
                'name' => 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
                'slug' => 'sony-wh-1000xm5-wireless-headphones',
                'description' => 'Headphone peredam bising nirkabel unggulan dengan prosesor V1 terintegrasi, 8 mikrofon crystal clear, dan baterai 30 jam.',
                'price' => 4999000.00,
                'stock' => 25,
                'image_url' => 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],
            [
                'category_id' => $audio ? $audio->id : 1,
                'name' => 'Marshall Emberton II Portable Bluetooth Speaker Cream',
                'slug' => 'marshall-emberton-ii-speaker-cream',
                'description' => 'Speaker bluetooth kompak ikonik dengan True Stereophonic 360 sound, ketahanan air IP67, dan waktu putar 30+ jam.',
                'price' => 2899000.00,
                'stock' => 22,
                'image_url' => 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],

            // Gaming & Consoles
            [
                'category_id' => $gaming ? $gaming->id : 1,
                'name' => 'Sony PlayStation 5 Slim Digital Edition White',
                'slug' => 'sony-playstation-5-slim-digital',
                'description' => 'Konsol generasi terbaru dengan SSD ultra-cepat 1TB, ray tracing realistis, audio 3D Tempest, dan haptic feedback DualSense.',
                'price' => 7999000.00,
                'stock' => 12,
                'image_url' => 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],

            // Smartwatches & Wearables
            [
                'category_id' => $smartwatches ? $smartwatches->id : 1,
                'name' => 'Apple Watch Series 9 GPS 45mm Midnight Aluminium',
                'slug' => 'apple-watch-series-9-gps-45mm',
                'description' => 'Smartwatch canggih dengan sensor kesehatan terdepan, layar Always-On Retina ultra cerah, dan gesture Double Tap.',
                'price' => 6799000.00,
                'stock' => 18,
                'image_url' => 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],

            // Cameras & Photography
            [
                'category_id' => $cameras ? $cameras->id : 1,
                'name' => 'Sony Alpha 7 IV Full-Frame Mirrorless Camera Body',
                'slug' => 'sony-alpha-7-iv-mirrorless-camera',
                'description' => 'Kamera hybrid profesional 33MP Exmor R sensor, perekaman 4K 60p 10-bit 4:2:2, dan real-time Eye AF cerdas.',
                'price' => 34999000.00,
                'stock' => 8,
                'image_url' => 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],

            // Footwear & Sneakers
            [
                'category_id' => $footwear ? $footwear->id : 1,
                'name' => 'Nike Air Jordan 1 Retro High OG - Chicago Reimagined',
                'slug' => 'nike-air-jordan-1-retro-high-og',
                'description' => 'Sneakers legendaris berbalut kulit premium dengan siluet ikonik Chicago Bulls vintage look dan bantalan Air-Sole.',
                'price' => 3299000.00,
                'stock' => 15,
                'image_url' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],
            [
                'category_id' => $footwear ? $footwear->id : 1,
                'name' => 'Adidas Ultraboost Light Running Shoes Core Black',
                'slug' => 'adidas-ultraboost-light-core-black',
                'description' => 'Sepatu lari terdepan dengan teknologi busa BOOST 30% lebih ringan, outsole Continental Rubber, dan upper Primeknit+ ramah lingkungan.',
                'price' => 2850000.00,
                'stock' => 32,
                'image_url' => 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],
            [
                'category_id' => $footwear ? $footwear->id : 1,
                'name' => 'New Balance 990v6 Made in USA Castlerock Grey',
                'slug' => 'new-balance-990v6-castlerock-grey',
                'description' => 'Sneakers warisan lifestyle Amerika dengan bantalan midsole FuelCell dan ENCAP yang nyaman untuk pemakaian harian sepanjang hari.',
                'price' => 4199000.00,
                'stock' => 12,
                'image_url' => 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],

            // Fashion & Apparel
            [
                'category_id' => $fashion ? $fashion->id : 1,
                'name' => 'Heavyweight Oversized Streetwear T-Shirt Charcoal Grey',
                'slug' => 'heavyweight-oversized-streetwear-tshirt',
                'description' => 'Kaos oversized 100% Cotton Combed 24s dengan potongan drop-shoulder modern dan konstruksi jahitan ganda yang tahan lama.',
                'price' => 189000.00,
                'stock' => 85,
                'image_url' => 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],
            [
                'category_id' => $fashion ? $fashion->id : 1,
                'name' => 'Japanese Selvedge Denim Jacket Deep Indigo',
                'slug' => 'japanese-selvedge-denim-jacket',
                'description' => 'Jaket denim otentik berbahan 14oz Japanese Raw Selvedge Denim dengan kancing kuningan kustom dan aksen fade alami.',
                'price' => 899000.00,
                'stock' => 20,
                'image_url' => 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],

            // Accessories & Watches
            [
                'category_id' => $accessories ? $accessories->id : 1,
                'name' => 'Seiko Prospex Automatic Diver 200M "King Turtle"',
                'slug' => 'seiko-prospex-automatic-diver-king-turtle',
                'description' => 'Jam tangan penyelam profesional otomatis caliber 4R36 dengan sapphire crystal anti-gores dan dial bermotif gelombang laut.',
                'price' => 7450000.00,
                'stock' => 10,
                'image_url' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],
            [
                'category_id' => $accessories ? $accessories->id : 1,
                'name' => 'Minimalist Full-Grain Leather Bi-Fold Wallet Tan Brown',
                'slug' => 'minimalist-leather-bifold-wallet',
                'description' => 'Dompet pria kulit sapi asli jenis crazy horse leather dengan proteksi RFID blocking dan slot 8 kartu ergonomis.',
                'price' => 299000.00,
                'stock' => 60,
                'image_url' => 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],

            // Home & Living
            [
                'category_id' => $home ? $home->id : 1,
                'name' => 'Smart Ultrasonic Aroma Diffuser & Ambient Warm LED',
                'slug' => 'smart-ultrasonic-aroma-diffuser',
                'description' => 'Diffuser aromaterapi ultrasonik 500ml dengan kontrol aplikasi pintar, auto shut-off, dan lampu tidur warm white menenangkan.',
                'price' => 450000.00,
                'stock' => 35,
                'image_url' => 'https://images.unsplash.com/photo-1585565804112-f201f68c48b4?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],
            [
                'category_id' => $home ? $home->id : 1,
                'name' => 'Nordic Ceramic Coffee Mug & Saucer Set Matte Sand',
                'slug' => 'nordic-ceramic-coffee-mug-set',
                'description' => 'Cangkir kopi keramik buatan tangan berkapasitas 320ml dengan piring tatakan estetik bergaya kafe Skandinavia.',
                'price' => 175000.00,
                'stock' => 50,
                'image_url' => 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],

            // Health & Sports
            [
                'category_id' => $health ? $health->id : 1,
                'name' => 'Hydro Stainless Steel Vacuum Insulated Water Bottle 1000ml',
                'slug' => 'hydro-stainless-steel-bottle-1000ml',
                'description' => 'Botol minum insulasi ganda menjaga minuman dingin hingga 24 jam dan panas hingga 12 jam, bebas BPA dan anti bocor.',
                'price' => 350000.00,
                'stock' => 40,
                'image_url' => 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],

            // Beauty & Personal Care
            [
                'category_id' => $beauty ? $beauty->id : 1,
                'name' => 'Sonic Facial Cleansing Device & Anti-Aging Massager',
                'slug' => 'sonic-facial-cleansing-device',
                'description' => 'Pembersih wajah silikon sonik ultra-lembut tahan air IPX7 dengan mode getar pulse T-Sonic untuk pori-pori bersih maksimal.',
                'price' => 620000.00,
                'stock' => 30,
                'image_url' => 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],
        ];

        foreach ($products as $prod) {
            Product::updateOrCreate(['slug' => $prod['slug']], $prod);
        }
    }
}
