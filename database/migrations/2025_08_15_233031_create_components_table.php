<?php
// database/migrations/xxxx_xx_xx_create_components_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('components', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type')->unique(); // 'button', 'input', 'card', etc.
            $table->string('category')->default('basic'); // 'basic', 'form', 'layout', etc.
            $table->text('description');
            $table->string('icon')->nullable(); // Lucide icon name
            $table->json('default_props'); // Default properties
            $table->json('prop_definitions'); // Define available props and their types
            $table->longText('render_template'); // React component template
            $table->json('code_generators'); // Different code generation templates
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('components');
    }
};