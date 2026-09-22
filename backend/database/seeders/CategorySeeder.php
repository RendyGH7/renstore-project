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
                'name' => 'Fashion & Apparel',
                'slug' => 'fashion-apparel',
                'description' => 'Koleksi pakaian pria dan wanita dengan bahan premium dan potongan modern.',
                'image' => 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],
            [
                'name' => 'Electronics & Gadgets',
                'slug' => 'electronics-gadgets',
                'description' => 'Perangkat elektronik mutakhir, smartphone, audio hi-res, dan periferal komputasi.',
                'image' => 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],
            [
                'name' => 'Footwear & Sneakers',
                'slug' => 'footwear-sneakers',
                'description' => 'Sepatu sneakers autentik, sepatu lari ergonomis, dan alas kaki kasual berkualitas tinggi.',
                'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],
            [
                'name' => 'Accessories & Watches',
                'slug' => 'accessories-watches',
                'description' => 'Aksesoris gaya hidup, jam tangan mewah, kacamata hitam polaroid, dan tas kulit.',
                'image' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],
            [
                'name' => 'Home & Living',
                'slug' => 'home-living',
                'description' => 'Perlengkapan dekorasi minimalis, aromaterapi, dan perabot rumah kontemporer.',
                'image' => 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?q=80&w=800&auto=format&fit=crop',
                'is_active' => true,
            ],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(['slug' => $cat['slug']], $cat);
        }
    }
}
