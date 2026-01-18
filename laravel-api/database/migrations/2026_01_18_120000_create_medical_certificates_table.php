<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('medical_certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('doctor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('reason');
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('days_requested');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('doctor_notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_certificates');
    }
};
