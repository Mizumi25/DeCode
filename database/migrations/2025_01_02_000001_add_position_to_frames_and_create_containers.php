<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add position columns to frames table
        Schema::table('frames', function (Blueprint $table) {
            $table->integer('x')->default(0)->after('name');
            $table->integer('y')->default(0)->after('x');
            $table->unsignedBigInteger('container_id')->nullable()->after('y');
            $table->integer('container_order')->nullable()->after('container_id');
        });

        // Create frame_containers table
        Schema::create('frame_containers', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('name')->default('Container');
            $table->integer('x')->default(0);
            $table->integer('y')->default(0);
            $table->integer('width')->default(800);
            $table->integer('height')->default(400);
            $table->enum('orientation', ['horizontal', 'vertical'])->default('horizontal');
            $table->json('settings')->nullable();
            $table->timestamps();
            
            $table->index(['project_id', 'x', 'y']);
        });

        // Add foreign key for container_id in frames
        Schema::table('frames', function (Blueprint $table) {
            $table->foreign('container_id')->references('id')->on('frame_containers')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('frames', function (Blueprint $table) {
            $table->dropForeign(['container_id']);
            $table->dropColumn(['x', 'y', 'container_id', 'container_order']);
        });
        
        Schema::dropIfExists('frame_containers');
    }
};
