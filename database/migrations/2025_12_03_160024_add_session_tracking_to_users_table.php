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
        Schema::table('users', function (Blueprint $table) {
            $table->string('current_session_id')->nullable()->after('remember_token');
            $table->timestamp('session_started_at')->nullable()->after('current_session_id');
            $table->string('session_device')->nullable()->after('session_started_at');
            $table->string('session_ip')->nullable()->after('session_device');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['current_session_id', 'session_started_at', 'session_device', 'session_ip']);
        });
    }
};
