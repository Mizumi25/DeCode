<?php
// database/migrations/create_workspaces_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workspaces', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->string('name', 50);
            $table->text('description')->nullable();
            $table->enum('type', ['personal', 'team', 'company'])->default('team');
            $table->json('settings')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['owner_id', 'type']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('workspaces');
    }
};
