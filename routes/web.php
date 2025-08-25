<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Project;

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
    
    // Project list page (Inertia)
    Route::get('/projects', fn () => Inertia::render('ProjectList'))->name('projects');

    // Extra: ProjectController index (API-based view if needed)
    Route::get('/projects/list', [ProjectController::class, 'index'])->name('projects.index');

    // Project editor routes
    Route::get('/projects/{id}/void', fn ($id) => Inertia::render('VoidPage', [
        'projectId' => $id
    ]))->name('project.void');

    Route::get('/projects/{id}/forge/{frameId}', fn ($id, $frameId) => Inertia::render('ForgePage', [
        'projectId' => $id,
        'frameId' => $frameId
    ]))->name('project.forge');

    Route::get('/projects/{id}/source/{frameId}', fn ($id, $frameId) => Inertia::render('SourcePage', [
        'projectId' => $id,
        'frameId' => $frameId
    ]))->name('project.source');

    // Optional direct void editor using controller
    Route::get('/void/editor/{project}', function ($project) {
        return Inertia::render('Void/Editor', [
            'project' => Project::findOrFail($project)
        ]);
    })->name('void.editor');

    // Temporary demo/testing routes
    Route::get('/void', fn () => Inertia::render('VoidPage'))->name('project.void');
    Route::get('/forge', fn () => Inertia::render('ForgePage'))->name('project.forge');
    Route::get('/source', fn () => Inertia::render('SourcePage'))->name('project.source');
    
    // Admin pages
    Route::get('/user-management', fn () => Inertia::render('Admin/UserManagementPage'))->name('admin.user');
    Route::get('/asset-management', fn () => Inertia::render('Admin/AssetManagerPage'))->name('admin.asset');
    Route::get('/feedback-report', fn () => Inertia::render('Admin/FeedbackReportPage'))->name('admin.feedback');
    Route::get('/project-oversight', fn () => Inertia::render('Admin/ProjectOversightPage'))->name('admin.oversight');
});

require __DIR__.'/auth.php';
