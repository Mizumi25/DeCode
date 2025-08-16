<?php
// database/migrations/xxxx_xx_xx_create_project_components_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_components', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id');
            $table->unsignedBigInteger('frame_id')->nullable();
            $table->string('component_instance_id'); // Frontend generated ID
            $table->string('component_type'); // References components.type
            $table->json('props'); // Instance-specific properties
            $table->json('position'); // {x: 100, y: 200}
            $table->string('name'); // User-defined name for this instance
            $table->integer('z_index')->default(0);
            $table->boolean('is_locked')->default(false);
            $table->timestamps();
            
            $table->index(['project_id', 'frame_id']);
            $table->index('component_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_components');
    }
};