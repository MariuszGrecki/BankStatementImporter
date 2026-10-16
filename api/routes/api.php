<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\BankAccountController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['status' => 'ok']));

Route::middleware('throttle:10,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
});

Route::middleware('auth:sanctum')
    ->prefix('bank-accounts')
    ->group(function () {
        Route::get('/', [BankAccountController::class, 'index']);
        Route::post('/', [BankAccountController::class, 'store']);
        Route::get('/{bankAccount}', [BankAccountController::class, 'show']);
        Route::match(['put', 'patch'], '/{bankAccount}', [BankAccountController::class, 'update']);
        Route::delete('/{bankAccount}', [BankAccountController::class, 'destroy']);
    });
