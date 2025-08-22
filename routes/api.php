<?php
// routes/api.php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ComponentController;
use App\Http\Controllers\ProjectComponentController;

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