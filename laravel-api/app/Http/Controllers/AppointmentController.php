<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AppointmentController extends Controller
{
    /**
     * Get all appointments (for nurse and doctor)
     */
    public function index(Request $request)
    {
        $query = Appointment::with(['user', 'createdBy']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date
        if ($request->has('date')) {
            $query->whereDate('appointment_date', $request->date);
        }

        // Filter by user (for patient view)
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // For doctor: today's appointments by default
        if ($request->has('today') && $request->today) {
            $query->whereDate('appointment_date', now()->toDateString());
        }

        $appointments = $query->orderBy('appointment_number', 'desc')->get();

        return response()->json($appointments);
    }

    /**
     * Search users by ID number for appointment creation
     */
    public function searchUser(Request $request)
    {
        $request->validate([
            'id_number' => 'required|string',
        ]);

        $user = User::where('staff_id', $request->id_number)
            ->whereIn('role', ['staff', 'student'])
            ->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user);
    }

    /**
     * Create a new appointment
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'appointment_date' => 'required|date',
            'appointment_time' => 'required|date_format:H:i',
            'reason' => 'nullable|string',
            'priority' => 'required|in:normal,urgent',
        ]);

        $appointment = Appointment::create([
            'user_id' => $request->user_id,
            'appointment_date' => $request->appointment_date,
            'appointment_time' => $request->appointment_time,
            'reason' => $request->reason,
            'priority' => $request->priority,
            'created_by' => $request->user()->id, // nurse who created
            'status' => 'pending',
        ]);

        $appointment->load(['user', 'createdBy']);

        return response()->json([
            'message' => 'Appointment created successfully',
            'appointment' => $appointment,
        ], 201);
    }

    /**
     * Get single appointment details
     */
    public function show($id)
    {
        $appointment = Appointment::with(['user', 'createdBy'])->findOrFail($id);
        return response()->json($appointment);
    }

    /**
     * Update appointment
     */
    public function update(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);

        $request->validate([
            'appointment_date' => 'sometimes|date',
            'appointment_time' => 'sometimes|date_format:H:i',
            'reason' => 'nullable|string',
            'priority' => 'sometimes|in:normal,urgent',
            'status' => 'sometimes|in:pending,checked_in,in_progress,completed,cancelled',
            'medical_notes' => 'nullable|string',
        ]);

        $appointment->update($request->all());
        $appointment->load(['user', 'createdBy']);

        return response()->json([
            'message' => 'Appointment updated successfully',
            'appointment' => $appointment,
        ]);
    }

    /**
     * Check-in a patient
     */
    public function checkIn($id)
    {
        $appointment = Appointment::findOrFail($id);
        
        $appointment->update([
            'status' => 'checked_in',
            'checked_in_at' => now(),
        ]);

        $appointment->load(['user', 'createdBy']);

        return response()->json([
            'message' => 'Patient checked in successfully',
            'appointment' => $appointment,
        ]);
    }

    /**
     * Mark appointment as in progress (doctor starts consultation)
     */
    public function startConsultation($id)
    {
        $appointment = Appointment::findOrFail($id);
        
        $appointment->update([
            'status' => 'in_progress',
        ]);

        $appointment->load(['user', 'createdBy']);

        return response()->json([
            'message' => 'Consultation started',
            'appointment' => $appointment,
        ]);
    }

    /**
     * Complete appointment with medical notes
     */
    public function complete(Request $request, $id)
    {
        $request->validate([
            'medical_notes' => 'required|string',
            'diagnosis' => 'nullable|string',
            'medications' => 'nullable|string',
            'instructions' => 'nullable|string',
            'lab_reports' => 'nullable|string',
        ]);

        $appointment = Appointment::findOrFail($id);
        
        $appointment->update([
            'status' => 'completed',
            'medical_notes' => $request->medical_notes,
            'lab_reports' => $request->lab_reports,
            'completed_at' => now(),
        ]);

        // Create prescription if medications provided
        if ($request->has('medications') && !empty($request->medications)) {
            \App\Models\Prescription::create([
                'appointment_id' => $appointment->id,
                'patient_id' => $appointment->user_id,
                'doctor_id' => $request->user()->id,
                'diagnosis' => $request->diagnosis ?? $request->medical_notes,
                'medications' => $request->medications,
                'instructions' => $request->instructions,
                'status' => 'pending',
            ]);
        }

        $appointment->load(['user', 'createdBy']);

        return response()->json([
            'message' => 'Appointment completed successfully',
            'appointment' => $appointment,
        ]);
    }

    /**
     * Cancel appointment
     */
    public function cancel($id)
    {
        $appointment = Appointment::findOrFail($id);
        
        $appointment->update([
            'status' => 'cancelled',
        ]);

        $appointment->load(['user', 'createdBy']);

        return response()->json([
            'message' => 'Appointment cancelled',
            'appointment' => $appointment,
        ]);
    }

    /**
     * Get appointment history for a user
     */
    public function history($userId)
    {
        $appointments = Appointment::with(['createdBy'])
            ->where('user_id', $userId)
            ->orderBy('appointment_date', 'desc')
            ->orderBy('appointment_time', 'desc')
            ->get();

        return response()->json($appointments);
    }

    /**
     * Get queue/today's pending appointments
     */
    public function queue()
    {
        $appointments = Appointment::with(['user', 'createdBy'])
            ->whereDate('appointment_date', now()->toDateString())
            ->whereIn('status', ['pending', 'checked_in', 'in_progress'])
            ->orderBy('priority', 'desc') // urgent first
            ->orderBy('appointment_number', 'asc')
            ->get();

        return response()->json($appointments);
    }

    /**
     * Get daily report
     */
    public function report(Request $request)
    {
        $date = $request->get('date', now()->toDateString());

        $stats = [
            'total' => Appointment::whereDate('appointment_date', $date)->count(),
            'pending' => Appointment::whereDate('appointment_date', $date)->where('status', 'pending')->count(),
            'checked_in' => Appointment::whereDate('appointment_date', $date)->where('status', 'checked_in')->count(),
            'in_progress' => Appointment::whereDate('appointment_date', $date)->where('status', 'in_progress')->count(),
            'completed' => Appointment::whereDate('appointment_date', $date)->where('status', 'completed')->count(),
            'cancelled' => Appointment::whereDate('appointment_date', $date)->where('status', 'cancelled')->count(),
            'urgent' => Appointment::whereDate('appointment_date', $date)->where('priority', 'urgent')->count(),
        ];

        $appointments = Appointment::with(['user', 'createdBy'])
            ->whereDate('appointment_date', $date)
            ->orderBy('appointment_number', 'asc')
            ->get();

        return response()->json([
            'date' => $date,
            'stats' => $stats,
            'appointments' => $appointments,
        ]);
    }

    /**
     * Delete appointment
     */
    public function destroy($id)
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->delete();

        return response()->json([
            'message' => 'Appointment deleted successfully',
        ]);
    }
}
