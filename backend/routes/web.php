<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// ================================================
// TEMPORARY API ROUTES (to bypass /api prefix issue)
// ================================================
Route::get('/test', function () {
    return 'API test works from web.php';
});

Route::get('/keys', [App\Http\Controllers\KeyListController::class, 'index']);
Route::get('/keys/{id}/logs', [App\Http\Controllers\KeyListController::class, 'logs']);

// Add other API routes as needed (login, key-logs, etc.) – but we keep minimal for test
// ================================================

// Original welcome route
Route::get('/', function () {
    return view('welcome');
});