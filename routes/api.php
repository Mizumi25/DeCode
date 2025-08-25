<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ComponentController;
use App\Http\Controllers\ProjectComponentController;
use App\Http\Controllers\ProjectController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
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

// Projects CRUD & actions
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::get('/projects/{project}', [ProjectController::class, 'show']);
    Route::put('/projects/{project}', [ProjectController::class, 'update']);
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);

    // Project actions
    Route::post('/projects/{project}/duplicate', [ProjectController::class, 'duplicate']);
    Route::post('/projects/{project}/thumbnail', [ProjectController::class, 'updateThumbnail']);

    // Public templates
    Route::get('/projects/templates', [ProjectController::class, 'templates']);
});
