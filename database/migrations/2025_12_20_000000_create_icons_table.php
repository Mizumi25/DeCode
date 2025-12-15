<?php
// database/migrations/2025_12_20_000000_create_icons_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('icons', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // 'Heart', 'Home', 'User'
            $table->string('type'); // 'lucide', 'heroicons', 'svg'
            $table->string('category')->default('general'); // 'navigation', 'media', 'actions', etc.
            $table->string('alphabet_group')->nullable(); // A, B, C for grouping
            $table->text('description')->nullable();
            $table->text('svg_code')->nullable(); // For custom SVG icons
            $table->string('library_name')->nullable(); // Original library name
            $table->json('metadata')->nullable(); // Size, stroke-width, viewBox, etc.
            $table->json('tags')->nullable(); // Searchable tags
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade'); // For user-uploaded SVGs
            $table->boolean('is_system')->default(false); // System icons (Lucide, HeroIcons) vs user uploads
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            // Indexes for faster queries
            $table->index('type');
            $table->index('category');
            $table->index('alphabet_group');
            $table->index('is_system');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('icons');
    }
};
