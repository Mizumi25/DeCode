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
            // Check if the session exists in the sessions table
            $sessionExists = DB::table('sessions')
                ->where('id', $user->current_session_id)
                ->exists();

            if (!$sessionExists) {
                // Session is dead/expired, clear tracking
                $user->update([
                    'current_session_id' => null,
                    'session_started_at' => null,
                    'session_device' => null,
                    'session_ip' => null,
                ]);
                
                $this->line("  ✓ Cleared stale session for: {$user->email}");
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
