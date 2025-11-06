<?php
// database/migrations/xxxx_xx_xx_create_messages_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('content');
            $table->enum('type', ['text', 'system'])->default('text');
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index(['workspace_id', 'created_at']);
        });

        Schema::create('message_mentions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->morphs('mentionable'); // This automatically creates the index
            $table->integer('position'); // Position in the message content
            $table->integer('length'); // Length of the mention text
            $table->timestamps();
            
            $table->index(['message_id']);
            // REMOVE THIS LINE: $table->index(['mentionable_type', 'mentionable_id']);
        });

        Schema::create('message_reads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamp('read_at');
            
            $table->unique(['message_id', 'user_id']);
            $table->index(['user_id', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_reads');
        Schema::dropIfExists('message_mentions');
        Schema::dropIfExists('messages');
    }
};