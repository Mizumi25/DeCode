<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('published_url')->nullable()->after('status');
            $table->timestamp('published_at')->nullable()->after('published_url');
            $table->string('published_subdomain')->nullable()->after('published_at');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['published_url', 'published_at', 'published_subdomain']);
        });
    }
};
