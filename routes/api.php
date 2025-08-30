<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ComponentController;
use App\Http\Controllers\ProjectComponentController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\VoidController; 

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
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

    // Public templates
    Route::get('/projects/templates', [ProjectController::class, 'templates']);
});