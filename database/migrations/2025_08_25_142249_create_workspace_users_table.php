<?php

// database/migrations/xxxx_xx_xx_create_workspace_users_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('workspace_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('role',['owner','admin','editor','viewer'])->default('viewer');
            $table->timestamps();
            $table->unique(['workspace_id','user_id']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('workspace_users');
    }
};
