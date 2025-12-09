<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('frames', function (Blueprint $table) {
            // Source file path from imported project
            $table->string('source_frontend_path')->nullable()->after('name');
            
            // Linked CSS files (JSON array of paths)
            $table->json('linked_css_files')->nullable()->after('source_frontend_path');
            
            // Framework and style for this specific frame
            $table->enum('framework', ['react', 'html', 'vue', 'angular'])->nullable()->after('linked_css_files');
            $table->enum('style_framework', ['css', 'tailwind', 'bootstrap', 'styled_components'])->nullable()->after('framework');
            
            // Original file content (for imported files)
            $table->longText('original_content')->nullable()->after('style_framework');
            
            // Index for faster queries
            $table->index('source_frontend_path');
        });
    }

    public function down(): void
    {
        Schema::table('frames', function (Blueprint $table) {
            $table->dropIndex(['source_frontend_path']);
            
            $table->dropColumn([
                'source_frontend_path',
                'linked_css_files',
                'framework',
                'style_framework',
                'original_content'
            ]);
        });
    }
};
