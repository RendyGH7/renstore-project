<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(UserSeeder::class);
    }

    public function test_customer_can_register(): void
    {
        $payload = [
            'name' => 'Budi Santoso',
            'email' => 'budi_new@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '08123456789',
            'address' => 'Jl. Merdeka No. 10',
        ];

        $response = $this->postJson('/api/auth/register', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'user' => ['id', 'name', 'email', 'role', 'phone', 'address'],
                    'token',
                ],
            ]);

        $this->assertEquals('customer', $response->json('data.user.role'));
    }

    public function test_user_can_login_with_correct_credentials(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'admin@renstore.com',
            'password' => 'admin123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'user',
                    'token',
                ],
            ]);

        $this->assertEquals('admin', $response->json('data.user.role'));
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'admin@renstore.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'status' => false,
            ]);
    }

    public function test_authenticated_user_can_access_profile(): void
    {
        $user = User::where('email', 'customer@renstore.com')->first();
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/auth/profile');

        $response->assertStatus(200)
            ->assertJsonPath('data.email', 'customer@renstore.com');
    }

    public function test_admin_can_access_admin_route_and_customer_is_forbidden(): void
    {
        $admin = User::where('email', 'admin@renstore.com')->first();
        \Laravel\Sanctum\Sanctum::actingAs($admin);

        $adminResponse = $this->getJson('/api/admin/ping');
        $adminResponse->assertStatus(200)
            ->assertJsonPath('status', true);

        $customer = User::where('email', 'customer@renstore.com')->first();
        \Laravel\Sanctum\Sanctum::actingAs($customer);

        $customerResponse = $this->getJson('/api/admin/ping');
        $customerResponse->assertStatus(403)
            ->assertJsonPath('status', false);
    }

    public function test_user_can_logout_and_revoke_token(): void
    {
        $user = User::where('email', 'customer@renstore.com')->first();
        $token = $user->createToken('logout_test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/auth/logout');

        $response->assertStatus(200)
            ->assertJsonPath('status', true);
    }
}
