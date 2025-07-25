<?php

use App\Http\Controllers\ProfileController;
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
    
    
    Route::get('/projects', fn () => Inertia::render('ProjectList'))->name('projects');

    Route::get('/projects/{id}/void', fn ($id) => Inertia::render('VoidPage', ['projectId' => $id]))->name('project.void');

    Route::get('/projects/{id}/forge/{frameId}', fn ($id, $frameId) => Inertia::render('ForgePage', ['projectId' => $id, 'frameId' => $frameId]))->name('project.forge');

    Route::get('/projects/{id}/source/{frameId}', fn ($id, $frameId) => Inertia::render('SourcePage', ['projectId' => $id, 'frameId' => $frameId]))->name('project.source');
});

require __DIR__.'/auth.php';
