<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class LabReportController extends Controller
{
    /**
     * Get patient's lab reports
     */
    public function patientReports(Request $request)
    {
        $user = $request->user();
        
        $appointments = Appointment::with(['user', 'createdBy'])
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->whereNotNull('lab_reports')
            ->orderBy('completed_at', 'desc')
            ->get();

        return response()->json($appointments);
    }

    /**
     * Generate and download PDF lab report
     */
    public function downloadReport($appointmentId)
    {
        try {
            $appointment = Appointment::with(['user', 'completedBy' => function($query) {
                $query->select('id', 'name', 'email', 'signature');
            }])->findOrFail($appointmentId);

            if (!$appointment->lab_reports) {
                return response()->json(['message' => 'No lab reports for this appointment'], 404);
            }

            // Prepare PDF data
            $data = [
                'appointment' => $appointment,
            ];

            // Generate PDF with options to allow inline images
            $pdf = Pdf::loadView('lab-report', $data)
                ->setPaper('a4')
                ->setOption('isRemoteEnabled', true)
                ->setOption('isHtml5ParserEnabled', true);
            
            $filename = 'Lab_Report_' . $appointment->user->staff_id . '_' . $appointment->appointment_number . '.pdf';
            
            return response($pdf->output(), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to generate PDF',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
