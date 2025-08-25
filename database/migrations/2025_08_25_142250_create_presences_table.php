<?php

// database/migrations/xxxx_xx_xx_create_presences_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('presences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->json('cursor_position')->nullable(); // {x:100,y:200}
            $table->json('selection_state')->nullable(); // ids of selected nodes
            $table->timestamp('last_ping')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('presences');
    }
};
