<?php
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\VoidController;
use App\Http\Controllers\ForgeController;
use App\Http\Controllers\SourceController;
use App\Http\Controllers\WorkspaceController; 
use App\Http\Controllers\InviteController; 
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
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

// Public invite routes - MUST be outside auth middleware
Route::get('/invite/{token}', [InviteController::class, 'showInvite'])->name('invite.show');
Route::post('/invite/{token}/accept', [InviteController::class, 'acceptInviteWeb'])->name('invite.accept');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    Route::get('/workspaces/{workspace}/settings', [WorkspaceController::class, 'settings'])->name('workspace.settings');
    
    // Project routes - UPDATED to handle workspace filtering properly
    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::get('/workspaces/{workspace}/projects', [ProjectController::class, 'index'])->name('workspace.projects');
    Route::get('/projects/search', [ProjectController::class, 'search'])->name('projects.search');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    
    // Void page using UUID (moved to VoidController)
    Route::get('/void/{project:uuid}', [VoidController::class, 'show'])->name('void.index');
    
    // Frame creation route (web route for form submission)
    Route::post('/frames', [VoidController::class, 'store'])->name('frames.store');
    
    // Frame-specific routes with the special URL pattern you requested
    Route::get('/void/{project:uuid}/frame={frame:uuid}/modeForge', [ForgeController::class, 'show'])->name('frame.forge');
    
    Route::get('/void/{project:uuid}/frame={frame:uuid}/modeSource', [SourceController::class, 'show'])->name('frame.source');
    
    // Fallback forge and source routes (for temporary demo/testing)
    Route::get('/forge', fn () => Inertia::render('ForgePage'))->name('project.forge');
    Route::get('/source', fn () => Inertia::render('SourcePage'))->name('project.source');
    
    // Admin pages
    Route::get('/user-management', fn () => Inertia::render('Admin/UserManagementPage'))->name('admin.user');
    Route::get('/asset-management', fn () => Inertia::render('Admin/AssetManagerPage'))->name('admin.asset');
    Route::get('/feedback-report', fn () => Inertia::render('Admin/FeedbackReportPage'))->name('admin.feedback');
    Route::get('/project-oversight', fn () => Inertia::render('Admin/ProjectOversightPage'))->name('admin.oversight');
    
    Broadcast::routes();
});

require __DIR__.'/auth.php';