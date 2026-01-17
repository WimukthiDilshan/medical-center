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
        Schema::dropIfExists('lab_report_verifications');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('lab_report_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained()->onDelete('cascade');
            $table->foreignId('patient_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('doctor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('verification_code', 12)->unique();
            $table->text('report_hash');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });
    }
};
