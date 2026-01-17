<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Lab Report - Ruhunu Campus</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            padding: 30px;
            color: #333;
            background: white;
        }
        
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            color: rgba(0, 123, 255, 0.08);
            font-weight: bold;
            z-index: -1;
            white-space: nowrap;
        }
        
        .header {
            text-align: center;
            border-bottom: 4px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .campus-logo {
            font-size: 36px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 5px;
        }
        
        .campus-name {
            font-size: 28px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        
        .department {
            font-size: 16px;
            color: #666;
            margin-bottom: 5px;
        }
        
        .report-title {
            font-size: 20px;
            font-weight: bold;
            color: #007bff;
            margin-top: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .info-section {
            margin-bottom: 25px;
        }
        
        .info-row {
            display: flex;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        
        .info-label {
            width: 180px;
            font-weight: bold;
            color: #555;
        }
        
        .info-value {
            flex: 1;
            color: #333;
        }
        
        .lab-reports-section {
            background: #f8f9fa;
            border-left: 4px solid #007bff;
            padding: 20px;
            margin: 25px 0;
        }
        
        .lab-reports-title {
            font-size: 18px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 15px;
        }
        
        .lab-reports-content {
            line-height: 1.8;
            white-space: pre-wrap;
            color: #333;
            font-size: 14px;
        }
        
        .signature-section {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
        }
        
        .signature-box {
            margin-top: 20px;
            text-align: right;
        }
        
        .signature-image {
            max-width: 200px;
            max-height: 80px;
            margin-bottom: 5px;
            border: 1px solid #ddd;
            padding: 5px;
            display: block;
            margin-left: auto;
        }
        
        .signature-line {
            border-top: 2px solid #333;
            width: 250px;
            display: inline-block;
            margin-top: 40px;
        }
        
        .signature-label {
            margin-top: 5px;
            font-size: 12px;
            color: #666;
        }
        
        .approval-section {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #28a745;
        }
        
        .approval-badge {
            display: inline-block;
            background: #28a745;
            color: white;
            padding: 8px 15px;
            border-radius: 20px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            text-align: center;
            font-size: 11px;
            color: #666;
        }
        
        .security-notice {
            background: #e7f3ff;
            border-left: 4px solid #007bff;
            padding: 15px;
            margin-top: 20px;
            font-size: 11px;
            color: #004085;
        }
        
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <div class="watermark">OFFICIAL RUHUNU CAMPUS</div>
    
    <!-- Header -->
    <div class="header">
        <div class="campus-logo">🏛️</div>
        <div class="campus-name">RUHUNU CAMPUS</div>
        <div class="department">Medical Center - Health Services</div>
        <div class="report-title">Laboratory Test Report</div>
    </div>
    
    <!-- Patient Information -->
    <div class="info-section">
        <div class="info-row">
            <div class="info-label">Patient Name:</div>
            <div class="info-value">{{ $appointment->user->name }}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Student/Staff ID:</div>
            <div class="info-value">{{ $appointment->user->staff_id }}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Report Date:</div>
            <div class="info-value">{{ $appointment->completed_at->format('d M Y, h:i A') }}</div>
        </div>
    </div>
    
    <!-- Lab Reports Content -->
    <div class="lab-reports-section">
        <div class="lab-reports-title">📋 Required Laboratory Tests</div>
        <div class="lab-reports-content">{{ $appointment->lab_reports }}</div>
    </div>
    
    <!-- Doctor Signature -->
    <div class="signature-section">
        <div class="signature-box">
            @if($appointment->completedBy && $appointment->completedBy->signature)
                <div style="text-align: right;">
                    <img src="{{ $appointment->completedBy->signature }}" alt="Doctor Signature" style="max-width: 200px; max-height: 80px; margin-bottom: 5px; border: 1px solid #ddd; padding: 5px; display: inline-block;">
                    <div class="signature-label">
                        <strong>Doctor's Signature</strong><br>
                        {{ $appointment->completedBy->name ?? 'Medical Officer' }}<br>
                        {{ $appointment->completed_at->format('d M Y') }}
                    </div>
                </div>
            @else
                <div style="text-align: right;">
                    <div class="signature-line"></div>
                    <div class="signature-label">
                        <strong>Doctor's Signature</strong><br>
                        {{ $appointment->completedBy->name ?? 'Medical Officer' }}<br>
                        {{ $appointment->completed_at->format('d M Y') }}
                    </div>
                    <small style="color: #999; font-size: 9px; font-style: italic; display: block; margin-top: 5px;">
                        (Digital signature pending)
                    </small>
                </div>
            @endif
        </div>
    </div>
    
    <!-- Security Notice -->
    <div class="security-notice">
        <strong>⚠️ SECURITY NOTICE:</strong> This is an official document from Ruhunu Campus Medical Center. 
        This report is authenticated with the doctor's digital signature. Any tampering or modification of this document 
        is prohibited and may result in legal action.
    </div>
    
    <!-- Footer -->
    <div class="footer">
        <div><strong>Ruhunu Campus - Medical Center</strong></div>
        <div>Official Lab Report | Generated on {{ now()->format('d M Y, h:i A') }}</div>
        <div style="margin-top: 5px; font-size: 9px;">
            This document is electronically generated and authenticated
        </div>
    </div>
</body>
</html>
