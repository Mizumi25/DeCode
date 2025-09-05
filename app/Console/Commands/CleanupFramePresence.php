<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class CleanupFramePresence extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'presence:cleanup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up expired frame presence data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting frame presence cleanup...');
        
        try {
            // Call the cleanup endpoint
            $response = Http::post('/api/presence/cleanup');
            
            if ($response->successful()) {
                $data = $response->json();
                $this->info("Cleanup completed. Cleaned {$data['cleaned_entries']} entries.");
            } else {
                $this->error('Cleanup request failed.');
            }
        } catch (\Exception $e) {
            $this->error('Cleanup failed: ' . $e->getMessage());
        }
    }
}