<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CleanupStaleSessions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sessions:cleanup-stale';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up stale session tracking data from users table';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🧹 Cleaning up stale session tracking...');

        // Get all users with session tracking data
        $usersWithSessions = User::whereNotNull('current_session_id')->get();

        $cleaned = 0;
        $active = 0;

        foreach ($usersWithSessions as $user) {
            // 🔥 FIX: Check if the session exists AND is not expired
            $sessionActive = DB::table('sessions')
                ->where('id', $user->current_session_id)
                ->where('last_activity', '>', now()->subMinutes(config('session.lifetime', 120))->timestamp)
                ->exists();

            if (!$sessionActive) {
                // Session is dead/expired, clear tracking
                $user->update([
                    'current_session_id' => null,
                    'session_started_at' => null,
                    'session_device' => null,
                    'session_ip' => null,
                ]);
                
                $this->line("  ✓ Cleared stale/expired session for: {$user->email}");
                $cleaned++;
            } else {
                $active++;
            }
        }

        $this->newLine();
        $this->info("✅ Cleanup complete!");
        $this->line("   - Active sessions: {$active}");
        $this->line("   - Cleaned stale sessions: {$cleaned}");

        return Command::SUCCESS;
    }
}
