<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\XenditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * List of active promotional vouchers.
     */
    protected function getPromoRules(): array
    {
        return [
            'RENSTORE2026' => [
                'type' => 'percentage',
                'value' => 15,
                'max_discount' => 500000,
                'min_spend' => 0,
                'description' => 'Diskon 15% hingga Rp 500.000',
            ],
            'DISKON50' => [
                'type' => 'percentage',
                'value' => 50,
                'max_discount' => 1000000,
                'min_spend' => 0,
                'description' => 'Diskon 50% Spesial hingga Rp 1.000.000',
            ],
            'RENM4' => [
                'type' => 'fixed',
                'value' => 1500000,
                'min_spend' => 10000000,
                'description' => 'Potongan Rp 1.500.000 (Min. Belanja Rp 10.000.000)',
            ],
            'HEMAT10' => [
                'type' => 'percentage',
                'value' => 10,
                'max_discount' => 300000,
                'min_spend' => 0,
                'description' => 'Diskon 10% hingga Rp 300.000',
            ],
            'GRATISONGKIR' => [
                'type' => 'fixed',
                'value' => 50000,
                'min_spend' => 100000,
                'description' => 'Potongan Biaya Pengiriman Rp 50.000',
            ],
        ];
    }

    /**
     * Calculate discount amount for a promo code against a subtotal.
     */
    protected function calculateDiscount(string $code, float $subtotal): array
    {
        $codeUpper = strtoupper(trim($code));
        $rules = $this->getPromoRules();

        if (!isset($rules[$codeUpper])) {
            return [
                'valid' => false,
                'message' => 'Kode promo tidak valid atau telah kedaluwarsa.',
                'discount' => 0.0,
                'code' => $codeUpper,
            ];
        }

        $promo = $rules[$codeUpper];
        if (isset($promo['min_spend']) && $subtotal < $promo['min_spend']) {
            $minFormatted = 'Rp ' . number_format($promo['min_spend'], 0, ',', '.');
            return [
                'valid' => false,
                'message' => "Kode promo {$codeUpper} memerlukan minimal belanja {$minFormatted}.",
                'discount' => 0.0,
                'code' => $codeUpper,
            ];
        }

        $discount = 0.0;
        if ($promo['type'] === 'percentage') {
            $discount = ($subtotal * $promo['value']) / 100;
            if (isset($promo['max_discount']) && $discount > $promo['max_discount']) {
                $discount = (float) $promo['max_discount'];
            }
        } elseif ($promo['type'] === 'fixed') {
            $discount = (float) $promo['value'];
        }

        if ($discount > $subtotal) {
            $discount = $subtotal;
        }

        return [
            'valid' => true,
            'code' => $codeUpper,
            'description' => $promo['description'],
            'discount' => round($discount, 2),
            'subtotal' => round($subtotal, 2),
            'final_total' => max(0, round($subtotal - $discount, 2)),
        ];
    }

    /**
     * Validate promo code API endpoint.
     */
    public function validatePromo(Request $request): JsonResponse
    {
        $request->validate([
            'promo_code' => 'required|string|max:50',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $result = $this->calculateDiscount(
            $request->string('promo_code')->toString(),
            (float) $request->input('subtotal')
        );

        if (!$result['valid']) {
            return response()->json([
                'status' => false,
                'message' => $result['message'],
            ], 422);
        }

        return response()->json([
            'status' => true,
            'message' => 'Kode promo berhasil digunakan!',
            'data' => $result,
        ]);
    }

    /**
     * Process checkout from user's shopping cart or direct buy into a new order with Dynamic QRIS.
     */
    public function checkout(CheckoutRequest $request, XenditService $xenditService): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        $isDirect = !empty($validated['product_id']);

        return DB::transaction(function () use ($user, $validated, $isDirect, $xenditService) {
            $subtotalAmount = 0.00;
            $orderItemsData = [];

            if ($isDirect) {
                // Direct Buy Flow
                $qty = isset($validated['quantity']) ? max(1, (int)$validated['quantity']) : 1;
                $product = Product::lockForUpdate()->find($validated['product_id']);

                if (!$product || !$product->is_active) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Produk ini sudah tidak aktif atau tidak tersedia.',
                    ], 422);
                }

                if ($product->stock < $qty) {
                    return response()->json([
                        'status' => false,
                        'message' => "Stok produk '{$product->name}' tidak mencukupi (Tersedia: {$product->stock}, Diminta: {$qty}).",
                    ], 422);
                }

                $price = (float) $product->price;
                $itemSubtotal = $price * $qty;
                $subtotalAmount += $itemSubtotal;

                $orderItemsData[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'price' => $price,
                    'quantity' => $qty,
                    'subtotal' => $itemSubtotal,
                ];
            } else {
                // Cart Checkout Flow
                $cartItems = CartItem::where('user_id', $user->id)
                    ->with('product')
                    ->lockForUpdate()
                    ->get();

                if ($cartItems->isEmpty()) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Keranjang belanja Anda kosong. Silakan tambahkan produk terlebih dahulu.',
                    ], 422);
                }

                foreach ($cartItems as $item) {
                    $product = $item->product;

                    if (! $product || ! $product->is_active) {
                        return response()->json([
                            'status' => false,
                            'message' => "Produk '{$product?->name}' sudah tidak aktif atau tidak tersedia.",
                        ], 422);
                    }

                    if ($product->stock < $item->quantity) {
                        return response()->json([
                            'status' => false,
                            'message' => "Stok produk '{$product->name}' tidak mencukupi (Tersedia: {$product->stock}, Diminta: {$item->quantity}).",
                        ], 422);
                    }

                    $price = (float) $product->price;
                    $subtotal = $price * $item->quantity;
                    $subtotalAmount += $subtotal;

                    $orderItemsData[] = [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'price' => $price,
                        'quantity' => $item->quantity,
                        'subtotal' => $subtotal,
                    ];
                }
            }

            // Calculate Promo Discount if provided
            $discountAmount = 0.00;
            $appliedPromoCode = null;
            if (!empty($validated['promo_code'])) {
                $promoResult = $this->calculateDiscount($validated['promo_code'], $subtotalAmount);
                if (!$promoResult['valid']) {
                    return response()->json([
                        'status' => false,
                        'message' => $promoResult['message'],
                    ], 422);
                }
                $discountAmount = $promoResult['discount'];
                $appliedPromoCode = $promoResult['code'];
            }

            $finalTotalAmount = max(1000, round($subtotalAmount - $discountAmount, 2));

            // Generate unique Order Number
            $orderNumber = 'ORD-' . date('Ymd') . '-' . strtoupper(Str::random(6));
            while (Order::where('order_number', $orderNumber)->exists()) {
                $orderNumber = 'ORD-' . date('Ymd') . '-' . strtoupper(Str::random(6));
            }

            // Generate Dynamic QRIS code via XenditService
            $qrData = $xenditService->createDynamicQr($orderNumber, $finalTotalAmount);

            // Create Order record with unpaid status, discount, promo code, and QRIS details
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => $orderNumber,
                'total_amount' => $finalTotalAmount,
                'discount_amount' => $discountAmount,
                'promo_code' => $appliedPromoCode,
                'status' => 'pending',
                'shipping_address' => $validated['shipping_address'],
                'phone' => $validated['phone'],
                'notes' => $validated['notes'] ?? null,
                'payment_status' => 'unpaid',
                'payment_method' => 'qris',
                'qr_id' => $qrData['qr_id'] ?? null,
                'qr_string' => $qrData['qr_string'] ?? null,
                'qr_expires_at' => $qrData['qr_expires_at'] ?? null,
            ]);

            // Create Order Items & Decrement Stock
            foreach ($orderItemsData as $itemData) {
                $order->orderItems()->create($itemData);
                Product::where('id', $itemData['product_id'])->decrement('stock', $itemData['quantity']);
            }

            // If it was cart checkout, clear user's cart
            if (!$isDirect) {
                CartItem::where('user_id', $user->id)->delete();
            }

            $order->load(['orderItems.product.category', 'user']);

            return response()->json([
                'status' => true,
                'message' => 'Pesanan berhasil dibuat. Silakan selesaikan pembayaran QRIS Anda.',
                'data' => $order,
            ], 201);
        });
    }

    /**
     * Get order history of the authenticated customer.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $orders = Order::where('user_id', $user->id)
            ->with(['orderItems.product'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'status' => true,
            'message' => 'Riwayat pesanan berhasil diambil.',
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    /**
     * Get single order detail by order number or ID.
     */
    public function show(Request $request, string $orderNumber): JsonResponse
    {
        $user = $request->user();

        $query = Order::where('order_number', $orderNumber)
            ->orWhere('id', is_numeric($orderNumber) ? (int) $orderNumber : 0)
            ->with(['orderItems.product.category', 'user']);

        // If not admin, restrict to own order
        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }

        $order = $query->first();

        if (! $order) {
            return response()->json([
                'status' => false,
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        // Auto-generate QRIS data for unpaid orders if missing
        if ($order->payment_status === 'unpaid' && empty($order->qr_string)) {
            $paymentService = app(\App\Services\PaymentService::class);
            $qrData = $paymentService->createDynamicQr($order->order_number, (float) $order->total_amount);
            $order->update([
                'qr_id' => $qrData['qr_id'] ?? null,
                'qr_string' => $qrData['qr_string'] ?? null,
                'qr_expires_at' => $qrData['qr_expires_at'] ?? null,
            ]);
            $order->refresh();
        }

        return response()->json([
            'status' => true,
            'message' => 'Detail pesanan berhasil diambil.',
            'data' => $order,
        ]);
    }

    /**
     * Get all orders with status filtering for Admin.
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = Order::with(['user', 'orderItems.product']);

        // Filter by Status
        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->trim());
        }

        // Search by Order Number or Customer Name
        if ($request->filled('search')) {
            $search = $request->string('search')->trim();
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'ilike', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'ilike', "%{$search}%")
                         ->orWhere('email', 'ilike', "%{$search}%");
                  });
            });
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'status' => true,
            'message' => 'Daftar semua pesanan berhasil diambil.',
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    /**
     * Update order status and handle stock restoration upon cancellation (Admin only).
     */
    public function updateStatus(UpdateOrderStatusRequest $request, string|int $id): JsonResponse
    {
        $newStatus = $request->string('status')->toString();

        return DB::transaction(function () use ($id, $newStatus) {
            $order = Order::with('orderItems')->lockForUpdate()->find($id);

            if (! $order) {
                return response()->json([
                    'status' => false,
                    'message' => 'Pesanan tidak ditemukan.',
                ], 404);
            }

            $oldStatus = $order->status;

            // If changing to 'cancelled' from active status, RESTORE stock
            if ($newStatus === 'cancelled' && $oldStatus !== 'cancelled') {
                foreach ($order->orderItems as $item) {
                    if ($item->product_id) {
                        Product::where('id', $item->product_id)->increment('stock', $item->quantity);
                    }
                }
            }

            // If un-cancelling (changing from 'cancelled' back to active), re-validate & deduct stock
            if ($oldStatus === 'cancelled' && $newStatus !== 'cancelled') {
                foreach ($order->orderItems as $item) {
                    if ($item->product_id) {
                        $prod = Product::find($item->product_id);
                        if (! $prod || $prod->stock < $item->quantity) {
                            return response()->json([
                                 'status' => false,
                                 'message' => "Gagal mengaktifkan kembali pesanan: Stok produk '{$item->product_name}' tidak mencukupi.",
                            ], 422);
                        }
                        $prod->decrement('stock', $item->quantity);
                    }
                }
            }

            $order->update([
                'status' => $newStatus,
            ]);

            $order->load(['orderItems.product.category', 'user']);

            return response()->json([
                'status' => true,
                'message' => "Status pesanan berhasil diperbarui menjadi '{$newStatus}'.",
                'data' => $order,
            ]);
        });
    }
}
