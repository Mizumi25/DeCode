<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_components', function (Blueprint $table) {
            $table->id();
            
            // Use string UUIDs, not unsignedBigInteger
            $table->string('project_id'); // UUID string to match projects table
            $table->string('frame_id')->nullable(); // UUID string to match frames table
            
            $table->string('component_instance_id'); // Frontend generated ID
            $table->string('component_type'); // References components.type
            $table->json('props')->nullable(); // Should be nullable
            $table->string('name'); // User-defined name for this instance
            $table->integer('z_index')->default(0);
            $table->boolean('is_locked')->default(false);
            
   
            $table->json('style')->nullable();
            $table->json('animation')->nullable();
            
            $table->string('display_type')->default('block')->after('component_type');
            $table->json('layout_props')->nullable()->after('display_type');
            $table->boolean('is_layout_container')->default(false)->after('layout_props');
            
            $table->unsignedBigInteger('parent_id')->nullable()->after('frame_id');
            $table->integer('sort_order')->default(0)->after('z_index');
            
            $table->foreign('parent_id')
                  ->references('id')
                  ->on('project_components')
                  ->onDelete('cascade');
                  
                  $table->text('text_content')->nullable()->after('props');
            $table->boolean('visible')->default(true)->after('is_locked');
            $table->boolean('locked')->default(false)->after('visible');
      
            
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['project_id', 'frame_id']);
            $table->index('component_type');
            $table->index('component_instance_id'); // Add index for instance ID
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_components');
    }
};