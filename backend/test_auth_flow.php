<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

function simulateRequest($method, $uri, $data = [], $headers = []) {
    // Reset cached auth state across simulated requests in the same process
    \Illuminate\Support\Facades\Auth::forgetGuards();

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

echo "=== TESTING RENSTORE AUTHENTICATION API ===\n\n";

// 1. Test Register
echo "1. Testing POST /api/auth/register (Customer Registration)...\n";
$uniqueEmail = 'rendy_' . time() . '@example.com';
$registerRes = simulateRequest('POST', '/api/auth/register', [
    'name' => 'Rendy User',
    'email' => $uniqueEmail,
    'password' => 'password123',
    'password_confirmation' => 'password123',
    'phone' => '08123456789',
    'address' => 'Jakarta Barat',
]);
echo "Status: " . $registerRes['status'] . "\n";
echo "Response: " . json_encode($registerRes['body'], JSON_PRETTY_PRINT) . "\n\n";

// 2. Test Login as Admin
echo "2. Testing POST /api/auth/login as Admin (admin@renstore.com)...\n";
$adminLoginRes = simulateRequest('POST', '/api/auth/login', [
    'email' => 'admin@renstore.com',
    'password' => 'admin123',
]);
echo "Status: " . $adminLoginRes['status'] . "\n";
$adminToken = $adminLoginRes['body']['data']['token'] ?? null;
echo "Admin Token obtained: " . ($adminToken ? "YES" : "NO") . "\n";
echo "Admin Role: " . ($adminLoginRes['body']['data']['user']['role'] ?? 'none') . "\n\n";

// 3. Test Login as Customer
echo "3. Testing POST /api/auth/login as Customer (customer@renstore.com)...\n";
$customerLoginRes = simulateRequest('POST', '/api/auth/login', [
    'email' => 'customer@renstore.com',
    'password' => 'password123',
]);
echo "Status: " . $customerLoginRes['status'] . "\n";
$customerToken = $customerLoginRes['body']['data']['token'] ?? null;
echo "Customer Token obtained: " . ($customerToken ? "YES" : "NO") . "\n";
echo "Customer Role: " . ($customerLoginRes['body']['data']['user']['role'] ?? 'none') . "\n\n";

// 4. Test Login with Wrong Password
echo "4. Testing POST /api/auth/login with wrong password...\n";
$wrongLoginRes = simulateRequest('POST', '/api/auth/login', [
    'email' => 'admin@renstore.com',
    'password' => 'wrongpass',
]);
echo "Status: " . $wrongLoginRes['status'] . "\n";
echo "Message: " . ($wrongLoginRes['body']['message'] ?? '') . "\n\n";

// 5. Test Profile endpoint with Token
echo "5. Testing GET /api/auth/profile with Customer Token...\n";
$profileRes = simulateRequest('GET', '/api/auth/profile', [], [
    'Authorization' => 'Bearer ' . $customerToken,
]);
echo "Status: " . $profileRes['status'] . "\n";
echo "Email: " . ($profileRes['body']['data']['email'] ?? 'none') . "\n";
echo "Role: " . ($profileRes['body']['data']['role'] ?? 'none') . "\n\n";

// 6. Test Admin Route Access with Admin Token
echo "6. Testing GET /api/admin/ping with Admin Token (Role admin)...\n";
$adminPingRes = simulateRequest('GET', '/api/admin/ping', [], [
    'Authorization' => 'Bearer ' . $adminToken,
]);
echo "Status: " . $adminPingRes['status'] . "\n";
echo "Response: " . json_encode($adminPingRes['body']) . "\n\n";

// 7. Test Admin Route Access with Customer Token (Should be 403 Forbidden)
echo "7. Testing GET /api/admin/ping with Customer Token (Role customer - expecting 403)...\n";
$customerPingRes = simulateRequest('GET', '/api/admin/ping', [], [
    'Authorization' => 'Bearer ' . $customerToken,
]);
echo "Status: " . $customerPingRes['status'] . "\n";
echo "Response: " . json_encode($customerPingRes['body']) . "\n\n";

// 8. Test Logout
echo "8. Testing POST /api/auth/logout with Customer Token...\n";
$logoutRes = simulateRequest('POST', '/api/auth/logout', [], [
    'Authorization' => 'Bearer ' . $customerToken,
]);
echo "Status: " . $logoutRes['status'] . "\n";
echo "Response: " . json_encode($logoutRes['body']) . "\n\n";

echo "=== ALL AUTHENTICATION TESTS EXECUTED SUCCESSFULLY ===\n";
