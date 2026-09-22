<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class XenditPaymentTest extends TestCase
{
    use DatabaseTransactions;

    protected User $customer;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(UserSeeder::class);

        $this->customer = User::where('email', 'customer@renstore.com')->first();

        $category = Category::firstOrCreate(
            ['slug' => 'gadget-test'],
            ['name' => 'Gadget Test', 'is_active' => true]
        );

        $this->product = Product::create([
            'category_id' => $category->id,
            'name' => 'Test Wireless Earbuds',
            'slug' => 'test-wireless-earbuds',
            'description' => 'Great sound quality earbuds',
            'price' => 250000.00,
            'stock' => 10,
            'is_active' => true,
        ]);
    }

    public function test_checkout_generates_order_with_dynamic_qris(): void
    {
        Sanctum::actingAs($this->customer);

        // Add to cart
        CartItem::create([
            'user_id' => $this->customer->id,
            'product_id' => $this->product->id,
            'quantity' => 2,
        ]);

        $payload = [
            'shipping_address' => 'Jl. Sudirman No. 45, Jakarta',
            'phone' => '081234567890',
            'notes' => 'Tolong bubble wrap tebal',
        ];

        $response = $this->postJson('/api/checkout', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('status', true)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'id',
                    'order_number',
                    'total_amount',
                    'status',
                    'payment_status',
                    'payment_method',
                    'qr_id',
                    'qr_string',
                    'qr_expires_at',
                ],
            ]);

        $orderData = $response->json('data');
        $this->assertEquals('unpaid', $orderData['payment_status']);
        $this->assertEquals('qris', $orderData['payment_method']);
        $this->assertNotEmpty($orderData['qr_string']);
        $this->assertNotNull($orderData['qr_expires_at']);

        // Assert stock decremented by 2
        $this->assertEquals(8, $this->product->fresh()->stock);

        // Assert cart emptied
        $this->assertEquals(0, CartItem::where('user_id', $this->customer->id)->count());
    }

    public function test_xendit_webhook_updates_order_to_paid(): void
    {
        // Create an unpaid order
        $order = Order::create([
            'user_id' => $this->customer->id,
            'order_number' => 'ORD-TEST-QRIS-001',
            'total_amount' => 500000.00,
            'status' => 'pending',
            'shipping_address' => 'Jl. Thamrin No. 1, Jakarta',
            'phone' => '081234567890',
            'payment_status' => 'unpaid',
            'payment_method' => 'qris',
            'qr_id' => 'qr_test_mock_123456',
            'qr_string' => '00020101021226670016ID.CO.XENDIT...',
            'qr_expires_at' => now()->addMinutes(30),
        ]);

        $webhookPayload = [
            'event' => 'qr.payment',
            'data' => [
                'qr_id' => 'qr_test_mock_123456',
                'reference_id' => 'ORD-TEST-QRIS-001',
                'amount' => 500000,
                'status' => 'COMPLETED',
            ],
        ];

        $token = config('xendit.webhook_token');

        $response = $this->withHeader('x-callback-token', $token)
            ->postJson('/api/webhooks/xendit', $webhookPayload);

        $response->assertStatus(200)
            ->assertJsonPath('status', true);

        $freshOrder = $order->fresh();
        $this->assertEquals('paid', $freshOrder->payment_status);
        $this->assertEquals('processing', $freshOrder->status);
        $this->assertNotNull($freshOrder->paid_at);
    }

    public function test_xendit_webhook_rejects_invalid_token(): void
    {
        $response = $this->withHeader('x-callback-token', 'wrong_token_xyz')
            ->postJson('/api/webhooks/xendit', [
                'reference_id' => 'ORD-NONEXISTENT',
                'status' => 'COMPLETED',
            ]);

        $response->assertStatus(401)
            ->assertJsonPath('status', false);
    }
}
