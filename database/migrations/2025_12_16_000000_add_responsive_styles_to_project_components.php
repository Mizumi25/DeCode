<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('project_components', function (Blueprint $table) {
            // Add responsive style fields after the main style field
            $table->json('style_mobile')->nullable()->after('style');
            $table->json('style_tablet')->nullable()->after('style_mobile');
            $table->json('style_desktop')->nullable()->after('style_tablet');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('project_components', function (Blueprint $table) {
            $table->dropColumn(['style_mobile', 'style_tablet', 'style_desktop']);
        });
    }
};
