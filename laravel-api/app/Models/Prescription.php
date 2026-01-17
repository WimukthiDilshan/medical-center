<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_id',
        'patient_id',
        'doctor_id',
        'diagnosis',
        'medications',
        'instructions',
        'status',
        'dispensed_by',
        'dispensed_at',
    ];

    protected $casts = [
        'dispensed_at' => 'datetime',
    ];

    /**
     * Get the appointment
     */
    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    /**
     * Get the patient
     */
    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    /**
     * Get the doctor
     */
    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /**
     * Get the pharmacist who dispensed
     */
    public function pharmacist()
    {
        return $this->belongsTo(User::class, 'dispensed_by');
    }
}
