<?php

namespace App\Http\Controllers;

use App\Models\MedicalCertificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class MedicalCertificateController extends Controller
{
    /**
     * Get all medical certificates (filtered by role)
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        if ($user->role === 'doctor') {
            // Doctors see all pending and their approved/rejected certificates
            $certificates = MedicalCertificate::with(['user', 'doctor', 'appointment'])
                ->where(function($query) use ($user) {
                    $query->where('status', 'pending')
                          ->orWhere('doctor_id', $user->id);
                })
                ->orderBy('created_at', 'desc')
                ->get();
        } elseif ($user->role === 'admin') {
            // Admins see all certificates with optional filters
            $query = MedicalCertificate::with(['user', 'doctor', 'appointment']);

            // Filter by status
            if ($request->has('status') && $request->status !== 'all' && $request->status !== '') {
                $query->where('status', $request->status);
            }

            // Filter by user type (role)
            if ($request->has('user_type') && $request->user_type !== 'all' && $request->user_type !== '') {
                $query->whereHas('user', function($q) use ($request) {
                    $q->where('role', $request->user_type);
                });
            }

            // Filter by date range
            if ($request->has('start_date') && $request->start_date) {
                $query->whereDate('created_at', '>=', $request->start_date);
            }
            if ($request->has('end_date') && $request->end_date) {
                $query->whereDate('created_at', '<=', $request->end_date);
            }

            // Search by name, ID, or certificate number
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('id', 'like', "%{$search}%")
                      ->orWhereHas('user', function($userQuery) use ($search) {
                          $userQuery->where('name', 'like', "%{$search}%")
                                   ->orWhere('staff_id', 'like', "%{$search}%");
                      });
                });
            }

            $certificates = $query->orderBy('created_at', 'desc')->get();
        } else {
            // Students/Staff see only their own certificates
            $certificates = MedicalCertificate::with(['doctor', 'appointment'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json($certificates);
    }

    /**
     * Store a new medical certificate request
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'appointment_id' => 'nullable|exists:appointments,id',
            'document' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120', // 5MB max
        ]);

        $startDate = Carbon::parse($validated['start_date']);
        $endDate = Carbon::parse($validated['end_date']);
        $daysRequested = $startDate->diffInDays($endDate) + 1;

        $documentPath = null;
        if ($request->hasFile('document')) {
            $file = $request->file('document');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $documentPath = $file->storeAs('medical_certificates', $filename, 'public');
        }

        $certificate = MedicalCertificate::create([
            'user_id' => Auth::id(),
            'appointment_id' => $validated['appointment_id'] ?? null,
            'reason' => $validated['reason'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'days_requested' => $daysRequested,
            'document_path' => $documentPath,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Medical certificate request submitted successfully',
            'certificate' => $certificate->load(['user', 'doctor', 'appointment'])
        ], 201);
    }

    /**
     * Show a specific medical certificate
     */
    public function show($id)
    {
        $user = Auth::user();
        $certificate = MedicalCertificate::with(['user', 'doctor', 'appointment'])->findOrFail($id);

        // Authorization check
        if ($user->role !== 'admin' && $user->role !== 'doctor' && $certificate->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($certificate);
    }

    /**
     * Approve a medical certificate request
     */
    public function approve(Request $request, $id)
    {
        $user = Auth::user();

        if ($user->role !== 'doctor') {
            return response()->json(['message' => 'Only doctors can approve certificates'], 403);
        }

        $validated = $request->validate([
            'doctor_notes' => 'nullable|string|max:1000',
        ]);

        $certificate = MedicalCertificate::findOrFail($id);

        if ($certificate->status !== 'pending') {
            return response()->json(['message' => 'Certificate has already been processed'], 400);
        }

        $certificate->update([
            'status' => 'approved',
            'doctor_id' => $user->id,
            'doctor_notes' => $validated['doctor_notes'] ?? null,
            'approved_at' => now(),
        ]);

        return response()->json([
            'message' => 'Medical certificate approved successfully',
            'certificate' => $certificate->load(['user', 'doctor', 'appointment'])
        ]);
    }

    /**
     * Reject a medical certificate request
     */
    public function reject(Request $request, $id)
    {
        $user = Auth::user();

        if ($user->role !== 'doctor') {
            return response()->json(['message' => 'Only doctors can reject certificates'], 403);
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $certificate = MedicalCertificate::findOrFail($id);

        if ($certificate->status !== 'pending') {
            return response()->json(['message' => 'Certificate has already been processed'], 400);
        }

        $certificate->update([
            'status' => 'rejected',
            'doctor_id' => $user->id,
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        return response()->json([
            'message' => 'Medical certificate rejected',
            'certificate' => $certificate->load(['user', 'doctor', 'appointment'])
        ]);
    }

    /**
     * Download medical certificate as PDF
     */
    public function download($id)
    {
        $user = Auth::user();
        $certificate = MedicalCertificate::with(['user', 'doctor'])->findOrFail($id);

        // Authorization check
        if ($user->role !== 'admin' && $user->role !== 'doctor' && $certificate->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Only approved certificates can be downloaded
        if ($certificate->status !== 'approved') {
            return response()->json(['message' => 'Only approved certificates can be downloaded'], 400);
        }

        $pdf = PDF::loadView('certificates.medical', ['certificate' => $certificate]);

        return $pdf->download('medical_certificate_' . $certificate->id . '.pdf');
    }

    /**
     * View uploaded document
     */
    public function viewDocument($id)
    {
        $user = Auth::user();
        $certificate = MedicalCertificate::findOrFail($id);

        // Authorization check
        if ($user->role !== 'admin' && $user->role !== 'doctor' && $certificate->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$certificate->document_path) {
            return response()->json(['message' => 'No document attached'], 404);
        }

        $path = storage_path('app/public/' . $certificate->document_path);
        
        if (!file_exists($path)) {
            return response()->json(['message' => 'Document not found'], 404);
        }

        // Get MIME type
        $mimeType = mime_content_type($path);
        
        return response()->file($path, [
            'Content-Type' => $mimeType
        ]);
    }

    /**
     * Get statistics for admin dashboard
     */
    public function statistics()
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $stats = [
            'total' => MedicalCertificate::count(),
            'pending' => MedicalCertificate::where('status', 'pending')->count(),
            'approved' => MedicalCertificate::where('status', 'approved')->count(),
            'rejected' => MedicalCertificate::where('status', 'rejected')->count(),
        ];

        return response()->json($stats);
    }
}
