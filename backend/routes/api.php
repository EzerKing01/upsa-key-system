<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\KeyLogController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\KeyListController;
use App\Http\Controllers\KeyController;
use Illuminate\Support\Facades\Route;

Route::get('/test', function () {
    return 'API test works';
});
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Temporary route to clear cache (optional – remove after use)
Route::get('/clear-config', function() {
    \Artisan::call('config:clear');
    \Artisan::call('cache:clear');
    \Artisan::call('route:clear');
    return 'Configuration cache cleared.';
});

// Authenticated routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Keys (read for all authenticated users)
    Route::get('/keys', [KeyListController::class, 'index']);
    Route::get('/keys/{id}/logs', [KeyListController::class, 'logs']);

    // Key logs
    Route::get('/key-logs', [KeyLogController::class, 'index']);
    Route::post('/key-logs', [KeyLogController::class, 'store']);
    Route::put('/key-logs/{id}', [KeyLogController::class, 'update']);
    Route::get('/key-logs/today', [KeyLogController::class, 'todayStats']);
    Route::get('/key-logs/shift-handover', [KeyLogController::class, 'shiftHandover']);
    Route::get('/key-logs/daily-logs', [KeyLogController::class, 'dailyLogs']);
    Route::get('/key-logs/export-pdf/{date}', [KeyLogController::class, 'exportPdf']);
});

// Admin only routes
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Key management (admin CRUD)
    Route::get('/keys-admin', [KeyController::class, 'index']);
    Route::post('/keys', [KeyController::class, 'store']);
    Route::put('/keys/{id}', [KeyController::class, 'update']);
    Route::delete('/keys/{id}', [KeyController::class, 'destroy']);
    Route::post('/keys/bulk', [KeyController::class, 'bulkStore']);

    // User management
    Route::get('/users', [AdminController::class, 'index']);
    Route::post('/users', [AdminController::class, 'store']);
});