<?php
// app/Console/Commands/SetupFrameLockSystem.php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Frame;
use App\Models\FrameLockRequest;
use App\Models\User;
use Illuminate\Support\Facades\Schema;

class SetupFrameLockSystem extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'frames:setup-lock-system 
                           {--test : Create test data}
                           {--cleanup : Clean expired requests}
                           {--reset : Reset all lock states}';

    /**
     * The console command description.
     */
    protected $description = 'Setup and manage the frame lock system';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔒 Frame Lock System Setup');
        $this->newLine();

        // Check if migrations have been run
        if (!$this->checkMigrations()) {
            $this->error('❌ Required migrations not found. Please run migrations first.');
            return 1;
        }

        if ($this->option('cleanup')) {
            return $this->cleanupExpiredRequests();
        }

        if ($this->option('reset')) {
            return $this->resetLockStates();
        }

        if ($this->option('test')) {
            return $this->createTestData();
        }

        // Default: Show system status
        return $this->showSystemStatus();
    }

    /**
     * Check if required database tables exist
     */
    private function checkMigrations(): bool
    {
        $requiredColumns = [
            'frames' => ['is_locked', 'locked_by_user_id', 'locked_at', 'locked_mode', 'lock_reason'],
        ];

        $requiredTables = ['frame_lock_requests'];

        foreach ($requiredColumns as $table => $columns) {
            foreach ($columns as $column) {
                if (!Schema::hasColumn($table, $column)) {
                    $this->error("❌ Column {$table}.{$column} not found");
                    return false;
                }
            }
        }

        foreach ($requiredTables as $table) {
            if (!Schema::hasTable($table)) {
                $this->error("❌ Table {$table} not found");
                return false;
            }
        }

        $this->info('✅ All required database changes are present');
        return true;
    }

    /**
     * Show current system status
     */
    private function showSystemStatus(): int
    {
        $this->info('📊 System Status:');
        $this->newLine();

        // Frame statistics
        $totalFrames = Frame::count();
        $lockedFrames = Frame::locked()->count();
        $unlockedFrames = Frame::unlocked()->count();

        $this->line("Total Frames: {$totalFrames}");
        $this->line("Locked Frames: {$lockedFrames}");
        $this->line("Unlocked Frames: {$unlockedFrames}");
        $this->newLine();

        // Lock request statistics
        $pendingRequests = FrameLockRequest::pending()->count();
        $expiredRequests = FrameLockRequest::expired()->count();
        $approvedRequests = FrameLockRequest::where('status', 'approved')->count();
        $rejectedRequests = FrameLockRequest::where('status', 'rejected')->count();

        $this->line("Pending Requests: {$pendingRequests}");
        $this->line("Expired Requests: {$expiredRequests}");
        $this->line("Approved Requests: {$approvedRequests}");
        $this->line("Rejected Requests: {$rejectedRequests}");
        $this->newLine();

        // Show locked frames details
        if ($lockedFrames > 0) {
            $this->info('🔒 Currently Locked Frames:');
            $locked = Frame::locked()
                ->with(['lockedByUser', 'project'])
                ->get();

            foreach ($locked as $frame) {
                $duration = $frame->locked_at->diffForHumans();
                $lockedBy = $frame->lockedByUser->name ?? 'Unknown';
                $mode = $frame->locked_mode ?? 'Unknown';
                $project = $frame->project->name ?? 'Unknown';

                $this->line("  • {$frame->name} (Project: {$project})");
                $this->line("    Locked by: {$lockedBy} | Mode: {$mode} | Duration: {$duration}");
            }
            $this->newLine();
        }

        // Show pending requests
        if ($pendingRequests > 0) {
            $this->info('⏳ Pending Lock Requests:');
            $pending = FrameLockRequest::pending()
                ->with(['frame', 'requester', 'frameOwner'])
                ->get();

            foreach ($pending as $request) {
                $expiresIn = $request->expires_at->diffForHumans();
                $frameName = $request->frame->name ?? 'Unknown';
                $requesterName = $request->requester->name ?? 'Unknown';
                $ownerName = $request->frameOwner->name ?? 'Unknown';

                $this->line("  • {$frameName} - {$requesterName} → {$ownerName}");
                $this->line("    Mode: {$request->requested_mode} | Expires: {$expiresIn}");
            }
        }

        return 0;
    }

    /**
     * Clean up expired lock requests
     */
    private function cleanupExpiredRequests(): int
    {
        $this->info('🧹 Cleaning up expired lock requests...');

        $expiredCount = FrameLockRequest::cleanupExpired();

        $this->info("✅ Cleaned up {$expiredCount} expired requests");
        return 0;
    }

    /**
     * Reset all frame lock states
     */
    private function resetLockStates(): int
    {
        if (!$this->confirm('⚠️  This will unlock ALL frames and cancel ALL requests. Continue?')) {
            $this->info('Operation cancelled.');
            return 0;
        }

        $this->info('🔄 Resetting all lock states...');

        // Unlock all frames
        $unlockedCount = Frame::locked()->update([
            'is_locked' => false,
            'locked_by_user_id' => null,
            'locked_at' => null,
            'locked_mode' => null,
            'lock_reason' => null,
        ]);

        // Cancel all pending requests
        $cancelledCount = FrameLockRequest::pending()->update([
            'status' => 'rejected',
            'responded_at' => now(),
            'response_message' => 'Cancelled by system reset',
        ]);

        $this->info("✅ Unlocked {$unlockedCount} frames");
        $this->info("✅ Cancelled {$cancelledCount} pending requests");

        return 0;
    }

    /**
     * Create test data for development
     */
    private function createTestData(): int
    {
        $this->info('🧪 Creating test data...');

        $users = User::take(3)->get();
        if ($users->count() < 2) {
            $this->error('❌ Need at least 2 users to create test data');
            return 1;
        }

        $frames = Frame::with('project')->take(5)->get();
        if ($frames->count() < 2) {
            $this->error('❌ Need at least 2 frames to create test data');
            return 1;
        }

        $user1 = $users[0];
        $user2 = $users[1];

        // Lock a frame
        $frame1 = $frames[0];
        $frame1->lock($user1->id, 'forge', 'Testing lock system');

        $this->info("✅ Locked frame '{$frame1->name}' by {$user1->name}");

        // Create a lock request
        if ($frames->count() > 1) {
            $frame2 = $frames[1];
            $frame2->lock($user1->id, 'source', 'Another test lock');

            $request = $frame2->createLockRequest($user2->id, 'source', 'Please let me access this frame for testing');

            $this->info("✅ Created lock request for frame '{$frame2->name}' from {$user2->name} to {$user1->name}");
        }

        // Create an expired request for testing
        if ($frames->count() > 2) {
            $frame3 = $frames[2];
            $frame3->lock($user1->id, 'forge');

            $expiredRequest = FrameLockRequest::create([
                'frame_id' => $frame3->id,
                'requester_user_id' => $user2->id,
                'frame_owner_user_id' => $user1->id,
                'requested_mode' => 'forge',
                'message' => 'This request should be expired',
                'expires_at' => now()->subMinutes(15), // Expired 15 minutes ago
            ]);

            $this->info("✅ Created expired request for testing");
        }

        $this->newLine();
        $this->info('🎉 Test data created successfully!');
        $this->info('You can now test the lock system with:');
        $this->line('  • View status: php artisan frames:setup-lock-system');
        $this->line('  • Clean expired: php artisan frames:setup-lock-system --cleanup');
        $this->line('  • Reset all: php artisan frames:setup-lock-system --reset');

        return 0;
    }
}