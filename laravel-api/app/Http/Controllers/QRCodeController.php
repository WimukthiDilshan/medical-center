<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use App\Models\User;
use App\Models\Appointment;

class QRCodeController extends Controller
{
    /**
     * Generate QR code for current user
     */
    public function generate(Request $request)
    {
        try {
            $user = Auth::user();

            // Only students and staff can generate QR codes
            if (!in_array($user->role, ['student', 'staff'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only students and staff can generate QR codes'
                ], 403);
            }

            // Generate unique token
            $token = Str::random(64);

            // Store user data with token in cache (expires in 30 minutes)
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'student_staff_id' => $user->student_staff_id,
                'generated_at' => now()->toDateTimeString()
            ];

            Cache::put('qr_token_' . $token, $userData, now()->addMinutes(30));

            // Generate QR code
            $qrCode = new QrCode($token);
            $writer = new PngWriter();
            $result = $writer->write($qrCode);

            // Convert to base64
            $qrCodeBase64 = base64_encode($result->getString());

            return response()->json([
                'success' => true,
                'message' => 'QR code generated successfully',
                'qr_code' => 'data:image/png;base64,' . $qrCodeBase64,
                'token' => $token,
                'expires_in' => 30, // minutes
                'user_data' => [
                    'name' => $user->name,
                    'id' => $user->student_staff_id,
                    'role' => ucfirst($user->role),
                    'email' => $user->email
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate QR code: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download QR code as PNG file
     */
    public function download(Request $request)
    {
        try {
            $user = Auth::user();

            if (!in_array($user->role, ['student', 'staff'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Generate token and QR code
            $token = Str::random(64);

            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'student_staff_id' => $user->student_staff_id,
                'generated_at' => now()->toDateTimeString()
            ];

            Cache::put('qr_token_' . $token, $userData, now()->addMinutes(30));

            $qrCode = new QrCode($token);
            $writer = new PngWriter();
            $result = $writer->write($qrCode);

            return response($result->getString())
                ->header('Content-Type', 'image/png')
                ->header('Content-Disposition', 'attachment; filename="medical-qr-code.png"');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to download QR code'
            ], 500);
        }
    }

    /**
     * Verify QR code token and return user data
     */
    public function verify(Request $request)
    {
        try {
            $request->validate([
                'token' => 'required|string'
            ]);

            $token = $request->token;

            // Check if token exists in cache
            $userData = Cache::get('qr_token_' . $token);

            if (!$userData) {
                return response()->json([
                    'success' => false,
                    'message' => 'QR code has expired or is invalid'
                ], 400);
            }

            // Get fresh user data from database
            $user = User::find($userData['id']);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'QR code verified successfully',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'student_staff_id' => $user->student_staff_id
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to verify QR code: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create appointment from QR code data
     */
    public function createAppointment(Request $request)
    {
        try {
            $nurse = Auth::user();

            // Only nurses can create appointments via QR
            if ($nurse->role !== 'nurse') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only nurses can create appointments'
                ], 403);
            }

            $request->validate([
                'token' => 'required|string',
                'appointment_date' => 'required|date',
                'appointment_time' => 'required',
                'reason' => 'nullable|string',
                'priority' => 'required|in:normal,urgent'
            ]);

            // Verify token
            $userData = Cache::get('qr_token_' . $request->token);

            if (!$userData) {
                return response()->json([
                    'success' => false,
                    'message' => 'QR code has expired or is invalid'
                ], 400);
            }

            // Create appointment
            $appointment = Appointment::create([
                'user_id' => $userData['id'],
                'appointment_date' => $request->appointment_date,
                'appointment_time' => $request->appointment_time,
                'reason' => $request->reason,
                'priority' => $request->priority,
                'status' => 'pending',
                'created_by' => $nurse->id
            ]);

            // Optionally remove token after use (or let it expire)
            // Cache::forget('qr_token_' . $request->token);

            return response()->json([
                'success' => true,
                'message' => 'Appointment created successfully',
                'appointment' => $appointment->load('user')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create appointment: ' . $e->getMessage()
            ], 500);
        }
    }
}
