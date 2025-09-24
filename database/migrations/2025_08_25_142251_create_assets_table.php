<?php
// database/migrations/2025_09_24_000000_create_assets_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->uuid('project_id')->nullable();

            $table->string('name');
            $table->string('type'); // image, video, audio, document
            $table->string('file_path');
            $table->string('thumbnail_path')->nullable();

            $table->unsignedBigInteger('file_size')->nullable();
            $table->string('mime_type')->nullable();

            $table->json('dimensions')->nullable(); // {width, height}
            $table->float('duration')->nullable(); // for video/audio
            $table->json('metadata')->nullable();
            $table->json('tags')->nullable();

            $table->boolean('is_public')->default(false);

            $table->timestamps();

            // Indexes for fast lookup
            $table->index(['user_id', 'project_id']);
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
