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
use App\Http\Controllers\MessageController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\CollaborationController;
use App\Http\Controllers\AiController;
use App\Http\Controllers\FrameContainerController;
use App\Http\Controllers\WorkspaceRoleController;
/*
|--------------------------------------------------------------------------
| API Routes - All using UUIDs for resource identification
|--------------------------------------------------------------------------
*/

// Public routes (no auth required)
Route::post('/check-email', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
    ]);
    
    $exists = \App\Models\User::where('email', $request->email)->exists();
    
    return response()->json([
        'available' => !$exists,
    ]);
});

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
        // Frame canvas styles (BEFORE the generic /{frame:uuid} route)
Route::put('/{frame:uuid}/canvas-styles', [VoidController::class, 'updateCanvasStyles']);
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
        
        // 🔥 NEW: Get frame assignments (linked components) for a specific frame
        Route::get('/{frame:uuid}/assignments', [App\Http\Controllers\FrameComponentAssignmentController::class, 'getForFrame']);
    });
    
    // Frame Container routes
    Route::prefix('projects/{project:uuid}/containers')->group(function () {
        Route::get('/', [FrameContainerController::class, 'index']);
        Route::post('/', [FrameContainerController::class, 'store']);
        Route::patch('/{container:uuid}', [FrameContainerController::class, 'update']);
        Route::delete('/{container:uuid}', [FrameContainerController::class, 'destroy']);
        Route::post('/{container:uuid}/frames/{frame:uuid}', [FrameContainerController::class, 'addFrame']);
        Route::patch('/{container:uuid}/reorder', [FrameContainerController::class, 'reorderFrames']);
    });
    
    // Remove frame from container
    Route::delete('/frames/{frame:uuid}/container', [FrameContainerController::class, 'removeFrame']);
    
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
    
    // Frame Component Assignments
    Route::get('/projects/{project:uuid}/frame-assignments', [App\Http\Controllers\FrameComponentAssignmentController::class, 'index']);
    Route::post('/frame-assignments/assign', [App\Http\Controllers\FrameComponentAssignmentController::class, 'assign']);
    Route::post('/frame-assignments/unassign', [App\Http\Controllers\FrameComponentAssignmentController::class, 'unassign']);
    Route::put('/frame-assignments/{assignment}/position', [App\Http\Controllers\FrameComponentAssignmentController::class, 'updatePosition']);
    
    // Projects CRUD & actions
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::put('/projects/{project:uuid}', [ProjectController::class, 'update']);
    Route::delete('/projects/{project:uuid}', [ProjectController::class, 'destroy']);
    
    // Project search (for real-time search without page reload)
    Route::get('/projects/search', [ProjectController::class, 'search']);
    
    // Project actions
    Route::post('/projects/{project:uuid}/duplicate', [ProjectController::class, 'duplicate']);
    Route::post('/projects/{project:uuid}/move', [ProjectController::class, 'moveToWorkspace']);
    Route::post('/projects/{project:uuid}/thumbnail', [ProjectController::class, 'updateThumbnail']);
    Route::put('/projects/{project:uuid}/style-settings', [ProjectController::class, 'updateStyleSettings']);
    
    // Project thumbnail generation - Playwright PRIMARY, Canvas FALLBACK
    Route::post('/projects/{project:uuid}/thumbnail/playwright', [ProjectController::class, 'generateThumbnailPlaywright']);
    Route::post('/projects/{project:uuid}/thumbnail/snapshot', [ProjectController::class, 'updateThumbnailFromSnapshot']);
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
    
    
  Route::prefix('assets')->group(function () {
        Route::get('/', [AssetController::class, 'index']);
        Route::post('/', [AssetController::class, 'store']);
        Route::get('/{asset:uuid}', [AssetController::class, 'show']);
        Route::delete('/{asset:uuid}', [AssetController::class, 'destroy']);
        Route::post('/remove-background', [AssetController::class, 'removeBackground']);
        Route::post('/bulk-delete', [AssetController::class, 'bulkDelete']);
        Route::get('/search', [AssetController::class, 'search']);
    });
    

// Workspace message routes - IMPORTANT: Use {workspaceId} not {workspace:uuid}
Route::prefix('workspaces/{workspaceId}/messages')->group(function () {
    Route::get('/', [MessageController::class, 'index'])->name('api.messages.index');
    Route::post('/', [MessageController::class, 'store'])->name('api.messages.store');
    Route::post('/mark-read', [MessageController::class, 'markAsRead'])->name('api.messages.mark-read');
    Route::get('/mentionables', [MessageController::class, 'searchMentionables'])->name('api.messages.mentionables');
});
        
    // Workspace user management
    Route::put('/workspaces/{workspace:uuid}/users/{user}', [WorkspaceController::class, 'updateUserRole']);
    Route::delete('/workspaces/{workspace:uuid}/users/{user}', [WorkspaceController::class, 'removeUser']);
    
    // New role management routes
    Route::post('/workspaces/{workspace:uuid}/roles/update', [WorkspaceRoleController::class, 'updateRole']);
    Route::post('/workspaces/{workspace:uuid}/roles/transfer-ownership', [WorkspaceRoleController::class, 'transferOwnership']);
    Route::get('/workspaces/{workspace:uuid}/roles/my-role', [WorkspaceRoleController::class, 'getMyRole']);
    
    // Notifications
    Route::get('/notifications', [App\Http\Controllers\NotificationController::class, 'index']);
    Route::post('/notifications/{uuid}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{uuid}', [App\Http\Controllers\NotificationController::class, 'delete']);
});

// Public routes for session conflict
Route::post('/auth/force-logout', [App\Http\Controllers\Auth\SessionConflictController::class, 'forceLogout']);

Route::middleware(['auth:sanctum'])->group(function () {
    
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
    
    
    
    
    Route::prefix('frames/{frame:uuid}/collaboration')->group(function () {
        // Cursor management
        Route::post('/cursor', [CollaborationController::class, 'updateCursor']);
        Route::get('/cursors', [CollaborationController::class, 'getActiveCursors']);
        Route::post('/remove-cursor', [CollaborationController::class, 'removeCursor']);
        
        // Element dragging
        Route::post('/drag-start', [CollaborationController::class, 'dragStart']);
        Route::post('/drag-move', [CollaborationController::class, 'dragMove']);
        Route::post('/drag-end', [CollaborationController::class, 'dragEnd']);
// 🔥 ADD THIS NEW ROUTE
    Route::post('/component-update', [CollaborationController::class, 'updateComponent']);
Route::post('/realtime-update', [CollaborationController::class, 'realtimeUpdate']);
    Route::post('/state-changed', [CollaborationController::class, 'stateChanged']);
});
    
    // Cleanup endpoint (can be scheduled)
    Route::post('/collaboration/cleanup', [CollaborationController::class, 'cleanup']);
    
    
    
    
    
    
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
    
    // AI generation route
    Route::post('/ai/generate-template', [AiController::class, 'generateTemplate']);
    
    // Export routes
    Route::post('/projects/{project:uuid}/export/preview', [App\Http\Controllers\ExportController::class, 'previewExport']);
    Route::post('/projects/{project:uuid}/export/zip', [App\Http\Controllers\ExportController::class, 'exportAsZip']);
    Route::post('/projects/{project:uuid}/export/github', [App\Http\Controllers\ExportController::class, 'exportToGitHub']);

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

if (!function_exists('buildComponentTree')) {
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
}


  
