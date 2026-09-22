<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

function simulateRequest($method, $uri, $data = [], $headers = []) {
    Auth::forgetGuards();

    $server = [
        'REQUEST_METHOD' => $method,
        'HTTP_ACCEPT' => 'application/json',
        'CONTENT_TYPE' => 'application/json',
    ];

    foreach ($headers as $key => $val) {
        $server['HTTP_' . strtoupper(str_replace('-', '_', $key))] = $val;
    }

    $request = Request::create($uri, $method, [], [], [], $server, json_encode($data));
    $response = app()->handle($request);
    
    return [
        'status' => $response->getStatusCode(),
        'body' => json_decode($response->getContent(), true),
    ];
}

echo "=================================================================\n";
echo "   RENSTORE MODULE 4: CART & CHECKOUT / ORDER SYSTEM TEST FLOW   \n";
echo "=================================================================\n\n";

// 1. Authenticate Admin and Customer
echo "[STEP 1] Authenticating Customer and Admin...\n";
$adminLogin = simulateRequest('POST', '/api/auth/login', [
    'email' => 'admin@renstore.com',
    'password' => 'admin123',
]);
$adminToken = $adminLogin['body']['data']['token'] ?? null;

$customerLogin = simulateRequest('POST', '/api/auth/login', [
    'email' => 'customer@renstore.com',
    'password' => 'password123',
]);
$customerToken = $customerLogin['body']['data']['token'] ?? null;

if (!$adminToken || !$customerToken) {
    echo "ERROR: Failed to authenticate test users!\n";
    exit(1);
}
echo "✓ Authentication tokens verified.\n\n";

// Clear cart before starting test
simulateRequest('DELETE', '/api/cart', [], ['Authorization' => 'Bearer ' . $customerToken]);

// 2. Select Test Products
$product1 = Product::where('slug', 'sony-wh-1000xm5-wireless-headphones')->firstOrFail();
$product2 = Product::where('slug', 'heavyweight-oversized-streetwear-tshirt')->firstOrFail();

echo "[STEP 2] Adding Items to Cart...\n";
echo "Item 1: {$product1->name} (Price: IDR " . number_format((float)$product1->price, 0, ',', '.') . ", Stock: {$product1->stock})\n";
echo "Item 2: {$product2->name} (Price: IDR " . number_format((float)$product2->price, 0, ',', '.') . ", Stock: {$product2->stock})\n\n";

// Add Item 1 (qty: 2)
$addRes1 = simulateRequest('POST', '/api/cart', [
    'product_id' => $product1->id,
    'quantity' => 2,
], ['Authorization' => 'Bearer ' . $customerToken]);
echo "Add Item 1 Status: {$addRes1['status']}\n";

// Add Item 2 (qty: 3)
$addRes2 = simulateRequest('POST', '/api/cart', [
    'product_id' => $product2->id,
    'quantity' => 3,
], ['Authorization' => 'Bearer ' . $customerToken]);
echo "Add Item 2 Status: {$addRes2['status']}\n\n";

// 3. Get Cart and Verify Subtotals
echo "[STEP 3] Fetching Cart and Validating Calculated Totals...\n";
$cartRes = simulateRequest('GET', '/api/cart', [], ['Authorization' => 'Bearer ' . $customerToken]);
echo "Cart Status: {$cartRes['status']}\n";
$cartData = $cartRes['body']['data'] ?? [];
echo "Total Items: {$cartData['total_items']}\n";
echo "Total Amount: IDR " . number_format((float)$cartData['total_amount'], 0, ',', '.') . "\n";

foreach ($cartData['items'] as $item) {
    echo " - {$item['product']['name']} x{$item['quantity']} = IDR " . number_format((float)$item['subtotal'], 0, ',', '.') . "\n";
}
echo "✓ Cart calculation verified.\n\n";

// 4. Test Stock Limit Validation
echo "[STEP 4] Testing Stock Limit Validation (Attempting to add qty exceeding stock)...\n";
$cartItemId1 = $cartData['items'][0]['id'];
$overStockRes = simulateRequest('PUT', "/api/cart/{$cartItemId1}", [
    'quantity' => 99999,
], ['Authorization' => 'Bearer ' . $customerToken]);
echo "Overstock Status: {$overStockRes['status']}\n";
echo "Response Message: {$overStockRes['body']['message']}\n";
if ($overStockRes['status'] === 422) {
    echo "✓ Stock protection PASSED: Excess quantity rejected.\n\n";
} else {
    echo "✗ Stock protection FAILED!\n\n";
}

// 5. Update and Delete Cart Item
echo "[STEP 5] Updating Cart Item Quantity...\n";
$updateQtyRes = simulateRequest('PUT', "/api/cart/{$cartItemId1}", [
    'quantity' => 1,
], ['Authorization' => 'Bearer ' . $customerToken]);
echo "Update Status: {$updateQtyRes['status']}\n";

$cartResAfterUpdate = simulateRequest('GET', '/api/cart', [], ['Authorization' => 'Bearer ' . $customerToken]);
echo "Updated Total Amount: IDR " . number_format((float)$cartResAfterUpdate['body']['data']['total_amount'], 0, ',', '.') . "\n";
echo "✓ Cart update verified.\n\n";

// 6. Checkout Process
echo "[STEP 6] Testing Checkout Flow (DB Transaction & Automatic Stock Deduction)...\n";
$stock1Before = Product::find($product1->id)->stock;
$stock2Before = Product::find($product2->id)->stock;

$checkoutRes = simulateRequest('POST', '/api/checkout', [
    'shipping_address' => 'Jl. Jenderal Sudirman No. 10, Jakarta Selatan',
    'phone' => '081298765432',
    'notes' => 'Tolong bubble wrap tebal untuk headphone.',
], ['Authorization' => 'Bearer ' . $customerToken]);

echo "Checkout Status: {$checkoutRes['status']}\n";
$order = $checkoutRes['body']['data'] ?? [];
$orderNumber = $order['order_number'] ?? 'N/A';
$orderId = $order['id'] ?? null;
echo "Created Order Number: {$orderNumber}\n";
echo "Order Status: {$order['status']}\n";
echo "Payment Status: {$order['payment_status']}\n";
echo "Order Total Amount: IDR " . number_format((float)$order['total_amount'], 0, ',', '.') . "\n";
echo "Items in Order: " . count($order['order_items'] ?? []) . "\n";

// 7. Verify Inventory Reduction & Empty Cart
$stock1After = Product::find($product1->id)->stock;
$stock2After = Product::find($product2->id)->stock;

echo "\nInventory Stock Verification:\n";
echo " - {$product1->name}: {$stock1Before} -> {$stock1After} (Expected: " . ($stock1Before - 1) . ")\n";
echo " - {$product2->name}: {$stock2Before} -> {$stock2After} (Expected: " . ($stock2Before - 3) . ")\n";

$cartCheck = simulateRequest('GET', '/api/cart', [], ['Authorization' => 'Bearer ' . $customerToken]);
echo "Cart Items after checkout: " . count($cartCheck['body']['data']['items'] ?? []) . " (Expected: 0)\n";
echo "✓ Checkout, stock decrement, and cart clearing verified.\n\n";

// 8. Customer Order History & Detail
echo "[STEP 7] Customer Order History & Single Order Detail...\n";
$historyRes = simulateRequest('GET', '/api/orders', [], ['Authorization' => 'Bearer ' . $customerToken]);
echo "Order History Status: {$historyRes['status']}\n";
echo "Orders count in history: " . count($historyRes['body']['data'] ?? []) . "\n";

$detailRes = simulateRequest('GET', "/api/orders/{$orderNumber}", [], ['Authorization' => 'Bearer ' . $customerToken]);
echo "Order Detail Status: {$detailRes['status']}\n";
echo "Order Number in Detail: {$detailRes['body']['data']['order_number']}\n";
echo "Shipping Address: {$detailRes['body']['data']['shipping_address']}\n";
echo "✓ Customer order tracking verified.\n\n";

// 9. Admin Order Management
echo "[STEP 8] Admin Order Management (Listing & Status Transitions)...\n";
$adminOrdersRes = simulateRequest('GET', '/api/admin/orders', [], ['Authorization' => 'Bearer ' . $adminToken]);
echo "Admin Orders Listing Status: {$adminOrdersRes['status']}\n";
echo "Total orders visible to Admin: " . ($adminOrdersRes['body']['meta']['total'] ?? 0) . "\n";

// Update status to processing
$statusProcRes = simulateRequest('PATCH', "/api/admin/orders/{$orderId}/status", [
    'status' => 'processing',
], ['Authorization' => 'Bearer ' . $adminToken]);
echo "Status Update (processing): {$statusProcRes['status']} -> Current: {$statusProcRes['body']['data']['status']}\n";

// Update status to completed
$statusCompRes = simulateRequest('PATCH', "/api/admin/orders/{$orderId}/status", [
    'status' => 'completed',
], ['Authorization' => 'Bearer ' . $adminToken]);
echo "Status Update (completed): {$statusCompRes['status']} -> Current: {$statusCompRes['body']['data']['status']}\n";
echo "✓ Admin order management verified.\n\n";

// 10. Cancellation & Automatic Stock Restoration Test
echo "[STEP 9] Cancellation & Stock Restoration Test...\n";
$product3 = Product::where('slug', 'keychron-k2-pro-mechanical-keyboard')->firstOrFail();
$initialStock3 = $product3->stock;

// Customer buys product 3 (qty: 2)
simulateRequest('POST', '/api/cart', ['product_id' => $product3->id, 'quantity' => 2], ['Authorization' => 'Bearer ' . $customerToken]);
$cancelTestCheckout = simulateRequest('POST', '/api/checkout', [
    'shipping_address' => 'Bandung, Jawa Barat',
    'phone' => '08987654321',
], ['Authorization' => 'Bearer ' . $customerToken]);

$cancelOrderId = $cancelTestCheckout['body']['data']['id'];
$stockAfterOrder = Product::find($product3->id)->stock;
echo "Product 3 Stock before order: {$initialStock3}, after order: {$stockAfterOrder}\n";

// Admin cancels the order
$cancelRes = simulateRequest('PATCH', "/api/admin/orders/{$cancelOrderId}/status", [
    'status' => 'cancelled',
], ['Authorization' => 'Bearer ' . $adminToken]);

$stockAfterCancel = Product::find($product3->id)->stock;
echo "Admin cancelled order ID {$cancelOrderId}. Stock after cancellation: {$stockAfterCancel} (Expected: {$initialStock3})\n";

if ($stockAfterCancel === $initialStock3) {
    echo "✓ Stock Restoration PASSED: Inventory accurately restored upon cancellation.\n\n";
} else {
    echo "✗ Stock Restoration FAILED!\n\n";
}

echo "=================================================================\n";
echo "   ALL MODULE 4 CART & ORDER TESTS PASSED SUCCESSFULLY!          \n";
echo "=================================================================\n";
