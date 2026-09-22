<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin User
        User::updateOrCreate(
            ['email' => 'admin@renstore.com'],
            [
                'name' => 'Administrator Renstore',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'phone' => '081234567890',
                'address' => 'Jakarta, Indonesia',
                'email_verified_at' => now(),
            ]
        );

        // Customer User
        User::updateOrCreate(
            ['email' => 'customer@renstore.com'],
            [
                'name' => 'Rendy Customer',
                'password' => Hash::make('password123'),
                'role' => 'customer',
                'phone' => '089876543210',
                'address' => 'Bandung, Indonesia',
                'email_verified_at' => now(),
            ]
        );
    }
}
