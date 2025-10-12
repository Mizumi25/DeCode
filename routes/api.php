<?php
// routes/api.php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ComponentController;
use App\Http\Controllers\ProjectComponentController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\VoidController; 
use App\Http\Controllers\WorkspaceController; 
use App\Http\Controllers\InviteController; 
use App\Http\Controllers\GitHubRepoController;
use App\Http\Controllers\Auth\GithubController;
use App\Http\Controllers\FramePresenceController;
use App\Http\Controllers\FrameLockController;
use App\Http\Controllers\RevisionController;
use App\Models\Frame;
use App\Models\ProjectComponent;
use App\Http\Controllers\ForgePageController;
/*
|--------------------------------------------------------------------------
| API Routes - All using UUIDs for resource identification
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        $user = $request->user();
        $user->load(['ownedWorkspaces', 'workspaces']);
        return $user;
    });

    // Component management routes
    Route::prefix('components')->group(function () {
        Route::get('/', [ComponentController::class, 'index']);
        Route::get('/search', [ComponentController::class, 'search']);
        Route::get('/letter', [ComponentController::class, 'getByLetter']);
        Route::get('/{component:uuid}', [ComponentController::class, 'show']);
        Route::post('/', [ComponentController::class, 'store']);
        Route::put('/{component:uuid}', [ComponentController::class, 'update']);
        Route::delete('/{component:uuid}', [ComponentController::class, 'destroy']);
        Route::post('/generate-code', [ComponentController::class, 'generateCode']);
    });

    // Project component management routes
    Route::prefix('project-components')->group(function () {
        Route::get('/', [ProjectComponentController::class, 'index']);
        Route::post('/', [ProjectComponentController::class, 'store']);
        Route::put('/{projectComponent:uuid}', [ProjectComponentController::class, 'update']);
        Route::delete('/{projectComponent:uuid}', [ProjectComponentController::class, 'destroy']);
        Route::post('/bulk-update', [ProjectComponentController::class, 'bulkUpdate']);
        Route::post('/create-revision', [ProjectComponentController::class, 'createRevision']);
        Route::post('/restore-revision/{revision:uuid}', [ProjectComponentController::class, 'restoreRevision']);
    });
    
    // Revision management routes
    Route::prefix('revisions')->group(function () {
        Route::get('/project/{project:uuid}', [RevisionController::class, 'getProjectRevisions']);
        Route::get('/frame/{frame:uuid}', [RevisionController::class, 'getFrameRevisions']);
        Route::get('/{revision:uuid}', [RevisionController::class, 'show']);
        Route::delete('/{revision:uuid}', [RevisionController::class, 'destroy']);
        Route::post('/cleanup-old', [RevisionController::class, 'cleanupOld']);
    });
    
    // Auto-revision creation
    Route::post('/revisions/create-auto', [RevisionController::class, 'createAutoRevision']);

    // Frame management routes
    Route::prefix('frames')->group(function () {
        Route::get('/', [VoidController::class, 'index']);
        Route::post('/', [VoidController::class, 'store']);
        Route::get('/{frame:uuid}', [VoidController::class, 'showFrame']);
        Route::put('/{frame:uuid}', [VoidController::class, 'update']);
        Route::delete('/{frame:uuid}', [VoidController::class, 'destroy']);
        Route::post('/{frame:uuid}/duplicate', [VoidController::class, 'duplicate']);
        Route::put('/{frame:uuid}/position', [VoidController::class, 'updatePosition']);
        Route::post('/{frame:uuid}/thumbnail', [VoidController::class, 'generateThumbnail']);
        
        Route::get('/{frame:uuid}/components', function(Frame $frame) {
            $components = \App\Models\ProjectComponent::where('frame_id', $frame->id)
                ->with('component')
                ->ordered()
                ->get();
                
            $tree = buildComponentTree($components);
            
            return response()->json([
                'success' => true,
                'data' => $tree
            ]);
        });
        
        // Frame presence routes
        Route::prefix('{frame:uuid}/presence')->group(function () {
            Route::post('/join', [FramePresenceController::class, 'join']);
            Route::post('/leave', [FramePresenceController::class, 'leave']);
            Route::put('/mode', [FramePresenceController::class, 'updateMode']);
            Route::post('/heartbeat', [FramePresenceController::class, 'heartbeat']);
            Route::get('/', [FramePresenceController::class, 'index']);
        });
    });
    
    // Frame lock system routes
    Route::prefix('frames/{frame:uuid}/lock')->group(function () {
        Route::post('/toggle', [FrameLockController::class, 'toggleLock']);
        Route::post('/request', [FrameLockController::class, 'requestAccess']);
        Route::get('/status', [FrameLockController::class, 'getLockStatus']);
        Route::post('/force-unlock', [FrameLockController::class, 'forceUnlock']);
    });
    
    // Frame lock request management
    Route::prefix('lock-requests')->group(function () {
        Route::get('/pending', [FrameLockController::class, 'getPendingRequests']);
        Route::post('/{lockRequest:uuid}/respond', [FrameLockController::class, 'respondToRequest']);
        Route::delete('/{lockRequest:uuid}/cancel', [FrameLockController::class, 'cancelRequest']);
        Route::post('/cleanup-expired', [FrameLockController::class, 'cleanupExpired']);
    });

    // Get frames by project UUID (for void page)
    Route::get('/projects/{project:uuid}/frames', [VoidController::class, 'getByProject']);
    
    // Projects CRUD & actions
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::put('/projects/{project:uuid}', [ProjectController::class, 'update']);
    Route::delete('/projects/{project:uuid}', [ProjectController::class, 'destroy']);
    
    // Project actions
    Route::post('/projects/{project:uuid}/duplicate', [ProjectController::class, 'duplicate']);
    Route::post('/projects/{project:uuid}/thumbnail', [ProjectController::class, 'updateThumbnail']);
    Route::post('/projects/{project:uuid}/frames', [ProjectController::class, 'createFrame']);
    Route::put('/projects/{project:uuid}/move-workspace', [ProjectController::class, 'moveToWorkspace']);
    
    // Project copy/paste/move operations
    Route::post('/projects/{project:uuid}/copy', [ProjectController::class, 'copyProject']);
    Route::post('/projects/paste', [ProjectController::class, 'pasteProject']);
    Route::post('/projects/{project:uuid}/move-to-workspace', [ProjectController::class, 'moveProjectToWorkspace']);
    Route::get('/projects/clipboard-status', [ProjectController::class, 'getClipboardStatus']);
    Route::delete('/projects/clear-clipboard', [ProjectController::class, 'clearClipboard']);
    
    // Pull to refresh endpoint
    Route::post('/projects/refresh', [ProjectController::class, 'refreshProjects']);
    
    // Public templates
    Route::get('/projects/templates', [ProjectController::class, 'templates']);
    
    // Workspace management routes - FIXED: Remove double prefix
    Route::get('/workspaces', [WorkspaceController::class, 'index']);
    Route::post('/workspaces', [WorkspaceController::class, 'store']);
    Route::get('/workspaces/{workspace:uuid}', [WorkspaceController::class, 'show']);
    Route::put('/workspaces/{workspace:uuid}', [WorkspaceController::class, 'update']);
    Route::delete('/workspaces/{workspace:uuid}', [WorkspaceController::class, 'destroy']);
    
    // Workspace user management
    Route::put('/workspaces/{workspace:uuid}/users/{user}', [WorkspaceController::class, 'updateUserRole']);
    Route::delete('/workspaces/{workspace:uuid}/users/{user}', [WorkspaceController::class, 'removeUser']);
    
    // Workspace invites
    Route::get('/workspaces/{workspace:uuid}/invites', [InviteController::class, 'getWorkspaceInvites']);
    


    // Workspace user discipline management
    Route::put('/workspaces/{workspace:uuid}/users/{user}/discipline', [WorkspaceController::class, 'updateUserDiscipline']);
    Route::post('/workspaces/{workspace:uuid}/discipline-orders', [WorkspaceController::class, 'updateDisciplineOrders']);

    // Invite Management (separate from workspace routes for cleaner organization)
    Route::prefix('invites')->group(function () {
        Route::post('/generate-link', [InviteController::class, 'generateLink']);
        Route::post('/send-email', [InviteController::class, 'sendEmailInvite']);
        Route::post('/accept/{token}', [InviteController::class, 'acceptInvite']);
        Route::delete('/{invite}', [InviteController::class, 'revokeInvite']);
        Route::post('/{invite}/resend', [InviteController::class, 'resendInvite']);
        Route::post('/cleanup-expired', [InviteController::class, 'cleanupExpired']);
    });

    // GitHub Integration Routes
    Route::prefix('github')->group(function () {
        // Check GitHub connection status
        Route::get('/status', [GitHubRepoController::class, 'checkConnection']);
        
        // Get user's repositories
        Route::get('/repos', [GitHubRepoController::class, 'getUserRepos']);
        
        // Refresh repositories (force fetch from GitHub)
        Route::post('/repos/refresh', [GitHubRepoController::class, 'refreshRepos']);
        
        // Get specific repository details
        Route::get('/repos/{repoId}', [GitHubRepoController::class, 'getRepositoryDetails']);
        
        // Import project from GitHub repository
        Route::post('/import-project', [GitHubRepoController::class, 'importProject']);
        
        // Get repository contents (for future parsing)
        Route::get('/repos/{repoId}/contents/{path?}', [GitHubRepoController::class, 'getRepositoryContents'])->where('path', '.*');
        
        // Disconnect GitHub account
        Route::delete('/disconnect', [GithubController::class, 'disconnect']);
        
        Route::get('/repos/{repoId}/analyze', [GitHubRepoController::class, 'analyzeRepository']);
        Route::get('/repos/{repoId}/contents/{path?}', [GitHubRepoController::class, 'getRepositoryContents'])->where('path', '.*');
        
        // Sync GitHub projects
        Route::post('/projects/{project:uuid}/sync', [GitHubRepoController::class, 'syncProject']);
        Route::post('/projects/sync-all', [GitHubRepoController::class, 'syncAllProjects']);
        
        // GitHub revision management
        Route::get('/projects/{project:uuid}/revisions', [GitHubRepoController::class, 'getGitHubRevisions']);
        Route::post('/projects/{project:uuid}/create-sync-revision', [GitHubRepoController::class, 'createSyncRevision']);

    });
    
    
    // Frame thumbnail routes
    Route::prefix('frames/{frame:uuid}')->group(function () {
        // Generate thumbnail from frame data
        Route::post('/thumbnail', [VoidController::class, 'generateThumbnail'])
            ->name('frames.generate-thumbnail');
            
        // Generate thumbnail from current canvas state
        Route::post('/thumbnail/canvas', [VoidController::class, 'generateThumbnailFromCanvas'])
            ->name('frames.generate-thumbnail-canvas');
            
        // Get thumbnail status and URL
        Route::get('/thumbnail/status', [VoidController::class, 'getThumbnailStatus'])
            ->name('frames.thumbnail-status');
    });
    
    // Batch thumbnail operations
    Route::prefix('thumbnails')->group(function () {
        // Batch generate thumbnails for multiple frames
        Route::post('/batch-generate', [VoidController::class, 'batchGenerateThumbnails'])
            ->name('thumbnails.batch-generate');
            
        // Clean up old thumbnail files
        Route::post('/cleanup', [VoidController::class, 'cleanupThumbnails'])
            ->name('thumbnails.cleanup');
            
        // Check Playwright availability
        Route::get('/playwright-status', [VoidController::class, 'checkPlaywrightStatus'])
            ->name('thumbnails.playwright-status');
    });
    
    // Cleanup route (can be called via scheduled task)
    Route::post('/presence/cleanup', [FramePresenceController::class, 'cleanup']);
    
    
    

    // Test thumbnail generation endpoint
    Route::get('/test-thumbnails', function() {
        $user = auth()->user();
        $frames = \App\Models\Frame::where('project_id', 
            \App\Models\Project::where('user_id', $user->id)->first()->id ?? 0
        )->take(5)->get();
        
        $results = [];
        
        foreach ($frames as $frame) {
            try {
                // Check current thumbnail status
                $settings = $frame->settings ?? [];
                $currentThumbnail = $settings['thumbnail_path'] ?? null;
                $currentUrl = $currentThumbnail ? asset('storage/' . $currentThumbnail) : null;
                
                // Generate new thumbnail
                $thumbnailDir = storage_path('app/public/thumbnails/frames');
                if (!file_exists($thumbnailDir)) {
                    mkdir($thumbnailDir, 0755, true);
                }
                
                $timestamp = time();
                $thumbnailPath = $thumbnailDir . '/' . $frame->uuid . '_test_' . $timestamp . '.svg';
                
                // Create test SVG
                $svg = '<?xml version="1.0" encoding="UTF-8"?>
                <svg width="320" height="224" viewBox="0 0 320 224" xmlns="http://www.w3.org/2000/svg">
                    <rect width="320" height="224" fill="#f8fafc" rx="8"/>
                    <rect x="0" y="0" width="320" height="32" fill="#3b82f6" rx="8"/>
                    <circle cx="16" cy="16" r="4" fill="#ffffff"/>
                    <circle cx="32" cy="16" r="4" fill="#ffffff" opacity="0.7"/>
                    <circle cx="48" cy="16" r="4" fill="#ffffff" opacity="0.5"/>
                    <text x="160" y="60" font-family="Arial" font-size="14" fill="#1f2937" text-anchor="middle" font-weight="bold">TEST THUMBNAIL</text>
                    <text x="160" y="80" font-family="Arial" font-size="12" fill="#6b7280" text-anchor="middle">' . htmlspecialchars($frame->name) . '</text>
                    <text x="160" y="100" font-family="Arial" font-size="10" fill="#9ca3af" text-anchor="middle">Generated: ' . date('Y-m-d H:i:s') . '</text>
                    <rect x="40" y="120" width="240" height="60" fill="#e5e7eb" rx="4"/>
                    <rect x="50" y="130" width="220" height="8" fill="#d1d5db" rx="2"/>
                    <rect x="50" y="145" width="180" height="8" fill="#d1d5db" rx="2"/>
                    <rect x="50" y="160" width="160" height="8" fill="#d1d5db" rx="2"/>
                </svg>';
                
                file_put_contents($thumbnailPath, $svg);
                
                // Update frame settings
                $newSettings = array_merge($settings, [
                    'thumbnail_generated' => true,
                    'thumbnail_path' => 'thumbnails/frames/' . $frame->uuid . '_test_' . $timestamp . '.svg',
                    'thumbnail_generated_at' => now()->toISOString(),
                    'thumbnail_version' => $timestamp,
                    'thumbnail_method' => 'test'
                ]);
                
                $frame->update(['settings' => $newSettings]);
                
                $newUrl = asset('storage/' . $newSettings['thumbnail_path']);
                
                $results[] = [
                    'frame_uuid' => $frame->uuid,
                    'frame_name' => $frame->name,
                    'success' => true,
                    'previous_thumbnail' => $currentUrl,
                    'new_thumbnail' => $newUrl,
                    'file_exists' => file_exists($thumbnailPath),
                    'file_size' => filesize($thumbnailPath),
                ];
                
            } catch (\Exception $e) {
                $results[] = [
                    'frame_uuid' => $frame->uuid,
                    'frame_name' => $frame->name,
                    'success' => false,
                    'error' => $e->getMessage(),
                ];
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Test thumbnail generation completed',
            'results' => $results,
            'storage_path' => storage_path('app/public/thumbnails/frames'),
            'public_url_base' => asset('storage/thumbnails/frames/'),
        ]);
    });
});

function buildComponentTree($components, $parentId = null) {
    $tree = [];
    foreach ($components as $comp) {
        if ($comp->parent_id == $parentId) {
            $node = [
                'id' => $comp->component_instance_id,
                'type' => $comp->component_type,
                'props' => $comp->props,
                'name' => $comp->name,
                'style' => $comp->style ?? [],
                'children' => buildComponentTree($components, $comp->id)
            ];
            $tree[] = $node;
        }
    }
    return $tree;
}


  
