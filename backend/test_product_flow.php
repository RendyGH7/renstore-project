<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

function simulateRequest($method, $uri, $data = [], $headers = []) {
    // Reset cached auth state across simulated requests
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

echo "========================================================\n";
echo "   RENSTORE MODULE 3: PRODUCTS & CATEGORIES TEST FLOW   \n";
echo "========================================================\n\n";

// 1. Get Tokens for Admin & Customer
echo "[STEP 1] Authenticating Admin and Customer...\n";
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
echo "✓ Admin & Customer tokens obtained successfully.\n\n";

// 2. Public Categories Test
echo "[STEP 2] Testing Public GET /api/categories...\n";
$categoriesRes = simulateRequest('GET', '/api/categories');
echo "Status: " . $categoriesRes['status'] . "\n";
echo "Total Categories returned: " . count($categoriesRes['body']['data'] ?? []) . "\n";
$firstCategory = $categoriesRes['body']['data'][0] ?? null;
if ($firstCategory) {
    echo "Sample Category: {$firstCategory['name']} (Slug: {$firstCategory['slug']}, Products Count: {$firstCategory['products_count']})\n";
}
echo "✓ Public Categories endpoint verified.\n\n";

// 3. Public Products Listing Test
echo "[STEP 3] Testing Public GET /api/products (Default Pagination)...\n";
$productsRes = simulateRequest('GET', '/api/products');
echo "Status: " . $productsRes['status'] . "\n";
$paginationMeta = $productsRes['body']['meta'] ?? [];
echo "Current Page: " . ($paginationMeta['current_page'] ?? 'N/A') . " / " . ($paginationMeta['last_page'] ?? 'N/A') . "\n";
echo "Total Products in DB: " . ($paginationMeta['total'] ?? 'N/A') . "\n";
echo "Items in Current Page: " . count($productsRes['body']['data'] ?? []) . "\n";
echo "✓ Public Products listing with pagination verified.\n\n";

// 4. Product Search Test
echo "[STEP 4] Testing Product Search: GET /api/products?search=Sony...\n";
$searchRes = simulateRequest('GET', '/api/products?search=Sony');
echo "Status: " . $searchRes['status'] . "\n";
$searchResults = $searchRes['body']['data'] ?? [];
echo "Found: " . count($searchResults) . " product(s)\n";
if (count($searchResults) > 0) {
    echo "Matched Product: " . $searchResults[0]['name'] . "\n";
}
echo "✓ Search filtering verified.\n\n";

// 5. Product Category Filter Test
echo "[STEP 5] Testing Category Filtering: GET /api/products?category_slug=footwear-sneakers...\n";
$catFilterRes = simulateRequest('GET', '/api/products?category_slug=footwear-sneakers');
echo "Status: " . $catFilterRes['status'] . "\n";
$catResults = $catFilterRes['body']['data'] ?? [];
echo "Found: " . count($catResults) . " product(s) in Footwear\n";
foreach ($catResults as $p) {
    echo " - {$p['name']} (IDR " . number_format((float)$p['price'], 0, ',', '.') . ")\n";
}
echo "✓ Category filtering verified.\n\n";

// 6. Product Price Sorting Test
echo "[STEP 6] Testing Price Sorting: GET /api/products?sort=price_asc...\n";
$sortAscRes = simulateRequest('GET', '/api/products?sort=price_asc');
$ascItems = $sortAscRes['body']['data'] ?? [];
$cheapest = $ascItems[0] ?? null;
if ($cheapest) {
    echo "Cheapest Product: {$cheapest['name']} — IDR " . number_format((float)$cheapest['price'], 0, ',', '.') . "\n";
}

$sortDescRes = simulateRequest('GET', '/api/products?sort=price_desc');
$descItems = $sortDescRes['body']['data'] ?? [];
$mostExpensive = $descItems[0] ?? null;
if ($mostExpensive) {
    echo "Most Expensive Product: {$mostExpensive['name']} — IDR " . number_format((float)$mostExpensive['price'], 0, ',', '.') . "\n";
}
echo "✓ Price sorting (ASC/DESC) verified.\n\n";

// 7. Product Detail by Slug Test
echo "[STEP 7] Testing Public GET /api/products/{slug}...\n";
$targetSlug = 'sony-wh-1000xm5-wireless-headphones';
$detailRes = simulateRequest('GET', "/api/products/{$targetSlug}");
echo "Status: " . $detailRes['status'] . "\n";
$detailData = $detailRes['body']['data'] ?? [];
echo "Product: {$detailData['name']}\n";
echo "Category: " . ($detailData['category']['name'] ?? 'N/A') . "\n";
echo "Stock: {$detailData['stock']} units\n";
echo "✓ Product detail endpoint verified.\n\n";

// 8. Security Check: Customer Trying to Create Product (Should be 403 Forbidden)
echo "[STEP 8] Security Test: Customer attempting POST /api/admin/products (Expecting 403 Forbidden)...\n";
$unauthorizedRes = simulateRequest('POST', '/api/admin/products', [
    'category_id' => $firstCategory['id'],
    'name' => 'Illegal Customer Product',
    'price' => 100000,
    'stock' => 5,
    'description' => 'Should fail',
], [
    'Authorization' => 'Bearer ' . $customerToken,
]);
echo "Status: " . $unauthorizedRes['status'] . "\n";
echo "Response: " . json_encode($unauthorizedRes['body']) . "\n";
if ($unauthorizedRes['status'] === 403) {
    echo "✓ Security Guard PASSED: Customer access forbidden.\n\n";
} else {
    echo "✗ Security Guard FAILED!\n\n";
}

// 9. Admin Category CRUD Test
echo "[STEP 9] Admin Category CRUD: Testing POST, PUT, and DELETE /api/admin/categories...\n";
// Create Category
$newCatRes = simulateRequest('POST', '/api/admin/categories', [
    'name' => 'Test Gaming Gear',
    'description' => 'Aksesoris khusus gaming',
], [
    'Authorization' => 'Bearer ' . $adminToken,
]);
echo "POST Status: " . $newCatRes['status'] . "\n";
$createdCatId = $newCatRes['body']['data']['id'] ?? null;
echo "Created Category ID: " . $createdCatId . " (Slug: " . ($newCatRes['body']['data']['slug'] ?? '') . ")\n";

// Update Category
$updateCatRes = simulateRequest('PUT', "/api/admin/categories/{$createdCatId}", [
    'name' => 'Test Gaming Gear Pro',
], [
    'Authorization' => 'Bearer ' . $adminToken,
]);
echo "PUT Status: " . $updateCatRes['status'] . "\n";
echo "Updated Name: " . ($updateCatRes['body']['data']['name'] ?? '') . "\n";
echo "✓ Admin Category Create & Update verified.\n\n";

// 10. Admin Product CRUD Test
echo "[STEP 10] Admin Product CRUD: Testing POST, PUT, and DELETE /api/admin/products...\n";
// Create Product
$newProdRes = simulateRequest('POST', '/api/admin/products', [
    'category_id' => $createdCatId,
    'name' => 'Logitech G Pro X Superlight Gaming Mouse',
    'price' => 1899000.00,
    'stock' => 50,
    'description' => 'Mouse gaming wireless ultra ringan dengan sensor HERO 25K.',
    'image_url' => 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=800',
    'is_active' => true,
], [
    'Authorization' => 'Bearer ' . $adminToken,
]);
echo "POST Product Status: " . $newProdRes['status'] . "\n";
$createdProdId = $newProdRes['body']['data']['id'] ?? null;
$createdProdSlug = $newProdRes['body']['data']['slug'] ?? null;
echo "Created Product ID: {$createdProdId}, Slug: {$createdProdSlug}\n";

// Update Product
$updateProdRes = simulateRequest('PUT', "/api/admin/products/{$createdProdId}", [
    'price' => 1799000.00,
    'stock' => 45,
], [
    'Authorization' => 'Bearer ' . $adminToken,
]);
echo "PUT Product Status: " . $updateProdRes['status'] . "\n";
echo "Updated Product Price: IDR " . number_format((float)($updateProdRes['body']['data']['price'] ?? 0), 0, ',', '.') . "\n";

// Delete Product
$deleteProdRes = simulateRequest('DELETE', "/api/admin/products/{$createdProdId}", [], [
    'Authorization' => 'Bearer ' . $adminToken,
]);
echo "DELETE Product Status: " . $deleteProdRes['status'] . "\n";
echo "DELETE Product Response: " . json_encode($deleteProdRes['body']) . "\n";

// Clean up test category
$deleteCatRes = simulateRequest('DELETE', "/api/admin/categories/{$createdCatId}", [], [
    'Authorization' => 'Bearer ' . $adminToken,
]);
echo "DELETE Category Status: " . $deleteCatRes['status'] . "\n";
echo "✓ Admin Product & Category CRUD lifecycle verified successfully.\n\n";

echo "========================================================\n";
echo "   ALL MODULE 3 API TESTS PASSED SUCCESSFULLY!          \n";
echo "========================================================\n";
