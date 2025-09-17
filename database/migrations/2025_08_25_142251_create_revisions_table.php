<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('revisions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            
            // Use string UUIDs, not foreign key constraints to auto-increment IDs
            $table->string('project_id'); // UUID string, not foreignId
            $table->string('frame_id')->nullable(); // UUID string, not foreignId
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // This one is correct
            
            $table->enum('revision_type', ['manual', 'auto', 'github_sync'])->default('auto'); // Changed default
            $table->string('title');
            $table->text('description')->nullable(); // Should be text and nullable
            $table->json('component_data');
            $table->json('metadata')->nullable(); // Should be nullable
            $table->string('github_commit_sha')->nullable(); // Should be nullable
            $table->unsignedBigInteger('parent_revision_id')->nullable(); // Missing field
            $table->timestamps();
            $table->softDeletes(); // Missing soft deletes
            
            // Add indexes for performance
            $table->index(['project_id', 'created_at']);
            $table->index(['frame_id', 'created_at']);
            $table->index('revision_type');
            
            // Add foreign key for parent revision
            $table->foreign('parent_revision_id')->references('id')->on('revisions')->onDelete('set null');
        });
    }

    public function down(): void {
        Schema::dropIfExists('revisions');
    }
};