<?php
// database/migrations/create_invites_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->onDelete('cascade');
            $table->string('email')->nullable(); // null for link-based invites
            $table->enum('role', ['editor', 'viewer'])->default('viewer');
            $table->string('token')->unique();
            $table->enum('status', ['pending', 'accepted', 'expired', 'revoked'])->default('pending');
            $table->foreignId('invited_by')->nullable()->after('role')->constrained('users')->onDelete('set null');
            
            
            $table->timestamp('expires_at');
            $table->timestamps();
            
            $table->index(['workspace_id', 'status']);
            $table->index(['token', 'status']);
            $table->index(['email', 'workspace_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('invites');
    }
};
