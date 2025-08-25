<?php

// database/migrations/xxxx_xx_xx_create_revisions_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->json('change_data'); // diff or snapshot
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('revisions');
    }
};
