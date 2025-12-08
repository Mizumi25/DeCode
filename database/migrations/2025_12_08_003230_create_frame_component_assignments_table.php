<?php

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
        Schema::create('frame_component_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('page_frame_id')->constrained('frames')->onDelete('cascade');
            $table->foreignId('component_frame_id')->constrained('frames')->onDelete('cascade');
            $table->integer('position')->default(0); // Position in page (top to bottom)
            $table->integer('x')->nullable(); // X position in canvas
            $table->integer('y')->nullable(); // Y position in canvas
            $table->json('override_props')->nullable(); // Override component props per page
            $table->timestamps();
            
            // Composite index for faster lookups
            $table->index(['page_frame_id', 'position']);
            $table->index('component_frame_id');
            
            // Prevent duplicate assignments at same position
            $table->unique(['page_frame_id', 'component_frame_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('frame_component_assignments');
    }
};
