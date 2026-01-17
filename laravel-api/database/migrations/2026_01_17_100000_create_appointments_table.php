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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->integer('appointment_number')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // staff/student
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->text('reason')->nullable();
            $table->enum('status', ['pending', 'checked_in', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->enum('priority', ['normal', 'urgent'])->default('normal');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade'); // nurse who created
            $table->text('medical_notes')->nullable(); // doctor's notes
            $table->timestamp('checked_in_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
