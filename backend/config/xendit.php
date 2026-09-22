<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Xendit API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Xendit Payment Gateway including Secret Key and
    | Webhook Verification Token.
    |
    */

    'secret_key' => env('XENDIT_SECRET_KEY', ''),
    'webhook_token' => env('XENDIT_WEBHOOK_TOKEN', ''),
    'qr_expiry_minutes' => (int) env('XENDIT_QR_EXPIRY_MINUTES', 30),
    'api_base_url' => env('XENDIT_API_URL', 'https://api.xendit.co'),
];
