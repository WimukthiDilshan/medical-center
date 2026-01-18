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
        Schema::table('medical_certificates', function (Blueprint $table) {
            $table->foreignId('appointment_id')->nullable()->after('user_id')->constrained('appointments')->onDelete('set null');
            $table->string('document_path')->nullable()->after('rejection_reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('medical_certificates', function (Blueprint $table) {
            $table->dropForeign(['appointment_id']);
            $table->dropColumn(['appointment_id', 'document_path']);
        });
    }
};
