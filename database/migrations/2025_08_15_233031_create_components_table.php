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
            $table->enum('component_type', ['element', 'component'])->default('element')->after('type');
            $table->string('category')->default('basic'); // 'basic', 'form', 'layout', etc.
            $table->string('alphabet_group')->nullable()->after('category'); // A, B, C, etc.
            $table->text('description');
            $table->string('icon')->nullable(); // Lucide icon name
            $table->json('default_props'); // Default properties
            $table->json('prop_definitions'); // Define available props and their types
            $table->longText('render_template'); // React component template
            $table->json('code_generators'); // Different code generation templates
            $table->json('variants')->nullable()->after('code_generators'); // Different style variants
            $table->boolean('has_animation')->default(false)->after('variants');
            $table->string('animation_type')->nullable()->after('has_animation'); // css, gsap, framer-motion
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::table('components', function (Blueprint $table) {
            $table->dropColumn([
                'component_type', 
                'alphabet_group', 
                'variants', 
                'has_animation', 
                'animation_type'
            ]);
        });
    }
};

