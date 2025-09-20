<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('frames', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->enum('type', ['page', 'component'])->default('page')->after('name');
            $table->boolean('scrolled_component')->default(false)->after('type');
            $table->enum('scroll_direction', ['vertical', 'horizontal', 'both'])->nullable()->after('scrolled_component');
            $table->json('canvas_data')->nullable();
            $table->json('settings')->nullable();
            $table->string('thumbnail_path')->nullable()->after('settings');
            $table->timestamps();
            
            $table->boolean('is_locked')->default(false);
            $table->unsignedBigInteger('locked_by_user_id')->nullable();
            $table->timestamp('locked_at')->nullable();
            $table->string('locked_mode')->nullable(); // 'forge' or 'source'
            $table->text('lock_reason')->nullable(); // Optional reason for lock
            
            // Foreign key for locked_by_user_id
            $table->foreign('locked_by_user_id')->references('id')->on('users')->onDelete('set null');
            
            // Index for performance
            $table->index(['is_locked', 'locked_by_user_id']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('frames');
    }
};