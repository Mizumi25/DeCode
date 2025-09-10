<?php
// database/migrations/2024_12_XX_XXXXXX_create_frame_lock_requests_table.php

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
        Schema::create('frame_lock_requests', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('frame_id');
            $table->unsignedBigInteger('requester_user_id'); // User requesting access
            $table->unsignedBigInteger('frame_owner_user_id'); // User who owns/locked the frame
            $table->string('requested_mode'); // 'forge' or 'source'
            $table->text('message')->nullable(); // Optional message from requester
            $table->enum('status', ['pending', 'approved', 'rejected', 'expired'])->default('pending');
            $table->timestamp('expires_at'); // Auto-expire after X minutes
            $table->timestamp('responded_at')->nullable();
            $table->text('response_message')->nullable();
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('frame_id')->references('id')->on('frames')->onDelete('cascade');
            $table->foreign('requester_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('frame_owner_user_id')->references('id')->on('users')->onDelete('cascade');
            
            // Indexes
            $table->index(['frame_id', 'status']);
            $table->index(['frame_owner_user_id', 'status']);
            $table->index(['requester_user_id', 'status']);
            $table->index(['expires_at', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('frame_lock_requests');
    }
};