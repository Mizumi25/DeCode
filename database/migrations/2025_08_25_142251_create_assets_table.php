<?php
// database/migrations/2024_01_15_000000_create_assets_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->uuid('project_id')->nullable()->index();
            $table->string('name');
            $table->enum('type', ['image', 'video', 'audio', 'document']);
            $table->string('file_path');
            $table->string('thumbnail_path')->nullable();
            $table->unsignedBigInteger('file_size');
            $table->string('mime_type');
            $table->json('dimensions')->nullable();
            $table->decimal('duration', 8, 2)->nullable(); // For videos/audio
            $table->json('metadata')->nullable();
            $table->json('tags')->nullable();
            $table->boolean('is_public')->default(false);
            $table->timestamps();

            // Indexes
            $table->index(['user_id', 'type']);
            $table->index(['project_id', 'type']);
            $table->index(['created_at']);
            $table->index('name'); // use normal index instead of fullText
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
