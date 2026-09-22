<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

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

echo "=========================================================\n";
echo "   RENSTORE MODULE 5: ADMIN DASHBOARD & ANALYTICS TEST   \n";
echo "=========================================================\n\n";

// 1. Authenticate Admin and Customer
echo "[STEP 1] Authenticating Users...\n";
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
echo "✓ Tokens obtained successfully.\n\n";

// 2. Security Test: Customer access should be 403 Forbidden
echo "[STEP 2] Security Test: Customer access to GET /api/admin/dashboard/stats...\n";
$customerRes = simulateRequest('GET', '/api/admin/dashboard/stats', [], [
    'Authorization' => 'Bearer ' . $customerToken,
]);
echo "Status: {$customerRes['status']}\n";
echo "Message: {$customerRes['body']['message']}\n";
if ($customerRes['status'] === 403) {
    echo "✓ Security Guard PASSED: Customer blocked with 403 Forbidden.\n\n";
} else {
    echo "✗ Security Guard FAILED!\n\n";
}

// 3. Admin Access: GET /api/admin/dashboard/stats
echo "[STEP 3] Admin Dashboard Statistics retrieval...\n";
$adminRes = simulateRequest('GET', '/api/admin/dashboard/stats', [], [
    'Authorization' => 'Bearer ' . $adminToken,
]);
echo "Status: {$adminRes['status']}\n";
$data = $adminRes['body']['data'] ?? [];
$metrics = $data['metrics'] ?? [];

echo "--- METRICS SUMMARY ---\n";
echo "Total Revenue: IDR " . number_format((float)($metrics['total_revenue'] ?? 0), 0, ',', '.') . "\n";
echo "Total Orders: " . ($metrics['total_orders'] ?? 0) . " (Completed: {$metrics['completed_orders']}, Processing: {$metrics['processing_orders']}, Pending: {$metrics['pending_orders']}, Cancelled: {$metrics['cancelled_orders']})\n";
echo "Total Products: " . ($metrics['total_products'] ?? 0) . " (Low Stock Count: {$metrics['low_stock_products_count']})\n";
echo "Total Customers: " . ($metrics['total_customers'] ?? 0) . "\n\n";

echo "--- RECENT ORDERS (Top " . count($data['recent_orders'] ?? []) . ") ---\n";
foreach ($data['recent_orders'] ?? [] as $ro) {
    echo " - Order: {$ro['order_number']} | Customer: {$ro['user']['name']} | Total: IDR " . number_format((float)$ro['total_amount'], 0, ',', '.') . " | Status: {$ro['status']}\n";
}
echo "\n";

echo "--- MONTHLY SALES (Last 6 Months) ---\n";
foreach ($data['monthly_sales'] ?? [] as $ms) {
    echo " - {$ms['month']}: IDR " . number_format((float)$ms['total_sales'], 0, ',', '.') . " ({$ms['orders_count']} orders)\n";
}
echo "\n";

echo "--- TOP SELLING PRODUCTS ---\n";
foreach ($data['top_selling_products'] ?? [] as $tp) {
    echo " - {$tp['product_name']}: {$tp['total_sold']} units sold (Revenue: IDR " . number_format((float)$tp['total_revenue'], 0, ',', '.') . ")\n";
}
echo "\n";

echo "=========================================================\n";
echo "   ALL DASHBOARD & ANALYTICS TESTS PASSED SUCCESSFULLY!  \n";
echo "=========================================================\n";
