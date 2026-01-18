<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\MedicalCertificateController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/change-password', [AuthController::class, 'changePassword']);
    
    // User signature routes
    Route::post('/signature', [UserController::class, 'uploadSignature']);
    Route::get('/signature', [UserController::class, 'getSignature']);
    Route::delete('/signature', [UserController::class, 'deleteSignature']);
    
    // Admin only routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/pending-users', [AdminController::class, 'getPendingUsers']);
        Route::post('/approve-user/{id}', [AdminController::class, 'approveUser']);
        Route::delete('/reject-user/{id}', [AdminController::class, 'rejectUser']);
        Route::get('/users', [AdminController::class, 'getAllUsers']);
        Route::put('/change-password/{id}', [AdminController::class, 'changePassword']);
        Route::put('/change-own-password', [AdminController::class, 'changeOwnPassword']);
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

    // Prescription routes
    Route::prefix('prescriptions')->group(function () {
        // Common routes (nurse, pharmacist, doctor)
        Route::get('/', [PrescriptionController::class, 'index']);
        Route::get('/{id}', [PrescriptionController::class, 'show']);
        Route::get('/patient/{patientId}', [PrescriptionController::class, 'patientPrescriptions']);
        
        // Doctor routes
        Route::middleware('role:doctor')->group(function () {
            Route::post('/', [PrescriptionController::class, 'store']);
        });

        // Pharmacist routes
        Route::middleware('role:pharmacist')->group(function () {
            Route::get('/pending/today', [PrescriptionController::class, 'pending']);
            Route::post('/{id}/dispense', [PrescriptionController::class, 'dispense']);
            Route::post('/{id}/complete', [PrescriptionController::class, 'complete']);
        });
    });

    // Lab Report routes
    Route::prefix('lab-reports')->group(function () {
        // Patient routes (student/staff)
        Route::middleware('role:student,staff')->group(function () {
            Route::get('/my-reports', [App\Http\Controllers\LabReportController::class, 'patientReports']);
            Route::get('/download/{appointmentId}', [App\Http\Controllers\LabReportController::class, 'downloadReport']);
        });
    });

    // Medical Certificate routes
    Route::prefix('medical-certificates')->group(function () {
        // Common routes - get all and get one
        Route::get('/', [MedicalCertificateController::class, 'index']);
        Route::get('/{id}', [MedicalCertificateController::class, 'show']);
        
        // Student/Staff routes - request new certificate
        Route::middleware('role:student,staff')->group(function () {
            Route::post('/', [MedicalCertificateController::class, 'store']);
        });

        // Doctor routes - approve/reject
        Route::middleware('role:doctor')->group(function () {
            Route::post('/{id}/approve', [MedicalCertificateController::class, 'approve']);
            Route::post('/{id}/reject', [MedicalCertificateController::class, 'reject']);
        });

        // Admin routes - statistics
        Route::middleware('role:admin')->group(function () {
            Route::get('/stats/overview', [MedicalCertificateController::class, 'statistics']);
        });

        // Download approved certificate (any authenticated user with access)
        Route::get('/{id}/download', [MedicalCertificateController::class, 'download']);
        
        // View uploaded document
        Route::get('/{id}/document', [MedicalCertificateController::class, 'viewDocument']);
    });
});
