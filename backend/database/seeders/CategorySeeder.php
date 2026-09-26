<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Electronics & Gadgets',
                'slug' => 'electronics-gadgets',
                'description' => 'Smartphone mutakhir, tablet layar jernih, dan gadget pintar pendukung produktivitas.',
                'image' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Laptops & Computers',
                'slug' => 'laptops-computers',
                'description' => 'Laptop premium, PC desktop powerful, monitor resolusi tinggi, dan periferal komputasi.',
                'image' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Audio & Sound',
                'slug' => 'audio-headphones',
                'description' => 'Headphone Hi-Res ANC, true wireless earbuds, soundbar bioskop, dan speaker bluetooth portabel.',
                'image' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Gaming & Consoles',
                'slug' => 'gaming-consoles',
                'description' => 'Konsol game generasi terbaru, gamepad presisi tinggi, kursi gaming, dan aksesori VR.',
                'image' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Smartwatches & Wearables',
                'slug' => 'smartwatches-wearables',
                'description' => 'Jam tangan pintar pendeteksi kesehatan akurat, smart band sporty, dan smart ring futuristik.',
                'image' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Cameras & Photography',
                'slug' => 'cameras-photography',
                'description' => 'Kamera mirrorless profesional, action cam 4K, lensa tajam, dan gimbal stabilizer.',
                'image' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Fashion & Apparel',
                'slug' => 'fashion-apparel',
                'description' => 'Koleksi pakaian streetwear, kemeja katun linen, outer premium, dan kaos kasual modern.',
                'image' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Footwear & Sneakers',
                'slug' => 'footwear-sneakers',
                'description' => 'Sepatu sneakers autentik, sepatu lari ergonomis, dan alas kaki kasual berkualitas tinggi.',
                'image' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Accessories & Watches',
                'slug' => 'accessories-watches',
                'description' => 'Jam tangan mekanik klasik, kacamata hitam polarized, dompet kulit, dan tas minimalis.',
                'image' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Home & Living',
                'slug' => 'home-living',
                'description' => 'Perlengkapan dekorasi minimalis, diffuser aromaterapi, lampu estetik, dan perabot rumah kontemporer.',
                'image' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Health & Sports',
                'slug' => 'health-sports',
                'description' => 'Peralatan gym rumahan, botol minum vacuum insulated, matras yoga, dan suplemen olahraga.',
                'image' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Beauty & Personal Care',
                'slug' => 'beauty-care',
                'description' => 'Perawatan kulit wajah modern, hair styling tools, pembersih sonik, dan parfum eksklusif.',
                'image' => null,
                'is_active' => true,
            ],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(['slug' => $cat['slug']], $cat);
        }
    }
}
