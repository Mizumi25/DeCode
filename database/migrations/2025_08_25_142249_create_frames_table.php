<?php

// database/migrations/xxxx_xx_xx_create_frames_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('frames', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->enum('type',['page','component'])->default('page');
            $table->json('canvas_data')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('frames');
    }
};
