<?php
// database/migrations/xxxx_create_frame_cursors_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('frame_cursors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('frame_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('session_id')->index();
            $table->decimal('x', 10, 2);
            $table->decimal('y', 10, 2);
            $table->string('viewport_mode')->default('desktop'); // desktop/tablet/mobile
            $table->string('color')->default('#3b82f6'); // User's cursor color
            $table->json('meta')->nullable(); // Additional data
            $table->timestamp('last_seen_at');
            $table->timestamps();
            
            $table->unique(['frame_id', 'user_id', 'session_id']);
            $table->index('last_seen_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('frame_cursors');
    }
};