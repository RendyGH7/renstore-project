<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\XenditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    /**
     * Handle incoming Xendit Payment Gateway Webhooks (QRIS & Payments).
     */
    public function handleXendit(Request $request, XenditService $xenditService): JsonResponse
    {
        $callbackToken = $request->header('x-callback-token') 
            ?? $request->header('X-CALLBACK-TOKEN') 
            ?? $request->query('token');

        // 1. Verify Webhook Token authenticity
        if (! $xenditService->verifyWebhookToken($callbackToken)) {
            Log::warning('Xendit webhook rejected: Invalid callback token.', [
                'ip' => $request->ip(),
                'headers' => $request->headers->all(),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Token verifikasi webhook tidak valid.',
            ], 401);
        }

        $payload = $request->all();
        Log::info('Xendit webhook received:', ['payload' => $payload]);

        // 2. Extract Event & Payment Data
        $event = $payload['event'] ?? null;
        $data = $payload['data'] ?? $payload;

        $referenceId = $data['reference_id'] ?? $payload['reference_id'] ?? null;
        $qrId = $data['qr_id'] ?? $data['id'] ?? $payload['qr_id'] ?? $payload['id'] ?? null;
        $status = strtoupper($data['status'] ?? $payload['status'] ?? '');

        if (! $referenceId && ! $qrId) {
            return response()->json([
                'status' => false,
                'message' => 'Missing reference_id or qr_id in webhook payload.',
            ], 400);
        }

        // 3. Process payment status update in transaction
        return DB::transaction(function () use ($referenceId, $qrId, $status, $payload) {
            $query = Order::query()->lockForUpdate();

            if ($referenceId) {
                $query->where('order_number', $referenceId);
            } elseif ($qrId) {
                $query->where('qr_id', $qrId);
            }

            $order = $query->first();

            if (! $order) {
                Log::warning("Xendit webhook order not found: reference_id={$referenceId}, qr_id={$qrId}");
                return response()->json([
                    'status' => false,
                    'message' => 'Pesanan tidak ditemukan.',
                ], 404);
            }

            // If payment succeeded (COMPLETED or PAID)
            if (in_array($status, ['COMPLETED', 'PAID', 'SUCCEEDED'])) {
                if ($order->payment_status !== 'paid') {
                    $order->update([
                        'payment_status' => 'paid',
                        'status' => $order->status === 'pending' ? 'processing' : $order->status,
                        'paid_at' => now(),
                    ]);

                    Log::info("Order {$order->order_number} marked as PAID via Xendit QRIS webhook.");
                }
            } elseif (in_array($status, ['EXPIRED', 'FAILED'])) {
                if ($order->payment_status === 'unpaid') {
                    $order->update([
                        'payment_status' => 'unpaid',
                        'status' => 'cancelled',
                    ]);
                }
            }

            return response()->json([
                'status' => true,
                'message' => 'Webhook Xendit berhasil diproses.',
                'data' => [
                    'order_number' => $order->order_number,
                    'payment_status' => $order->payment_status,
                    'status' => $order->status,
                ],
            ], 200);
        });
    }

    /**
     * Simulate payment for test & demo purposes (Development only).
     */
    public function simulatePayment(Request $request, string $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)->first();

        if (! $order) {
            return response()->json([
                'status' => false,
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        $order->update([
            'payment_status' => 'paid',
            'status' => 'processing',
            'paid_at' => now(),
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Pembayaran pesanan berhasil disimulasikan sebagai lunas.',
            'data' => $order,
        ]);
    }
}
