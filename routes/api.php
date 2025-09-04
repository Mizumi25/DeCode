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

/*
|--------------------------------------------------------------------------
| API Routes
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
        Route::get('/{component}', [ComponentController::class, 'show']);
        Route::post('/', [ComponentController::class, 'store']);
        Route::put('/{component}', [ComponentController::class, 'update']);
        Route::delete('/{component}', [ComponentController::class, 'destroy']);
        Route::post('/generate-code', [ComponentController::class, 'generateCode']);
    });

    // Project component management routes
    Route::prefix('project-components')->group(function () {
        Route::get('/', [ProjectComponentController::class, 'index']);
        Route::post('/', [ProjectComponentController::class, 'store']);
        Route::put('/{projectComponent}', [ProjectComponentController::class, 'update']);
        Route::delete('/{projectComponent}', [ProjectComponentController::class, 'destroy']);
        Route::post('/bulk-update', [ProjectComponentController::class, 'bulkUpdate']);
    });

    // Frame management routes
    Route::prefix('frames')->group(function () {
        Route::get('/', [VoidController::class, 'index']);
        Route::post('/', [VoidController::class, 'store']);
        Route::get('/{frame}', [VoidController::class, 'showFrame']);
        Route::put('/{frame}', [VoidController::class, 'update']);
        Route::delete('/{frame}', [VoidController::class, 'destroy']);
        Route::post('/{frame}/duplicate', [VoidController::class, 'duplicate']);
        Route::put('/{frame}/position', [VoidController::class, 'updatePosition']);
        Route::post('/{frame}/thumbnail', [VoidController::class, 'generateThumbnail']);
    });

    // Get frames by project UUID (for void page)
    Route::get('/projects/{projectUuid}/frames', [VoidController::class, 'getByProject']);
    
    // Projects CRUD & actions
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::put('/projects/{project}', [ProjectController::class, 'update']);
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);
    
    // Project actions
    Route::post('/projects/{project}/duplicate', [ProjectController::class, 'duplicate']);
    Route::post('/projects/{project}/thumbnail', [ProjectController::class, 'updateThumbnail']);
    Route::post('/projects/{project}/frames', [ProjectController::class, 'createFrame']);
    Route::put('/projects/{project}/move-workspace', [ProjectController::class, 'moveToWorkspace']);
    
    // Public templates
    Route::get('/projects/templates', [ProjectController::class, 'templates']);
    
    // Workspace management routes
    Route::prefix('workspaces')->group(function () {
        Route::get('/', [WorkspaceController::class, 'index']);
        Route::post('/', [WorkspaceController::class, 'store']);
        Route::get('/{workspace}', [WorkspaceController::class, 'show']);
        Route::put('/{workspace}', [WorkspaceController::class, 'update']);
        Route::delete('/{workspace}', [WorkspaceController::class, 'destroy']);
        
        // Workspace user management
        Route::put('/{workspace}/users/{user}/role', [WorkspaceController::class, 'updateUserRole']);
        Route::delete('/{workspace}/users/{user}', [WorkspaceController::class, 'removeUser']);
        
        // Workspace invites
        Route::get('/{workspace}/invites', [InviteController::class, 'getWorkspaceInvites']);
    });

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
    });
});