<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Project routes
    Route::get('/projects', [ProjectController::class, 'index'])->name('projects');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    
    // Project editor page using UUID
    Route::get('/void/{project:uuid}', [ProjectController::class, 'show'])->name('void.index');
    
    // Frame-specific routes with the special URL pattern you requested
    Route::get('/void/{project:uuid}/frame={frame:uuid}/modeForge', function ($project, $frame) {
        // Verify the frame belongs to the project
        if ($frame->project_id !== $project->id) {
            abort(404);
        }
        
        return Inertia::render('ForgePage', [
            'project' => $project,
            'frame' => $frame,
            'mode' => 'forge'
        ]);
    })->name('frame.forge');
    
    Route::get('/void/{project:uuid}/frame={frame:uuid}/modeSource', function ($project, $frame) {
        // Verify the frame belongs to the project
        if ($frame->project_id !== $project->id) {
            abort(404);
        }
        
        return Inertia::render('SourcePage', [
            'project' => $project,
            'frame' => $frame,
            'mode' => 'source'
        ]);
    })->name('frame.source');
    
    // Fallback forge and source routes (for temporary demo/testing)
    Route::get('/forge', fn () => Inertia::render('ForgePage'))->name('project.forge');
    Route::get('/source', fn () => Inertia::render('SourcePage'))->name('project.source');
    
    // Admin pages
    Route::get('/user-management', fn () => Inertia::render('Admin/UserManagementPage'))->name('admin.user');
    Route::get('/asset-management', fn () => Inertia::render('Admin/AssetManagerPage'))->name('admin.asset');
    Route::get('/feedback-report', fn () => Inertia::render('Admin/FeedbackReportPage'))->name('admin.feedback');
    Route::get('/project-oversight', fn () => Inertia::render('Admin/ProjectOversightPage'))->name('admin.oversight');
});

require __DIR__.'/auth.php';