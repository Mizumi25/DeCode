<?php
// database/migrations/create_workspace_users_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workspace_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('role', ['owner', 'admin', 'editor', 'viewer'])->default('viewer');
            $table->enum('discipline', [
                'Developer',
                'Designer', 
                'Product Manager',
                'QA Tester',
                'Project Manager',
                'Marketing',
                'Sales',
                'Support',
                'Member'
            ])->default('Member')->after('role');
            
            $table->integer('discipline_order')->default(999)->after('discipline');
            
            $table->timestamp('joined_at');
            $table->timestamps();
            
            $table->unique(['workspace_id', 'user_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('workspace_users');
    }
};