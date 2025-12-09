<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            // Project source type
            $table->enum('project_type', ['manual', 'imported'])->default('manual')->after('type');
            
            // GitHub import metadata
            $table->string('source_repo_url')->nullable()->after('project_type');
            $table->string('source_repo_branch')->default('main')->after('source_repo_url');
            $table->timestamp('last_synced_at')->nullable()->after('source_repo_branch');
            
            // Framework detection (simplified from existing fields)
            $table->enum('framework', ['react', 'html', 'vue', 'angular'])->default('html')->after('last_synced_at');
            $table->enum('style_framework', ['css', 'tailwind', 'bootstrap', 'styled_components'])->default('css')->after('framework');
            
            // Preserved files for imported projects (JSON array of file paths)
            $table->json('preserved_files')->nullable()->after('style_framework');
            
            // Boilerplate template used for manual projects
            $table->string('boilerplate_template')->nullable()->after('preserved_files');
            
            // Index for faster queries
            $table->index(['project_type', 'framework']);
            $table->index('source_repo_url');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex(['project_type', 'framework']);
            $table->dropIndex(['source_repo_url']);
            
            $table->dropColumn([
                'project_type',
                'source_repo_url',
                'source_repo_branch',
                'last_synced_at',
                'framework',
                'style_framework',
                'preserved_files',
                'boilerplate_template'
            ]);
        });
    }
};
