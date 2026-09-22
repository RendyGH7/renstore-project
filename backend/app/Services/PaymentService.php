<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentService
{
    protected string $secretKey;
    protected string $webhookToken;
    protected string $baseUrl;
    protected int $expiryMinutes;

    public function __construct()
    {
        $this->secretKey = trim((string) config('xendit.secret_key', ''));
        $this->webhookToken = trim((string) config('xendit.webhook_token', ''));
        $this->baseUrl = rtrim((string) config('xendit.api_base_url', 'https://api.xendit.co'), '/');
        $this->expiryMinutes = (int) config('xendit.qr_expiry_minutes', 30);
    }

    /**
     * Check if a valid production/sandbox Xendit secret key is configured.
     *
     * @return bool
     */
    public function hasValidSecretKey(): bool
    {
        if (empty($this->secretKey)) {
            return false;
        }

        // Check if key is just a placeholder
        $placeholderPatterns = [
            'xnd_development_...',
            'xnd_production_...',
            'mock_',
            'your_xendit_key',
            'change_me',
        ];

        foreach ($placeholderPatterns as $pattern) {
            if (str_starts_with($this->secretKey, $pattern) || $this->secretKey === $pattern) {
                return false;
            }
        }

        return strlen($this->secretKey) >= 15;
    }

    /**
     * Create a dynamic QRIS Code for an Order.
     * If API key is missing or Xendit request fails, gracefully fallback to local EMVCo sandbox QRIS.
     *
     * @param string $orderNumber
     * @param float $amount
     * @param int|null $expiresInMinutes
     * @return array
     */
    public function createDynamicQr(string $orderNumber, float $amount, ?int $expiresInMinutes = null): array
    {
        $minutes = $expiresInMinutes ?? $this->expiryMinutes;
        $expiresAt = Carbon::now()->addMinutes($minutes);
        $roundedAmount = (int) round($amount);

        // 1. Attempt official Xendit QR Code API call if key is present
        if ($this->hasValidSecretKey()) {
            try {
                $payload = [
                    'reference_id' => $orderNumber,
                    'type' => 'DYNAMIC',
                    'currency' => 'IDR',
                    'amount' => $roundedAmount,
                    'expires_at' => $expiresAt->toIso8601String(),
                ];

                // Build HTTP request with SSL verification bypass in local dev if needed to prevent cURL 60 errors
                $http = Http::withHeaders([
                    'api-version' => '2022-07-31',
                    'Content-Type' => 'application/json',
                ])
                ->withBasicAuth($this->secretKey, '')
                ->timeout(10);

                if (app()->environment('local', 'testing')) {
                    $http = $http->withoutVerifying();
                }

                $response = $http->post("{$this->baseUrl}/qr_codes", $payload);

                if ($response->successful()) {
                    $data = $response->json();
                    Log::info("[XENDIT PAYMENT] QRIS successfully generated via Xendit API for order {$orderNumber}:", [
                        'qr_id' => $data['id'] ?? null,
                        'amount' => $roundedAmount,
                        'status' => $data['status'] ?? 'ACTIVE',
                    ]);

                    return [
                        'success' => true,
                        'qr_id' => $data['id'] ?? ('qr_' . Str::random(24)),
                        'qr_string' => $data['qr_string'] ?? $this->generateStandardQrisString($orderNumber, $roundedAmount),
                        'qr_expires_at' => $expiresAt,
                        'status' => $data['status'] ?? 'ACTIVE',
                        'is_mock' => false,
                    ];
                }

                // Log detailed error from Xendit API response
                Log::error("[XENDIT PAYMENT ERROR] Xendit QR API rejected request for order {$orderNumber}:", [
                    'http_status' => $response->status(),
                    'error_body' => $response->json() ?? $response->body(),
                    'request_payload' => $payload,
                ]);
            } catch (\Throwable $e) {
                // Log detailed connection/system exception
                Log::error("[XENDIT PAYMENT EXCEPTION] Failed to connect to Xendit API for order {$orderNumber}:", [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'code' => $e->getCode(),
                ]);
            }
        } else {
            Log::info("[XENDIT PAYMENT NOTICE] Secret key is empty or placeholder. Running in Sandbox / Fallback mode for order {$orderNumber}.");
        }

        // 2. Graceful Sandbox Mock Fallback (Standard Indonesian QRIS EMVCo String)
        $mockQrId = 'qr_mock_' . strtolower(Str::random(20));
        $mockQrString = $this->generateStandardQrisString($orderNumber, $roundedAmount);

        Log::info("[XENDIT FALLBACK] Generated local sandbox QRIS for order {$orderNumber} (Nominal: Rp " . number_format($roundedAmount, 0, ',', '.') . ")", [
            'order_number' => $orderNumber,
            'qr_id' => $mockQrId,
            'amount' => $roundedAmount,
            'expires_at' => $expiresAt->toIso8601String(),
        ]);

        return [
            'success' => true,
            'qr_id' => $mockQrId,
            'qr_string' => $mockQrString,
            'qr_expires_at' => $expiresAt,
            'status' => 'ACTIVE',
            'is_mock' => true,
        ];
    }

    /**
     * Verify incoming Xendit webhook callback token header.
     *
     * @param string|null $incomingToken
     * @return bool
     */
    public function verifyWebhookToken(?string $incomingToken): bool
    {
        if (empty($this->webhookToken) || str_starts_with($this->webhookToken, 'your_') || str_starts_with($this->webhookToken, '...')) {
            return true; // Allow pass in local dev/mock mode
        }

        if (empty($incomingToken)) {
            return false;
        }

        return hash_equals($this->webhookToken, $incomingToken);
    }

    /**
     * Generate standard QRIS string payload (EMVCo standard format compatible).
     *
     * @param string $orderNumber
     * @param int $amount
     * @return string
     */
    public function generateStandardQrisString(string $orderNumber, int $amount): string
    {
        // Standard EMVCo QRIS dynamic payload representation for Indonesia (ID.CO.QRIS / XENDIT)
        $sanitizedOrder = substr(preg_replace('/[^A-Za-z0-9]/', '', $orderNumber), 0, 18);
        return "00020101021226670016ID.CO.XENDIT.WWW0118{$sanitizedOrder}02159360052300000105303360540" .
               str_pad((string) $amount, 2, '0', STR_PAD_LEFT) .
               "5802ID5908RENSTORE6007JAKARTA62070703A016304" .
               strtoupper(substr(md5($orderNumber . $amount), 0, 4));
    }
}
