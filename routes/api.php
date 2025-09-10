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
    });

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
    });
    
    // Cleanup route (can be called via scheduled task)
    Route::post('/presence/cleanup', [FramePresenceController::class, 'cleanup']);
});