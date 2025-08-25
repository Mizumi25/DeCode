<?php
// database/migrations/xxxx_xx_xx_create_projects_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', [
                'website', 
                'landing_page', 
                'component_library', 
                'prototype',
                'email_template',
                'dashboard'
            ])->default('website');
            $table->enum('status', [
                'draft', 
                'active', 
                'archived', 
                'published'
            ])->default('draft');
            $table->string('thumbnail')->nullable(); // Path to thumbnail image
            $table->json('settings')->nullable(); // Project-specific settings
            $table->longText('canvas_data')->nullable(); // Canvas/artboard data with frames
            $table->json('export_settings')->nullable(); // Export preferences
            $table->timestamp('last_opened_at')->nullable();
            $table->boolean('is_public')->default(false);
            $table->unsignedBigInteger('template_id')->nullable(); // If created from template
            $table->integer('viewport_width')->default(1440);
            $table->integer('viewport_height')->default(900);
            $table->enum('css_framework', [
                'tailwind', 
                'bootstrap', 
                'vanilla',
                'styled_components',
                'emotion'
            ])->default('tailwind');
            $table->enum('output_format', [
                'html',
                'react', 
                'vue',
                'angular'
            ])->default('html');
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'type']);
            $table->index(['is_public', 'status']);
            $table->index('last_opened_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};