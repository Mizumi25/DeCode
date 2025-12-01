<?php

namespace App\Jobs;

use App\Models\Project;
use App\Services\VoidPagePlaywrightService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GenerateProjectThumbnail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 120; // 2 minutes timeout
    public $tries = 1; // Don't retry on failure

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Project $project,
        public array $options = []
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('🎬 [Job] Starting Playwright thumbnail generation', [
            'project_id' => $this->project->uuid,
            'project_name' => $this->project->name,
        ]);

        try {
            $service = new VoidPagePlaywrightService();
            
            $result = $service->generateVoidPageThumbnail($this->project, [
                'width' => $this->options['width'] ?? 1600,
                'height' => $this->options['height'] ?? 1000,
                'quality' => $this->options['quality'] ?? 90,
                'wait_time' => $this->options['wait_time'] ?? 3000,
            ]);

            if ($result) {
                Log::info('✅ [Job] Playwright thumbnail generated successfully', [
                    'project_id' => $this->project->uuid,
                    'path' => $result,
                ]);
            } else {
                Log::warning('⚠️ [Job] Playwright thumbnail generation returned null', [
                    'project_id' => $this->project->uuid,
                ]);
            }

        } catch (\Exception $e) {
            Log::error('❌ [Job] Playwright thumbnail generation failed', [
                'project_id' => $this->project->uuid,
                'error' => $e->getMessage(),
            ]);
            
            throw $e; // Re-throw to mark job as failed
        }
    }
}
