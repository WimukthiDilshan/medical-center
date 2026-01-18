<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Medical Certificate</title>
    <style>
        @page {
            margin: 40px;
        }
        
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 12px;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #0d9488;
            padding-bottom: 20px;
        }
        
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #0d9488;
            margin-bottom: 5px;
        }
        
        .subtitle {
            font-size: 14px;
            color: #115e59;
            margin: 3px 0;
        }
        
        .title {
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            color: #115e59;
            margin: 30px 0;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        .content {
            margin: 20px 0;
            padding: 0 20px;
        }
        
        .certificate-no {
            text-align: right;
            font-size: 11px;
            color: #666;
            margin-bottom: 20px;
        }
        
        .info-row {
            margin: 15px 0;
            display: flex;
        }
        
        .label {
            font-weight: bold;
            color: #0d9488;
            min-width: 150px;
        }
        
        .value {
            flex: 1;
            color: #333;
        }
        
        .medical-info {
            background: #f0fdfa;
            padding: 15px;
            border-left: 4px solid #14b8a6;
            margin: 25px 0;
            border-radius: 5px;
        }
        
        .medical-info .title-section {
            font-weight: bold;
            color: #115e59;
            margin-bottom: 10px;
            font-size: 13px;
        }
        
        .footer {
            margin-top: 60px;
            padding-top: 30px;
            border-top: 2px solid #d1fae5;
        }
        
        .signature-block {
            margin-top: 50px;
            text-align: right;
        }
        
        .signature-image {
            max-width: 200px;
            max-height: 80px;
            margin-bottom: 5px;
            border: 1px solid #ddd;
            padding: 5px;
            display: inline-block;
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
        
        .doctor-name {
            font-weight: bold;
            color: #115e59;
        }
        
        .doctor-title {
            font-size: 11px;
            color: #666;
        }
        
        .issued-date {
            margin-top: 30px;
            font-size: 11px;
            color: #666;
        }
        
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 100px;
            color: rgba(13, 148, 136, 0.05);
            font-weight: bold;
            z-index: -1;
        }
    </style>
</head>
<body>
    <div class="watermark">MEDICAL CERTIFICATE</div>
    
    <div class="header">
        <div class="logo">MEDICAL CENTER</div>
        <div class="subtitle">Faculty of Engineering</div>
        <div class="subtitle">University of Ruhuna</div>
    </div>
    
    <div class="certificate-no">
        Certificate No: MC-{{ $certificate->id }}-{{ date('Y') }}
    </div>
    
    <div class="title">Medical Certificate</div>
    
    <div class="content">
        <p style="margin: 20px 0;">This is to certify that:</p>
        
        <div class="info-row">
            <span class="label">Name:</span>
            <span class="value">{{ $certificate->user->name }}</span>
        </div>
        
        <div class="info-row">
            <span class="label">ID Number:</span>
            <span class="value">{{ $certificate->user->staff_id }}</span>
        </div>
        
        <div class="info-row">
            <span class="label">Role:</span>
            <span class="value">{{ ucfirst($certificate->user->role) }}</span>
        </div>
        
        <div class="medical-info">
            <div class="title-section">Medical Recommendation:</div>
            <p style="margin: 5px 0;">{{ $certificate->reason }}</p>
        </div>
        
        <p style="margin: 25px 0 15px 0;">
            The above-mentioned individual is advised to take medical leave for:
        </p>
        
        <div class="info-row">
            <span class="label">Period:</span>
            <span class="value">
                {{ \Carbon\Carbon::parse($certificate->start_date)->format('F d, Y') }} 
                to 
                {{ \Carbon\Carbon::parse($certificate->end_date)->format('F d, Y') }}
            </span>
        </div>
        
        <div class="info-row">
            <span class="label">Total Days:</span>
            <span class="value">{{ $certificate->days_requested }} {{ $certificate->days_requested == 1 ? 'day' : 'days' }}</span>
        </div>
        
        @if($certificate->doctor_notes)
        <div class="medical-info" style="margin-top: 25px;">
            <div class="title-section">Doctor's Notes:</div>
            <p style="margin: 5px 0;">{{ $certificate->doctor_notes }}</p>
        </div>
        @endif
    </div>
    
    <div class="footer">
        <div class="signature-block">
            @if($certificate->doctor && $certificate->doctor->signature)
                <img src="{{ $certificate->doctor->signature }}" 
                     alt="Doctor's Signature" 
                     class="signature-image">
                <div class="signature-label">
                    <div class="doctor-name">{{ $certificate->doctor->name }}</div>
                    <div class="doctor-title">Medical Officer</div>
                    <div class="doctor-title">University of Ruhuna Medical Center</div>
                </div>
            @else
                <div class="signature-line"></div>
                <div class="doctor-name">{{ $certificate->doctor->name }}</div>
                <div class="doctor-title">Medical Officer</div>
                <div class="doctor-title">University of Ruhuna Medical Center</div>
                <small style="color: #999; font-size: 9px; font-style: italic; display: block; margin-top: 5px;">
                    (Digital signature pending)
                </small>
            @endif
        </div>
        
        <div class="issued-date">
            Issued on: {{ \Carbon\Carbon::parse($certificate->approved_at)->format('F d, Y') }}
        </div>
    </div>
    
    <div style="text-align: center; margin-top: 40px; font-size: 10px; color: #999;">
        This is an official medical certificate issued by the University of Ruhuna Medical Center.<br>
        For verification, please contact the Medical Center at medical@ruh.ac.lk
    </div>
</body>
</html>
