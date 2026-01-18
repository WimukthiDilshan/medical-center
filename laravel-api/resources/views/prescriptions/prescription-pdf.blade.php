<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Prescription - {{ $prescription->patient->name }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            padding: 20px;
            color: #333;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #0d9488;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #0d9488;
            font-size: 28px;
            margin-bottom: 5px;
        }
        
        .header h2 {
            color: #115e59;
            font-size: 18px;
            font-weight: normal;
            margin-bottom: 3px;
        }
        
        .header p {
            color: #666;
            font-size: 12px;
        }
        
        .rx-symbol {
            font-size: 48px;
            color: #0d9488;
            font-weight: bold;
            margin: 20px 0;
        }
        
        .info-section {
            background: #f0fdfa;
            border-left: 4px solid #0d9488;
            padding: 15px;
            margin-bottom: 25px;
            border-radius: 5px;
        }
        
        .info-row {
            display: flex;
            margin-bottom: 8px;
        }
        
        .info-label {
            font-weight: bold;
            color: #0d9488;
            width: 150px;
        }
        
        .info-value {
            color: #333;
            flex: 1;
        }
        
        .prescription-body {
            background: white;
            border: 2px solid #0d9488;
            border-radius: 10px;
            padding: 25px;
            margin: 30px 0;
            min-height: 200px;
        }
        
        .prescription-header {
            border-bottom: 2px dashed #0d9488;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        
        .prescription-header h3 {
            color: #0d9488;
            font-size: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .medications {
            line-height: 1.8;
            font-size: 16px;
            white-space: pre-line;
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        
        .medication-item {
            margin-bottom: 15px;
            padding-left: 20px;
            position: relative;
        }
        
        .medication-item:before {
            content: "- ";
            color: #0d9488;
            position: absolute;
            left: 0;
            font-size: 16px;
            font-weight: bold;
        }
        
        .signature-section {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }
        
        .signature-box {
            float: right;
            text-align: center;
            width: 300px;
        }
        
        .signature-image {
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 10px;
            min-height: 80px;
            display: flex;
            align-items: flex-end;
            justify-content: center;
        }
        
        .signature-image img {
            max-width: 200px;
            max-height: 70px;
        }
        
        .doctor-name {
            font-weight: bold;
            color: #0d9488;
            font-size: 16px;
            margin-bottom: 5px;
        }
        
        .doctor-designation {
            color: #666;
            font-size: 12px;
        }
        
        .footer {
            margin-top: 80px;
            text-align: center;
            padding-top: 20px;
            border-top: 2px solid #0d9488;
            color: #666;
            font-size: 11px;
        }
        
        .important-note {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin-top: 20px;
            border-radius: 5px;
        }
        
        .important-note h4 {
            color: #f59e0b;
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .important-note p {
            font-size: 12px;
            color: #666;
            line-height: 1.6;
        }
        
        .date-badge {
            background: #0d9488;
            color: white;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 12px;
            display: inline-block;
            margin-bottom: 15px;
        }
        
        .clearfix::after {
            content: "";
            display: table;
            clear: both;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <h1>+ MEDICAL CENTER +</h1>
        <h2>University of Ruhuna - Faculty of Engineering</h2>
        <p>Address: Hapugala, Galle, Sri Lanka | Tel: 091-2245765 | Email: medicalcenter@eng.ruh.ac.lk</p>
    </div>

    <!-- Prescription Symbol -->
    <div style="text-align: center;">
        <div class="rx-symbol">Rx</div>
        <div class="date-badge">
            Prescribed on: {{ date('F d, Y', strtotime($prescription->created_at)) }}
        </div>
    </div>

    <!-- Patient Information -->
    <div class="info-section">
        <h3 style="color: #0d9488; margin-bottom: 15px; font-size: 18px;">PATIENT INFORMATION</h3>
        <div class="info-row">
            <span class="info-label">Name:</span>
            <span class="info-value">{{ $prescription->patient->name }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">ID Number:</span>
            <span class="info-value">{{ $prescription->patient->staff_id }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">{{ $prescription->patient->email }}</span>
        </div>
        @if($prescription->patient->phone)
        <div class="info-row">
            <span class="info-label">Phone:</span>
            <span class="info-value">{{ $prescription->patient->phone }}</span>
        </div>
        @endif
        <div class="info-row">
            <span class="info-label">Prescription ID:</span>
            <span class="info-value">#{{ str_pad($prescription->id, 6, '0', STR_PAD_LEFT) }}</span>
        </div>
    </div>

    <!-- Prescription Body -->
    <div class="prescription-body">
        <div class="prescription-header">
            <h3>MEDICATIONS PRESCRIBED</h3>
        </div>
        
        <div class="medications">
            @php
                $medications = explode("\n", $prescription->medications);
            @endphp
            @foreach($medications as $medication)
                @if(trim($medication))
                <div class="medication-item">{{ trim($medication) }}</div>
                @endif
            @endforeach
        </div>
    </div>

    <!-- Important Notes -->
    <div class="important-note">
        <h4>! IMPORTANT INSTRUCTIONS</h4>
        <p>
            • Take medications exactly as prescribed by the doctor<br>
            • Do not share your medications with others<br>
            • If you experience any side effects, contact the medical center immediately<br>
            • Keep medications in a cool, dry place away from children<br>
            • Complete the full course of medication unless advised otherwise
        </p>
    </div>

    <!-- Signature Section -->
    <div class="signature-section clearfix">
        <div class="signature-box">
            <div class="signature-image">
                @if($prescription->doctor->signature)
                    <img src="{{ $prescription->doctor->signature }}" alt="Doctor Signature">
                @else
                    <div style="font-style: italic; color: #999;">Digital Signature</div>
                @endif
            </div>
            <div class="doctor-name">Dr. {{ $prescription->doctor->name }}</div>
            <div class="doctor-designation">Medical Officer</div>
            <div class="doctor-designation">Faculty of Engineering Medical Center</div>
            <div class="doctor-designation" style="margin-top: 10px; color: #0d9488;">
                Email: {{ $prescription->doctor->email }}
            </div>
        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        <p><strong>This is a computer-generated prescription and is valid with the doctor's digital signature.</strong></p>
        <p>For verification, please contact: Medical Center, Faculty of Engineering, University of Ruhuna</p>
        <p style="margin-top: 10px;">Generated on: {{ date('F d, Y h:i A') }}</p>
        <p style="margin-top: 5px; color: #0d9488; font-weight: bold;">
            (c) {{ date('Y') }} University of Ruhuna - Medical Center Management System
        </p>
    </div>
</body>
</html>
