<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_icons', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('workspace_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('category')->default('custom');
            $table->text('svg_content');
            $table->string('file_path')->nullable();
            $table->json('metadata')->nullable(); // size, colors, tags, etc.
            $table->boolean('is_public')->default(false);
            $table->timestamps();
            
            $table->index(['user_id', 'workspace_id']);
            $table->index(['category', 'is_public']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_icons');
    }
};