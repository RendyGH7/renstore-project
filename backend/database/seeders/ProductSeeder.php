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
        $fashion = Category::where('slug', 'fashion-apparel')->first();
        $electronics = Category::where('slug', 'electronics-gadgets')->first();
        $footwear = Category::where('slug', 'footwear-sneakers')->first();
        $accessories = Category::where('slug', 'accessories-watches')->first();
        $home = Category::where('slug', 'home-living')->first();

        $products = [
            // Electronics & Gadgets
            [
                'category_id' => $electronics->id,
                'name' => 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
                'slug' => 'sony-wh-1000xm5-wireless-headphones',
                'description' => 'Headphone peredam bising nirkabel unggulan dengan prosesor V1 terintegrasi, 8 mikrofon untuk panggilan sebening kristal, dan daya tahan baterai hingga 30 jam.',
                'price' => 4999000.00,
                'stock' => 25,
                'image_url' => 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],
            [
                'category_id' => $electronics->id,
                'name' => 'Keychron K2 Pro Wireless Custom Mechanical Keyboard',
                'slug' => 'keychron-k2-pro-mechanical-keyboard',
                'description' => 'Keyboard mekanikal nirkabel 75% dengan switch QMK/VIA programmable, RGB backlight, dan kompatibilitas penuh untuk Mac OS & Windows.',
                'price' => 1750000.00,
                'stock' => 40,
                'image_url' => 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],
            [
                'category_id' => $electronics->id,
                'name' => 'Apple Watch Series 9 GPS 45mm Midnight Aluminium',
                'slug' => 'apple-watch-series-9-gps-45mm',
                'description' => 'Smartwatch paling canggih dengan sensor kesehatan terdepan, layar Always-On Retina ultra cerah, dan gesture Double Tap.',
                'price' => 6799000.00,
                'stock' => 18,
                'image_url' => 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],

            // Footwear & Sneakers
            [
                'category_id' => $footwear->id,
                'name' => 'Nike Air Jordan 1 Retro High OG - Chicago Reimagined',
                'slug' => 'nike-air-jordan-1-retro-high-og',
                'description' => 'Sneakers legendaris berbalut kulit premium dengan siluet ikonik Chicago Bulls vintage look dan bantalan Air-Sole.',
                'price' => 3299000.00,
                'stock' => 15,
                'image_url' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],
            [
                'category_id' => $footwear->id,
                'name' => 'Adidas Ultraboost Light Running Shoes Core Black',
                'slug' => 'adidas-ultraboost-light-core-black',
                'description' => 'Sepatu lari terdepan dengan teknologi busa BOOST 30% lebih ringan, outsole Continental Rubber, dan upper Primeknit+ ramah lingkungan.',
                'price' => 2850000.00,
                'stock' => 32,
                'image_url' => 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],
            [
                'category_id' => $footwear->id,
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
                'category_id' => $fashion->id,
                'name' => 'Heavyweight Oversized Streetwear T-Shirt Charcoal Grey',
                'slug' => 'heavyweight-oversized-streetwear-tshirt',
                'description' => 'Kaos oversized 100% Cotton Combed 24s dengan potongan drop-shoulder modern dan konstruksi jahitan ganda yang tahan lama.',
                'price' => 189000.00,
                'stock' => 85,
                'image_url' => 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],
            [
                'category_id' => $fashion->id,
                'name' => 'Japanese Selvedge Denim Jacket Deep Indigo',
                'slug' => 'japanese-selvedge-denim-jacket',
                'description' => 'Jaket denim otentik berbahan 14oz Japanese Raw Selvedge Denim dengan kancing kuningan kustom dan aksen fade alami.',
                'price' => 899000.00,
                'stock' => 20,
                'image_url' => 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],
            [
                'category_id' => $fashion->id,
                'name' => 'Relaxed Fit Linen Blend Summer Shirt Sand Beige',
                'slug' => 'relaxed-fit-linen-summer-shirt',
                'description' => 'Kemeja santai kerah terbuka berbahan perpaduan linen organik dan katun yang adem dan elegan untuk cuaca tropis.',
                'price' => 349000.00,
                'stock' => 45,
                'image_url' => 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],

            // Accessories & Watches
            [
                'category_id' => $accessories->id,
                'name' => 'Seiko Prospex Automatic Diver 200M "King Turtle"',
                'slug' => 'seiko-prospex-automatic-diver-king-turtle',
                'description' => 'Jam tangan penyelam profesional otomatis caliber 4R36 dengan sapphire crystal anti-gores dan dial bermotif gelombang laut.',
                'price' => 7450000.00,
                'stock' => 10,
                'image_url' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],
            [
                'category_id' => $accessories->id,
                'name' => 'Minimalist Full-Grain Leather Bi-Fold Wallet Tan Brown',
                'slug' => 'minimalist-leather-bifold-wallet',
                'description' => 'Dompet pria kulit sapi asli jenis crazy horse leather dengan proteksi RFID blocking dan slot 8 kartu ergonomis.',
                'price' => 299000.00,
                'stock' => 60,
                'image_url' => 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],
            [
                'category_id' => $accessories->id,
                'name' => 'Ray-Ban Wayfarer Classic Polarized Sunglasses Tortoise',
                'slug' => 'ray-ban-wayfarer-classic-polarized',
                'description' => 'Kacamata hitam legendaris frame asetat motif tempurung kura-kura dengan lensa hijau G-15 perlindungan 100% UV.',
                'price' => 2450000.00,
                'stock' => 22,
                'image_url' => 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],

            // Home & Living
            [
                'category_id' => $home->id,
                'name' => 'Smart Ultrasonic Aroma Diffuser & Ambient Warm LED',
                'slug' => 'smart-ultrasonic-aroma-diffuser',
                'description' => 'Diffuser aromaterapi ultrasonik 500ml dengan kontrol aplikasi pintar, auto shut-off, dan lampu tidur warm white menenangkan.',
                'price' => 450000.00,
                'stock' => 35,
                'image_url' => 'https://images.unsplash.com/photo-1585565804112-f201f68c48b4?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],
            [
                'category_id' => $home->id,
                'name' => 'Nordic Ceramic Coffee Mug & Saucer Set Matte Sand',
                'slug' => 'nordic-ceramic-coffee-mug-set',
                'description' => 'Cangkir kopi keramik buatan tangan berkapasitas 320ml dengan piring tatakan estetik bergaya kafe Skandinavia.',
                'price' => 175000.00,
                'stock' => 50,
                'image_url' => 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],
            [
                'category_id' => $home->id,
                'name' => 'Minimalist Walnut Wood Wireless Charging Pad 15W',
                'slug' => 'walnut-wood-wireless-charging-pad',
                'description' => 'Pad pengisi daya nirkabel fast-charging 15W berlapis kayu walnut solid alami dengan proteksi temperatur cerdas.',
                'price' => 399000.00,
                'stock' => 28,
                'image_url' => 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],
        ];

        foreach ($products as $prod) {
            Product::updateOrCreate(['slug' => $prod['slug']], $prod);
        }
    }
}
