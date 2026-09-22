<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_method')->default('qris')->after('payment_status');
            $table->string('qr_id')->nullable()->after('payment_method');
            $table->text('qr_string')->nullable()->after('qr_id');
            $table->timestampTz('qr_expires_at')->nullable()->after('qr_string');
            $table->timestampTz('paid_at')->nullable()->after('qr_expires_at');

            $table->index('qr_id');
            $table->index('payment_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['qr_id']);
            $table->dropIndex(['payment_status']);
            $table->dropColumn([
                'payment_method',
                'qr_id',
                'qr_string',
                'qr_expires_at',
                'paid_at',
            ]);
        });
    }
};
