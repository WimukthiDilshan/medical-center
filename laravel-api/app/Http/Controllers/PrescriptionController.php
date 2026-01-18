<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class PrescriptionController extends Controller
{
    /**
     * Get all prescriptions (for pharmacist and nurse)
     */
    public function index(Request $request)
    {
        $query = Prescription::with(['patient', 'doctor', 'appointment', 'pharmacist']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date
        if ($request->has('date')) {
            $query->whereDate('created_at', $request->date);
        }

        $prescriptions = $query->orderBy('created_at', 'desc')->get();

        return response()->json($prescriptions);
    }

    /**
     * Get single prescription
     */
    public function show($id)
    {
        $prescription = Prescription::with(['patient', 'doctor', 'appointment', 'pharmacist'])->findOrFail($id);
        return response()->json($prescription);
    }

    /**
     * Create prescription (doctor only - through appointment completion)
     */
    public function store(Request $request)
    {
        $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
            'patient_id' => 'required|exists:users,id',
            'diagnosis' => 'required|string',
            'medications' => 'required|string',
            'instructions' => 'nullable|string',
        ]);

        $prescription = Prescription::create([
            'appointment_id' => $request->appointment_id,
            'patient_id' => $request->patient_id,
            'doctor_id' => $request->user()->id,
            'diagnosis' => $request->diagnosis,
            'medications' => $request->medications,
            'instructions' => $request->instructions,
            'status' => 'pending',
        ]);

        $prescription->load(['patient', 'doctor', 'appointment']);

        return response()->json([
            'message' => 'Prescription created successfully',
            'prescription' => $prescription,
        ], 201);
    }

    /**
     * Pharmacist dispenses medicine
     */
    public function dispense($id)
    {
        $prescription = Prescription::findOrFail($id);

        if ($prescription->status !== 'pending') {
            return response()->json(['message' => 'Prescription already dispensed'], 400);
        }

        $prescription->update([
            'status' => 'dispensed',
            'dispensed_by' => request()->user()->id,
            'dispensed_at' => now(),
        ]);

        $prescription->load(['patient', 'doctor', 'appointment', 'pharmacist']);

        return response()->json([
            'message' => 'Medicine dispensed successfully',
            'prescription' => $prescription,
        ]);
    }

    /**
     * Pharmacist completes prescription
     */
    public function complete($id)
    {
        $prescription = Prescription::findOrFail($id);

        $prescription->update([
            'status' => 'completed',
            'dispensed_by' => request()->user()->id,
            'dispensed_at' => $prescription->dispensed_at ?? now(),
        ]);

        $prescription->load(['patient', 'doctor', 'appointment', 'pharmacist']);

        return response()->json([
            'message' => 'Prescription completed successfully',
            'prescription' => $prescription,
        ]);
    }

    /**
     * Get prescriptions for a specific patient
     */
    public function patientPrescriptions($patientId)
    {
        // Find user by staff_id
        $user = \App\Models\User::where('staff_id', $patientId)->first();
        
        if (!$user) {
            return response()->json(['message' => 'Patient not found'], 404);
        }

        $prescriptions = Prescription::with(['patient', 'doctor', 'appointment', 'pharmacist'])
            ->where('patient_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($prescriptions);
    }

    /**
     * Get today's pending prescriptions (for pharmacist)
     */
    public function pending()
    {
        $prescriptions = Prescription::with(['patient', 'doctor', 'appointment'])
            ->whereDate('created_at', now()->toDateString())
            ->where('status', 'pending')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($prescriptions);
    }

    /**
     * Get my prescriptions (for authenticated patient)
     */
    public function myPrescriptions(Request $request)
    {
        $user = $request->user();
        
        $prescriptions = Prescription::with(['doctor', 'appointment', 'pharmacist'])
            ->where('patient_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($prescriptions);
    }

    /**
     * Download prescription as PDF
     */
    public function download($id)
    {
        $prescription = Prescription::with(['patient', 'doctor', 'appointment'])->findOrFail($id);
        
        // Generate PDF
        $pdf = PDF::loadView('prescriptions.prescription-pdf', [
            'prescription' => $prescription
        ]);

        // Return PDF download
        return $pdf->download('Prescription_' . $prescription->id . '.pdf');
    }
}
