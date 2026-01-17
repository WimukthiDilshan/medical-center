<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AppointmentController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Admin only routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/pending-users', [AdminController::class, 'getPendingUsers']);
        Route::post('/approve-user/{id}', [AdminController::class, 'approveUser']);
        Route::delete('/reject-user/{id}', [AdminController::class, 'rejectUser']);
        Route::get('/users', [AdminController::class, 'getAllUsers']);
        Route::put('/change-password/{id}', [AdminController::class, 'changePassword']);
    });

    // Appointment routes - Nurse & Doctor
    Route::prefix('appointments')->group(function () {
        // Common routes
        Route::get('/', [AppointmentController::class, 'index']);
        Route::get('/{id}', [AppointmentController::class, 'show']);
        Route::get('/user/{userId}/history', [AppointmentController::class, 'history']);
        
        // Nurse routes
        Route::middleware('role:nurse')->group(function () {
            Route::post('/search-user', [AppointmentController::class, 'searchUser']);
            Route::post('/', [AppointmentController::class, 'store']);
            Route::put('/{id}', [AppointmentController::class, 'update']);
            Route::post('/{id}/check-in', [AppointmentController::class, 'checkIn']);
            Route::post('/{id}/cancel', [AppointmentController::class, 'cancel']);
            Route::delete('/{id}', [AppointmentController::class, 'destroy']);
        });

        // Doctor routes
        Route::middleware('role:doctor')->group(function () {
            Route::get('/queue/today', [AppointmentController::class, 'queue']);
            Route::post('/{id}/start', [AppointmentController::class, 'startConsultation']);
            Route::post('/{id}/complete', [AppointmentController::class, 'complete']);
            Route::get('/report/daily', [AppointmentController::class, 'report']);
        });
    });
});
