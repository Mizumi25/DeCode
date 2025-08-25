<?php

// database/migrations/xxxx_xx_xx_create_invites_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('invites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->onDelete('cascade');
            $table->string('email');
            $table->enum('role',['admin','editor','viewer'])->default('viewer');
            $table->string('token')->unique();
            $table->enum('status',['pending','accepted','declined'])->default('pending');
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('invites');
    }
};
