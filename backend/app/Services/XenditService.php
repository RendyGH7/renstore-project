<?php

namespace App\Services;

/**
 * XenditService wraps/extends PaymentService for backward compatibility.
 */
class XenditService extends PaymentService
{
    // Inherits all createDynamicQr, verifyWebhookToken, and generateStandardQrisString methods
}
