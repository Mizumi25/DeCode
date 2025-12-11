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
        Schema::create('trusted_devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('device_fingerprint')->index(); // Unique device identifier
            $table->string('device_name')->nullable(); // e.g., "Chrome on Windows"
            $table->string('ip_address');
            $table->text('user_agent');
            $table->timestamp('last_used_at');
            $table->timestamp('expires_at')->nullable(); // Optional expiry for remember me
            $table->timestamps();
            
            // Ensure unique device per user
            $table->unique(['user_id', 'device_fingerprint']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trusted_devices');
    }
};
