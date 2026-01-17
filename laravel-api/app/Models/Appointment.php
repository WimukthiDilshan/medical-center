<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_number',
        'user_id',
        'appointment_date',
        'appointment_time',
        'reason',
        'status',
        'priority',
        'created_by',
        'medical_notes',
        'checked_in_at',
        'completed_at',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'appointment_time' => 'datetime:H:i',
        'checked_in_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the patient (user) for this appointment
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the nurse who created this appointment
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Boot function to auto-increment appointment number
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($appointment) {
            if (!$appointment->appointment_number) {
                $lastAppointment = static::max('appointment_number');
                $appointment->appointment_number = $lastAppointment ? $lastAppointment + 1 : 1;
            }
        });
    }
}
