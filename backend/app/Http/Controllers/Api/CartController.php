<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddToCartRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * Get all cart items for authenticated user with calculated subtotals.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $cartItems = CartItem::where('user_id', $user->id)
            ->with(['product' => function ($query) {
                $query->with('category');
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        $totalAmount = 0.00;
        $totalItems = 0;

        $items = $cartItems->map(function ($item) use (&$totalAmount, &$totalItems) {
            $product = $item->product;
            $price = $product ? (float) $product->price : 0.00;
            $subtotal = $price * $item->quantity;
            $totalAmount += $subtotal;
            $totalItems += $item->quantity;

            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'quantity' => $item->quantity,
                'price' => $price,
                'subtotal' => $subtotal,
                'product' => $product,
                'is_in_stock' => $product ? ($product->stock >= $item->quantity && $product->is_active) : false,
                'available_stock' => $product ? $product->stock : 0,
            ];
        });

        return response()->json([
            'status' => true,
            'message' => 'Keranjang belanja berhasil diambil.',
            'data' => [
                'items' => $items,
                'total_items' => $totalItems,
                'total_amount' => $totalAmount,
            ],
        ]);
    }

    /**
     * Add item to cart or increment quantity if already exists.
     */
    public function store(AddToCartRequest $request): JsonResponse
    {
        $user = $request->user();
        $productId = $request->integer('product_id');
        $quantity = $request->integer('quantity', 1);

        $product = Product::where('id', $productId)->where('is_active', true)->first();

        if (! $product) {
            return response()->json([
                'status' => false,
                'message' => 'Produk tidak ditemukan atau tidak aktif.',
            ], 404);
        }

        $cartItem = CartItem::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->first();

        $existingQty = $cartItem ? $cartItem->quantity : 0;
        $newQty = $existingQty + $quantity;

        if ($newQty > $product->stock) {
            return response()->json([
                'status' => false,
                'message' => "Jumlah yang diminta melebihi stok yang tersedia. (Stok tersedia: {$product->stock})",
            ], 422);
        }

        if ($cartItem) {
            $cartItem->update(['quantity' => $newQty]);
        } else {
            $cartItem = CartItem::create([
                'user_id' => $user->id,
                'product_id' => $productId,
                'quantity' => $newQty,
            ]);
        }

        $cartItem->load(['product.category']);

        return response()->json([
            'status' => true,
            'message' => 'Produk berhasil ditambahkan ke keranjang belanja.',
            'data' => $cartItem,
        ], 201);
    }

    /**
     * Update quantity of a specific cart item.
     */
    public function update(UpdateCartItemRequest $request, string|int $id): JsonResponse
    {
        $user = $request->user();
        $newQty = $request->integer('quantity');

        $cartItem = CartItem::where('user_id', $user->id)
            ->where('id', $id)
            ->with('product')
            ->first();

        if (! $cartItem) {
            return response()->json([
                'status' => false,
                'message' => 'Item keranjang tidak ditemukan.',
            ], 404);
        }

        $product = $cartItem->product;

        if (! $product || ! $product->is_active) {
            return response()->json([
                'status' => false,
                'message' => 'Produk ini sedang tidak tersedia.',
            ], 422);
        }

        if ($newQty > $product->stock) {
            return response()->json([
                'status' => false,
                'message' => "Jumlah melebihi stok yang tersedia. (Stok tersedia: {$product->stock})",
            ], 422);
        }

        $cartItem->update(['quantity' => $newQty]);

        return response()->json([
            'status' => true,
            'message' => 'Kuantitas item keranjang berhasil diperbarui.',
            'data' => $cartItem,
        ]);
    }

    /**
     * Delete a single cart item.
     */
    public function destroy(Request $request, string|int $id): JsonResponse
    {
        $user = $request->user();

        $cartItem = CartItem::where('user_id', $user->id)
            ->where('id', $id)
            ->first();

        if (! $cartItem) {
            return response()->json([
                'status' => false,
                'message' => 'Item keranjang tidak ditemukan.',
            ], 404);
        }

        $cartItem->delete();

        return response()->json([
            'status' => true,
            'message' => 'Item berhasil dihapus dari keranjang belanja.',
        ]);
    }

    /**
     * Clear all cart items for authenticated user.
     */
    public function clear(Request $request): JsonResponse
    {
        $user = $request->user();

        CartItem::where('user_id', $user->id)->delete();

        return response()->json([
            'status' => true,
            'message' => 'Seluruh isi keranjang belanja berhasil dikosongkan.',
        ]);
    }
}
