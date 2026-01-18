<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicalCertificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'doctor_id',
        'appointment_id',
        'reason',
        'start_date',
        'end_date',
        'days_requested',
        'status',
        'doctor_notes',
        'rejection_reason',
        'document_path',
        'approved_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'approved_at' => 'datetime',
    ];

    /**
     * Get the user who requested the certificate
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the doctor who approved/rejected the certificate
     */
    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /**
     * Get the related appointment if attached
     */
    public function appointment()
    {
        return $this->belongsTo(Appointment::class, 'appointment_id');
    }
}
