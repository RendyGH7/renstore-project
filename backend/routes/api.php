<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\WebhookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Payment Gateway Webhooks (Xendit QRIS) & Dev Simulation
Route::prefix('webhooks')->group(function () {
    Route::post('/xendit', [WebhookController::class, 'handleXendit']);
    Route::post('/xendit/simulate/{order_number}', [WebhookController::class, 'simulatePayment']);
});
Route::post('/payment/simulate/{order_number}', [WebhookController::class, 'simulatePayment']);
Route::post('/orders/{order_number}/simulate-paid', [WebhookController::class, 'simulatePayment']);

// Authentication
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Categories (Public)
Route::prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index']);
    Route::get('/{slug}', [CategoryController::class, 'show']);
});

// Products (Public)
Route::prefix('products')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::get('/{slug}', [ProductController::class, 'show']);
});

/*
|--------------------------------------------------------------------------
| Authenticated Routes (Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Auth Profile
    Route::prefix('auth')->group(function () {
        Route::get('/profile', [AuthController::class, 'profile']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::post('/profile', [AuthController::class, 'updateProfile']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    // General user check route
    Route::get('/user', function (Request $request) {
        return response()->json([
            'status' => true,
            'data' => $request->user(),
        ]);
    });

    // Shopping Cart Routes (Customer)
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index']);
        Route::post('/', [CartController::class, 'store']);
        Route::put('/{id}', [CartController::class, 'update']);
        Route::delete('/{id}', [CartController::class, 'destroy']);
        Route::delete('/', [CartController::class, 'clear']);
    });

    // Checkout, Promo & Customer Orders
    Route::post('/promo/validate', [OrderController::class, 'validatePromo']);
    Route::post('/checkout', [OrderController::class, 'checkout']);
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::get('/{order_number}', [OrderController::class, 'show']);
    });

    /*
    |--------------------------------------------------------------------------
    | Admin Protected Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/ping', function () {
            return response()->json([
                'status' => true,
                'message' => 'Admin access granted.',
                'timestamp' => now(),
            ]);
        });

        // Admin Categories Management
        Route::prefix('categories')->group(function () {
            Route::post('/', [CategoryController::class, 'store']);
            Route::put('/{id}', [CategoryController::class, 'update']);
            Route::delete('/{id}', [CategoryController::class, 'destroy']);
        });

        // Admin Products Management
        Route::prefix('products')->group(function () {
            Route::post('/', [ProductController::class, 'store']);
            Route::put('/{id}', [ProductController::class, 'update']);
            Route::delete('/{id}', [ProductController::class, 'destroy']);
        });

        // Admin Orders Management
        Route::prefix('orders')->group(function () {
            Route::get('/', [OrderController::class, 'adminIndex']);
            Route::patch('/{id}/status', [OrderController::class, 'updateStatus']);
        });

        // Admin Analytics & Dashboard
        Route::prefix('dashboard')->group(function () {
            Route::get('/stats', [DashboardController::class, 'stats']);
        });
    });
});
