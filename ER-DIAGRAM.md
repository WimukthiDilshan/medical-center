# Medical Center System - Entity Relationship Diagram

## Database Schema Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          MEDICAL CENTER DATABASE SCHEMA                          │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│                                    USERS TABLE                                    │
├──────────────────────────────────────────────────────────────────────────────────┤
│ PK │ id                    : BIGINT (Auto Increment)                             │
│    │ name                  : VARCHAR(255)                                        │
│    │ email                 : VARCHAR(255) [UNIQUE]                               │
│    │ role                  : ENUM('admin', 'doctor', 'nurse', 'pharmacist',     │
│    │                              'student', 'staff')                            │
│    │ signature             : TEXT [Nullable] - Digital signature for doctors     │
│    │ staff_id              : VARCHAR(255) [Nullable]                             │
│    │ is_approved           : BOOLEAN [Default: false]                            │
│    │ phone                 : VARCHAR(255) [Nullable]                             │
│    │ email_verified_at     : TIMESTAMP [Nullable]                                │
│    │ password              : VARCHAR(255)                                        │
│    │ otp_code              : VARCHAR(6) [Nullable] - For 2FA                     │
│    │ otp_expires_at        : TIMESTAMP [Nullable] - OTP expiration               │
│    │ remember_token        : VARCHAR(100) [Nullable]                             │
│    │ created_at            : TIMESTAMP                                           │
│    │ updated_at            : TIMESTAMP                                           │
└──────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌────────────────────────┐  ┌──────────────────────┐  ┌──────────────────────────┐
│   APPOINTMENTS TABLE   │  │  PRESCRIPTIONS TABLE │  │ MEDICAL_CERTIFICATES TABLE│
├────────────────────────┤  ├──────────────────────┤  ├──────────────────────────┤
│ PK │ id                │  │ PK │ id              │  │ PK │ id                  │
│ FK │ user_id ──────────┼──┤    │                 │  │ FK │ user_id ────────────┼──┐
│    │   (patient)       │  │ FK │ appointment_id ─┼─▶│    │   (requester)       │  │
│ FK │ created_by ───────┼──┤    │                 │  │ FK │ appointment_id ─────┼──┤
│    │   (nurse)         │  │ FK │ patient_id ─────┼──┤    │   [Nullable]        │  │
│ FK │ completed_by ─────┼──┤    │                 │  │ FK │ doctor_id ──────────┼──┤
│    │   (doctor/nurse)  │  │ FK │ doctor_id ──────┼──┤    │   [Nullable]        │  │
│    │   [Nullable]      │  │    │                 │  │    │                     │  │
│    │                   │  │ FK │ dispensed_by ───┼──┤    │ reason         : TEXT  │
│    │ appointment_number│  │    │   (pharmacist)  │  │    │ start_date     : DATE  │
│    │   : INTEGER [UQ]  │  │    │   [Nullable]    │  │    │ end_date       : DATE  │
│    │ appointment_date  │  │    │                 │  │    │ days_requested : INT   │
│    │   : DATE          │  │    │ medications     │  │    │ status         : ENUM  │
│    │ appointment_time  │  │    │   : TEXT        │  │    │   ('pending',         │
│    │   : TIME          │  │    │ status     : ENUM  │    │    'approved',        │
│    │ reason       : TEXT  │    │   ('pending',   │  │    │    'rejected')        │
│    │   [Nullable]      │  │    │    'dispensed', │  │    │ doctor_notes   : TEXT  │
│    │ status       : ENUM  │    │    'completed') │  │    │   [Nullable]          │
│    │   ('pending',     │  │    │ dispensed_at    │  │    │ rejection_reason:TEXT  │
│    │    'checked_in',  │  │    │   : TIMESTAMP   │  │    │   [Nullable]          │
│    │    'in_progress', │  │    │   [Nullable]    │  │    │ document_path  :VARCHAR│
│    │    'completed',   │  │    │ created_at      │  │    │   [Nullable]          │
│    │    'cancelled')   │  │    │   : TIMESTAMP   │  │    │ approved_at    :TIMESTAMP
│    │ priority     : ENUM  │    │ updated_at      │  │    │   [Nullable]          │
│    │   ('normal',      │  │    │   : TIMESTAMP   │  │    │ created_at : TIMESTAMP │
│    │    'urgent')      │  │    │                 │  │    │ updated_at : TIMESTAMP │
│    │ medical_notes     │  │    │                 │  │    │                     │
│    │   : TEXT          │  │    │                 │  │    │                     │
│    │   [Nullable]      │  │    │                 │  │    │                     │
│    │ lab_reports  : TEXT  │    │                 │  │    │                     │
│    │   [Nullable]      │  │    │                 │  │    │                     │
│    │   (PDF paths)     │  │    │                 │  │    │                     │
│    │ checked_in_at     │  │    │                 │  │    │                     │
│    │   : TIMESTAMP     │  │    │                 │  │    │                     │
│    │   [Nullable]      │  │    │                 │  │    │                     │
│    │ completed_at      │  │    │                 │  │    │                     │
│    │   : TIMESTAMP     │  │    │                 │  │    │                     │
│    │   [Nullable]      │  │    │                 │  │    │                     │
│    │ created_at        │  │    │                 │  │    │                     │
│    │   : TIMESTAMP     │  │    │                 │  │    │                     │
│    │ updated_at        │  │    │                 │  │    │                     │
│    │   : TIMESTAMP     │  │    │                 │  │    │                     │
└────────────────────────┘  └──────────────────────┘  └──────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────────┐
│                        SUPPORTING AUTHENTICATION TABLES                           │
└──────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┐  ┌────────────────────────────────────────────┐
│  PERSONAL_ACCESS_TOKENS TABLE    │  │     PASSWORD_RESET_TOKENS TABLE            │
├──────────────────────────────────┤  ├────────────────────────────────────────────┤
│ PK │ id                          │  │ PK │ email : VARCHAR(255)                  │
│ FK │ tokenable_id                │  │    │ token : VARCHAR(255)                  │
│    │ tokenable_type              │  │    │ created_at : TIMESTAMP [Nullable]     │
│    │ name : VARCHAR(255)         │  └────────────────────────────────────────────┘
│    │ token : VARCHAR(64) [UNIQUE]│
│    │ abilities : TEXT [Nullable] │  ┌────────────────────────────────────────────┐
│    │ last_used_at : TIMESTAMP    │  │          SESSIONS TABLE                    │
│    │ expires_at : TIMESTAMP      │  ├────────────────────────────────────────────┤
│    │ created_at : TIMESTAMP      │  │ PK │ id : VARCHAR(255)                     │
│    │ updated_at : TIMESTAMP      │  │ FK │ user_id : BIGINT [Nullable]           │
└──────────────────────────────────┘  │    │ ip_address : VARCHAR(45) [Nullable]   │
                                      │    │ user_agent : TEXT [Nullable]          │
┌──────────────────────────────────┐  │    │ payload : LONGTEXT                    │
│       CACHE TABLE                │  │    │ last_activity : INTEGER               │
├──────────────────────────────────┤  └────────────────────────────────────────────┘
│ PK │ key : VARCHAR(255)          │
│    │ value : MEDIUMTEXT          │  ┌────────────────────────────────────────────┐
│    │ expiration : INTEGER        │  │          JOBS TABLE (Queue System)         │
└──────────────────────────────────┘  ├────────────────────────────────────────────┤
                                      │ PK │ id                                    │
┌──────────────────────────────────┐  │    │ queue : VARCHAR(255)                  │
│     CACHE_LOCKS TABLE            │  │    │ payload : LONGTEXT                    │
├──────────────────────────────────┤  │    │ attempts : TINYINT UNSIGNED           │
│ PK │ key : VARCHAR(255)          │  │    │ reserved_at : INTEGER UNSIGNED [Null] │
│    │ owner : VARCHAR(255)        │  │    │ available_at : INTEGER UNSIGNED       │
│    │ expiration : INTEGER        │  │    │ created_at : INTEGER UNSIGNED         │
└──────────────────────────────────┘  └────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════════
                              RELATIONSHIPS SUMMARY
═══════════════════════════════════════════════════════════════════════════════════

1. USERS (Parent Entity)
   └── One user can have:
       ├── Many appointments (as patient) [1:N]
       ├── Many appointments created (as nurse) [1:N]
       ├── Many appointments completed (as doctor/nurse) [1:N]
       ├── Many prescriptions (as patient) [1:N]
       ├── Many prescriptions (as doctor who prescribed) [1:N]
       ├── Many prescriptions dispensed (as pharmacist) [1:N]
       ├── Many medical certificate requests (as requester) [1:N]
       └── Many medical certificates approved (as doctor) [1:N]

2. APPOINTMENTS
   └── Relationships:
       ├── Belongs to ONE user (patient) [N:1]
       ├── Belongs to ONE user (created by nurse) [N:1]
       ├── Belongs to ONE user (completed by doctor/nurse) [N:1] [Optional]
       ├── Has MANY prescriptions [1:N]
       └── Has MANY medical certificates [1:N] [Optional]

3. PRESCRIPTIONS
   └── Relationships:
       ├── Belongs to ONE appointment [N:1]
       ├── Belongs to ONE user (patient) [N:1]
       ├── Belongs to ONE user (doctor who prescribed) [N:1]
       └── Belongs to ONE user (pharmacist who dispensed) [N:1] [Optional]

4. MEDICAL_CERTIFICATES
   └── Relationships:
       ├── Belongs to ONE user (requester - student/staff) [N:1]
       ├── Belongs to ONE appointment [N:1] [Optional]
       └── Belongs to ONE user (doctor who approved) [N:1] [Optional]

═══════════════════════════════════════════════════════════════════════════════════
                              USER ROLES & PERMISSIONS
═══════════════════════════════════════════════════════════════════════════════════

┌─────────────┬──────────────────────────────────────────────────────────────────┐
│    ROLE     │                        RESPONSIBILITIES                          │
├─────────────┼──────────────────────────────────────────────────────────────────┤
│   ADMIN     │ • Approve/reject user registrations (medical staff)              │
│             │ • Manage system settings                                         │
│             │ • View all appointments, prescriptions, medical certificates     │
│             │ • Change password                                                │
├─────────────┼──────────────────────────────────────────────────────────────────┤
│   DOCTOR    │ • Complete appointments and add medical notes                    │
│             │ • Create prescriptions for patients                              │
│             │ • Upload lab reports (PDF)                                       │
│             │ • Approve/reject medical certificate requests                    │
│             │ • Add doctor notes and digital signature                         │
│             │ • 2FA required (Email OTP)                                       │
│             │ • Change password                                                │
├─────────────┼──────────────────────────────────────────────────────────────────┤
│   NURSE     │ • Create appointments for students/staff                         │
│             │ • Check-in patients for appointments                             │
│             │ • View appointment queue                                         │
│             │ • Mark appointments as in-progress                               │
│             │ • 2FA required (Email OTP)                                       │
│             │ • Change password                                                │
├─────────────┼──────────────────────────────────────────────────────────────────┤
│ PHARMACIST  │ • View pending prescriptions                                     │
│             │ • Dispense medications                                           │
│             │ • Mark prescriptions as completed                                │
│             │ • 2FA required (Email OTP)                                       │
│             │ • Change password                                                │
├─────────────┼──────────────────────────────────────────────────────────────────┤
│  STUDENT    │ • View own appointments and status                               │
│  /STAFF     │ • Download lab reports                                           │
│             │ • Request medical certificates                                   │
│             │ • View medical certificate status                                │
│             │ • Download approved certificates (PDF)                           │
│             │ • Change password                                                │
│             │ • No 2FA required                                                │
└─────────────┴──────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════
                              WORKFLOW DIAGRAMS
═══════════════════════════════════════════════════════════════════════════════════

APPOINTMENT WORKFLOW:
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│   NURSE     │    │   PATIENT    │    │   DOCTOR    │    │  PHARMACIST  │
│  Creates    │───▶│  Checked-in  │───▶│  Completes  │───▶│  Dispenses   │
│ Appointment │    │ (at counter) │    │ + Notes +   │    │  Medication  │
└─────────────┘    └──────────────┘    │ Prescription│    └──────────────┘
   Status:            Status:           └─────────────┘       Status:
   pending           checked_in         Status:              dispensed/
                                        in_progress/         completed
                                        completed

MEDICAL CERTIFICATE WORKFLOW:
┌──────────────┐    ┌────────────────┐    ┌──────────────────┐
│ STUDENT/STAFF│    │     DOCTOR     │    │     SYSTEM       │
│  Requests    │───▶│ Reviews &      │───▶│  Generates PDF   │
│ Certificate  │    │ Approves/      │    │  with Signature  │
│              │    │ Rejects        │    │                  │
└──────────────┘    └────────────────┘    └──────────────────┘
   Status:            Status:                Status:
   pending           approved/rejected      (downloadable)

2FA LOGIN WORKFLOW (Medical Staff Only):
┌──────────────┐    ┌────────────────┐    ┌──────────────────┐
│   USER       │    │    SYSTEM      │    │     EMAIL        │
│ Enters       │───▶│ Sends 6-digit  │───▶│  Receives OTP    │
│ Credentials  │    │ OTP via Email  │    │  (5 min expiry)  │
└──────────────┘    └────────────────┘    └──────────────────┘
                            │                       │
                            │                       ▼
                            │              ┌────────────────┐
                            │              │  User Enters   │
                            └──────────────│  OTP Code      │
                                          └────────────────┘
                                                   │
                                                   ▼
                                          ┌────────────────┐
                                          │ Access Granted │
                                          │  to Dashboard  │
                                          └────────────────┘

═══════════════════════════════════════════════════════════════════════════════════
                              KEY FEATURES
═══════════════════════════════════════════════════════════════════════════════════

✓ Role-based access control (6 user roles)
✓ Two-Factor Authentication (2FA) for medical staff via Email OTP
✓ Appointment management with real-time queue status
✓ Prescription creation and dispensing workflow
✓ Lab report upload and download (PDF)
✓ Medical certificate request and approval system
✓ PDF generation with doctor's digital signature
✓ Password change functionality for all users
✓ Admin approval system for medical staff registration
✓ Real-time appointment status tracking
✓ Unique appointment numbering system
✓ Priority levels for urgent cases

═══════════════════════════════════════════════════════════════════════════════════
                              DATABASE CONSTRAINTS
═══════════════════════════════════════════════════════════════════════════════════

PRIMARY KEYS:
• All tables use auto-incrementing BIGINT id as primary key
• Composite keys for cache and session tables

FOREIGN KEYS:
• appointments.user_id          → users.id (CASCADE DELETE)
• appointments.created_by       → users.id (CASCADE DELETE)
• appointments.completed_by     → users.id (SET NULL on delete)
• prescriptions.appointment_id  → appointments.id (CASCADE DELETE)
• prescriptions.patient_id      → users.id (CASCADE DELETE)
• prescriptions.doctor_id       → users.id (CASCADE DELETE)
• prescriptions.dispensed_by    → users.id (SET NULL on delete)
• medical_certificates.user_id  → users.id (CASCADE DELETE)
• medical_certificates.appointment_id → appointments.id (SET NULL on delete)
• medical_certificates.doctor_id → users.id (SET NULL on delete)

UNIQUE CONSTRAINTS:
• users.email
• appointments.appointment_number
• personal_access_tokens.token

DEFAULT VALUES:
• users.is_approved = false
• appointments.status = 'pending'
• appointments.priority = 'normal'
• prescriptions.status = 'pending'
• medical_certificates.status = 'pending'

═══════════════════════════════════════════════════════════════════════════════════
                              INDEXES (Recommended)
═══════════════════════════════════════════════════════════════════════════════════

• users.email (UNIQUE)
• users.role
• appointments.user_id
• appointments.created_by
• appointments.completed_by
• appointments.appointment_date
• appointments.status
• prescriptions.appointment_id
• prescriptions.patient_id
• prescriptions.doctor_id
• prescriptions.status
• medical_certificates.user_id
• medical_certificates.status
• sessions.user_id
• sessions.last_activity

═══════════════════════════════════════════════════════════════════════════════════
                              NOTES
═══════════════════════════════════════════════════════════════════════════════════

1. OTP System: 6-digit codes with 5-minute expiration for medical staff login
2. Lab Reports: Stored as PDF files, paths saved in appointments.lab_reports (TEXT)
3. Digital Signatures: Doctor's signature stored as base64 in users.signature
4. Medical Certificates: Generated as PDF with doctor's signature embedded
5. Appointment Numbers: Unique sequential numbers for easy reference
6. Timestamps: All tables include created_at and updated_at for audit trail
7. Soft Deletes: Not implemented - using CASCADE/SET NULL for referential integrity
8. Queue System: Laravel jobs table for handling background tasks (emails, PDFs)

═══════════════════════════════════════════════════════════════════════════════════
