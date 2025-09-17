<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Project;
use App\Models\Revision;
use App\Http\Controllers\GitHubRepoController;

class SyncGitHubProjects extends Command
{
    protected $signature = 'github:sync {--project=} {--force}';
    protected $description = 'Sync GitHub imported projects with their repositories';

    public function handle()
    {
        $projectUuid = $this->option('project');
        $force = $this->option('force');
        
        if ($projectUuid) {
            $project = Project::where('uuid', $projectUuid)->first();
            if (!$project) {
                $this->error("Project not found: {$projectUuid}");
                return 1;
            }
            
            return $this->syncProject($project, $force);
        }
        
        // Sync all GitHub projects
        $projects = Project::whereNotNull('settings->imported_from_github')->get();
        
        $this->info("Found {$projects->count()} GitHub projects to sync");
        
        foreach ($projects as $project) {
            $this->syncProject($project, $force);
        }
        
        return 0;
    }
    
    private function syncProject(Project $project, bool $force = false): int
    {
        if (!$project->isGitHubImport()) {
            $this->warn("Project {$project->name} is not a GitHub import");
            return 1;
        }
        
        $this->info("Syncing project: {$project->name}");
        
        try {
            // Create pre-sync revision
            $project->syncWithGitHub();
            
            $this->info("✅ Synced: {$project->name}");
            return 0;
            
        } catch (\Exception $e) {
            $this->error("❌ Failed to sync {$project->name}: " . $e->getMessage());
            return 1;
        }
    }
}