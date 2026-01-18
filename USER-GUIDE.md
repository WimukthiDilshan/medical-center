# Medical Center Management System
## Complete User Guide & Documentation

---

**University of Ruhuna - Faculty of Engineering**  
**Medical Center Management System**  
**Version 1.0**  
**Date: January 2026**

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Getting Started](#getting-started)
3. [User Roles & Access](#user-roles--access)
4. [Admin Guide](#admin-guide)
5. [Doctor Guide](#doctor-guide)
6. [Nurse Guide](#nurse-guide)
7. [Pharmacist Guide](#pharmacist-guide)
8. [Student/Staff Guide](#studentstaff-guide)
9. [Technical Documentation](#technical-documentation)
10. [Troubleshooting](#troubleshooting)
11. [FAQ](#faq)

---

## System Overview

### Introduction

The Medical Center Management System is a comprehensive web-based application designed to streamline healthcare operations at the University of Ruhuna Faculty of Engineering. The system manages appointments, prescriptions, lab reports, and medical certificates while maintaining strict role-based access control and security measures.

### Key Features

- **Role-Based Access Control**: 6 distinct user roles (Admin, Doctor, Nurse, Pharmacist, Student, Staff)
- **Two-Factor Authentication**: Enhanced security for medical staff using Email OTP
- **Appointment Management**: Complete workflow from scheduling to completion
- **Prescription System**: Digital prescription creation and dispensing
- **Lab Reports**: Upload and download patient lab reports in PDF format
- **Medical Certificates**: Request, approve, and generate medical certificates
- **Real-Time Status Tracking**: Live updates on appointment and prescription status
- **Digital Signatures**: Doctors can digitally sign medical certificates
- **Password Management**: Self-service password change for all users

### System Architecture

**Frontend**: React.js (Vite)  
**Backend**: Laravel 10+ (PHP)  
**Database**: MySQL  
**Authentication**: Laravel Sanctum with 2FA  
**Email**: SMTP (Gmail)  
**PDF Generation**: DomPDF  

---

## Getting Started

### System Requirements

**For Users:**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Stable internet connection
- Email account for 2FA (medical staff only)

**For Administrators:**
- PHP 8.1 or higher
- MySQL 5.7 or higher
- Node.js 18 or higher
- Composer
- Web server (Apache/Nginx)

### Accessing the System

1. **URL**: Open your web browser and navigate to the system URL
2. **Login Page**: You will see the Medical Center login page with the university logo
3. **First Time Users**: Click on "Register" to create an account

### Registration Process

#### For Students/Staff:

1. Click **"Register as Student/Staff"**
2. Fill in the registration form:
   - Full Name
   - Email Address (university email recommended)
   - Staff/Student ID
   - Phone Number
   - Password (minimum 6 characters)
   - Confirm Password
3. Select Role: Student or Staff
4. Click **"Register"**
5. Login immediately with your credentials
6. **No approval required** - instant access

#### For Medical Personnel (Doctor, Nurse, Pharmacist):

1. Click **"Register as Medical Personnel"**
2. Fill in the registration form:
   - Full Name
   - Email Address
   - Staff ID
   - Phone Number
   - Password (minimum 6 characters)
   - Confirm Password
3. Select Role: Doctor, Nurse, or Pharmacist
4. Click **"Register"**
5. **Wait for Admin Approval** - you'll receive notification via email
6. Once approved, login with your credentials

### Login Process

#### Standard Login (Student/Staff/Admin):

1. Enter your **Email**
2. Enter your **Password**
3. Click **"Login"**
4. You will be redirected to your dashboard

#### 2FA Login (Doctor/Nurse/Pharmacist):

1. Enter your **Email** and **Password**
2. Click **"Login"**
3. System displays: "✉️ Verifying credentials..."
4. An OTP code is sent to your email
5. System displays: "✉️ OTP sent to your email! Redirecting..."
6. You are redirected to **OTP Verification Page**
7. Check your email for the 6-digit code
8. Enter the OTP code (valid for 5 minutes)
9. Click **"Verify Code"**
10. You are redirected to your dashboard

**Note**: If OTP expires, click "Resend Code" button (available after 1 minute)

---

## User Roles & Access

### Role Hierarchy

```
┌─────────────────────────────────────────┐
│              ADMIN                      │
│  • System Management                    │
│  • User Approval                        │
│  • Full System Access                   │
└─────────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    ▼               ▼               ▼
┌─────────┐   ┌─────────┐   ┌──────────────┐
│ DOCTOR  │   │  NURSE  │   │ PHARMACIST   │
│ • 2FA   │   │ • 2FA   │   │ • 2FA        │
└─────────┘   └─────────┘   └──────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌──────────────┐      ┌──────────────┐
│   STUDENT    │      │    STAFF     │
│ • No 2FA     │      │  • No 2FA    │
└──────────────┘      └──────────────┘
```

### Access Permissions Matrix

| Feature | Admin | Doctor | Nurse | Pharmacist | Student | Staff |
|---------|-------|--------|-------|------------|---------|-------|
| Approve Users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create Appointments | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Complete Appointments | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Prescriptions | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Dispense Medications | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Upload Lab Reports | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Download Lab Reports | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Request Certificates | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Approve Certificates | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Own Data | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Change Password | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 2FA Required | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## Admin Guide

### Dashboard Overview

When you login as Admin, you see:

- **📊 Statistics Overview**
  - Total Registered Users
  - Pending Approvals
  - Total Appointments
  - Active Prescriptions

- **👥 Pending Approvals Section**
  - List of medical staff waiting approval
  - Quick approve/reject buttons

- **📋 Recent Activity**
  - Latest appointments
  - Recent medical certificate requests
  - System activity log

### Managing User Approvals

#### Viewing Pending Approvals:

1. Login to Admin Dashboard
2. Scroll to **"Pending User Approvals"** section
3. You will see a list of pending users with:
   - Name
   - Email
   - Role (Doctor/Nurse/Pharmacist)
   - Staff ID
   - Registration Date

#### Approving a User:

1. Review the user's information
2. Click the green **"✅ Approve"** button
3. Confirmation message appears: "User approved successfully"
4. User receives email notification
5. User can now login with 2FA

#### Rejecting a User:

1. Review the user's information
2. Click the red **"❌ Reject"** button
3. Confirmation dialog appears
4. User is removed from pending list
5. User receives rejection notification

### Viewing Medical Certificates

1. Navigate to **Dashboard** → **Medical Certificates**
2. View all medical certificate requests:
   - Pending certificates
   - Approved certificates
   - Rejected certificates
3. Filter by status using tabs
4. View certificate details:
   - Requester name and email
   - Reason for request
   - Date range
   - Days requested
   - Doctor notes (if approved)
   - Status

### Viewing All Appointments

1. From Admin Dashboard
2. View **"All Appointments"** section
3. See complete appointment list with:
   - Patient name
   - Appointment date/time
   - Status (Pending, Checked-in, In-progress, Completed, Cancelled)
   - Priority
   - Assigned nurse

### Changing Password

1. Click **"🔐 Change Password"** button in navigation
2. Fill in the form:
   - Current Password
   - New Password (minimum 6 characters)
   - Confirm New Password
3. Click **"Change Password"**
4. Success message appears
5. Continue using the system with new password

---

## Doctor Guide

### Dashboard Overview

Doctor dashboard displays:

- **📅 Today's Queue**
  - List of patients to see today
  - Current status of each patient
  - Priority indicators

- **📋 Pending Prescriptions**
  - Prescriptions awaiting your action

- **📄 Medical Certificate Requests**
  - Pending certificate approval requests

- **Quick Actions**
  - Change Password
  - View All Patients
  - Logout

### Complete Patient Workflow

#### Step 1: View Appointment Queue

1. Login with email, password, and OTP verification
2. Dashboard shows **"Today's Patients"**
3. Filter by status:
   - Pending (not yet checked in)
   - Checked-in (waiting)
   - In-progress (currently being seen)

#### Step 2: Start Consultation

1. Find patient in queue
2. Patient status should be **"Checked-in"** (nurse has checked them in)
3. Click **"Start Consultation"** button
4. Status changes to **"In-progress"**

#### Step 3: Add Medical Notes

1. In the appointment card, enter **Medical Notes**
2. Document:
   - Patient symptoms
   - Diagnosis
   - Treatment plan
   - Observations
3. Notes are auto-saved

#### Step 4: Create Prescription

1. Click **"💊 Create Prescription"** button
2. Fill in the prescription form:
   - **Medications**: Enter medicine names and dosages
     - Example: "Paracetamol 500mg - 2 tablets 3 times daily"
     - Each medication on a new line
3. Click **"Create Prescription"**
4. Prescription is sent to pharmacy
5. Pharmacist will be notified

#### Step 5: Upload Lab Reports (if applicable)

1. If patient needs lab test results
2. Click **"📎 Upload Lab Report"** button
3. Select PDF file from computer
4. Click **"Upload"**
5. File is uploaded and linked to appointment
6. Patient can download report from their dashboard

#### Step 6: Complete Appointment

1. After consultation and documentation
2. Click **"✅ Complete Appointment"** button
3. Appointment status changes to **"Completed"**
4. Patient is notified
5. Record is added to patient history

### Managing Medical Certificates

#### Viewing Certificate Requests:

1. Dashboard shows **"Pending Medical Certificate Requests"**
2. Each request displays:
   - Student/Staff name
   - Reason for certificate
   - Requested dates (start/end)
   - Number of days

#### Approving a Certificate:

1. Review the request details
2. If legitimate, click **"✅ Approve"**
3. Modal dialog opens
4. Enter **Doctor Notes**:
   - Medical justification
   - Any specific instructions
5. Click **"Approve Certificate"**
6. System generates PDF with:
   - Student details
   - Date range
   - Doctor notes
   - Your digital signature
7. Student receives notification
8. PDF is available for download

#### Rejecting a Certificate:

1. Review the request details
2. If not justified, click **"❌ Reject"**
3. Modal dialog opens
4. Enter **Rejection Reason**:
   - Clear explanation
   - Medical rationale
5. Click **"Reject Certificate"**
6. Student receives notification with reason

### Managing Digital Signature

#### Setting Up Your Signature:

1. Navigate to **Profile Settings**
2. Click **"Upload Signature"**
3. Options:
   - Upload signature image (PNG/JPG)
   - Draw signature using mouse/stylus
4. Save signature
5. Signature is automatically added to:
   - Medical certificates you approve
   - Prescriptions you create

### Changing Password

1. Click **"🔐 Change Password"** in dashboard
2. Enter current password
3. Enter new password (minimum 6 characters)
4. Confirm new password
5. Click **"Change Password"**
6. Password updated successfully

---

## Nurse Guide

### Dashboard Overview

Nurse dashboard includes:

- **📋 Today's Schedule**
  - All appointments for today
  - Patient queue

- **⏰ Create New Appointment**
  - Quick access to schedule patients

- **📊 Statistics**
  - Total appointments today
  - Pending check-ins
  - In-progress consultations

### Creating Appointments

#### Step-by-Step Process:

1. Click **"+ Create New Appointment"** button
2. **Search for Patient**:
   - Enter patient email or staff ID
   - System searches registered students/staff
   - Select patient from dropdown
   
3. **Fill Appointment Details**:
   - **Date**: Select appointment date (today or future)
   - **Time**: Choose time slot
   - **Reason**: Brief description of patient's concern
   - **Priority**: 
     - Normal (default)
     - Urgent (for emergency cases)

4. Click **"Create Appointment"**
5. **Unique Appointment Number** is generated
6. Patient receives notification
7. Appointment appears in today's queue

### Managing Patient Queue

#### Checking In Patients:

1. When patient arrives at medical center
2. Find their appointment in the queue
3. Verify patient identity
4. Click **"✅ Check In"** button
5. Status changes from "Pending" to "Checked-in"
6. Patient is added to doctor's waiting queue
7. Record check-in time

#### Monitoring Queue Status:

1. Dashboard shows real-time status:
   - **Pending**: Patient hasn't arrived yet
   - **Checked-in**: Patient waiting for doctor
   - **In-progress**: Currently with doctor
   - **Completed**: Consultation finished
   - **Cancelled**: Appointment cancelled

2. Queue updates automatically every 15 seconds

### Handling Urgent Cases

1. When creating appointment, select **Priority: Urgent**
2. Urgent appointments are highlighted in red
3. Doctor sees urgent cases first in their queue
4. Ensure urgent patients are checked in immediately

### Completing Appointments (Nurse Role)

If nurse is also completing consultations:

1. After patient consultation
2. Add medical notes
3. Click **"Complete Appointment"**
4. Status changes to "Completed"

### Changing Password

1. Click **"🔐 Change Password"**
2. Enter current password
3. Enter new password
4. Confirm password
5. Save changes

---

## Pharmacist Guide

### Dashboard Overview

Pharmacist dashboard displays:

- **💊 Pending Prescriptions**
  - All prescriptions waiting to be dispensed
  - Patient details
  - Medications list

- **📊 Today's Statistics**
  - Total prescriptions
  - Dispensed today
  - Pending count

- **🕒 Recent Activity**
  - Latest dispensed prescriptions

### Dispensing Medications

#### Step-by-Step Process:

1. Login with 2FA (email OTP)
2. View **"Pending Prescriptions"** list
3. Each prescription shows:
   - Patient name
   - Doctor who prescribed
   - Appointment date
   - Medications list
   - Prescription date

#### Processing a Prescription:

1. **Verify Prescription**:
   - Check patient identity
   - Verify prescription details
   - Read medication list carefully

2. **Prepare Medications**:
   - Gather prescribed medications
   - Count correct quantities
   - Package appropriately

3. **Dispense Prescription**:
   - Click **"✅ Dispense"** button on prescription card
   - Confirmation dialog appears
   - Verify details one more time
   - Click **"Confirm Dispense"**

4. **System Updates**:
   - Status changes to "Dispensed"
   - Your name is recorded as dispenser
   - Timestamp is recorded
   - Patient is notified

5. **Patient Counseling**:
   - Explain medication usage
   - Provide written instructions
   - Answer patient questions
   - Document any special instructions

#### Marking Prescription as Completed:

1. After patient receives medications
2. Click **"Complete"** button
3. Status changes to "Completed"
4. Prescription archived in history

### Viewing Prescription History

1. Navigate to **"All Prescriptions"**
2. Filter by:
   - Status (Pending/Dispensed/Completed)
   - Date range
   - Patient name
   - Doctor name
3. Export reports if needed

### Inventory Management (if applicable)

- Track medication stock levels
- Flag low inventory items
- Request restocking
- Document expiry dates

### Changing Password

1. Click **"🔐 Change Password"**
2. Current password
3. New password
4. Confirm password
5. Submit

---

## Student/Staff Guide

### Dashboard Overview

Your dashboard shows:

- **🏥 Medical Center Hours**
  - Operating hours: Mon-Fri, 8:00 AM - 5:00 PM

- **📄 Medical Certificate**
  - Quick link to request certificates

- **Today's Appointment** (if any)
  - Current appointment status
  - Queue position
  - Estimated wait time

- **📋 Lab Reports**
  - Available lab reports for download

- **📝 Medical Certificate Requests**
  - Status of your certificate requests

### Viewing Your Appointment

When you have an appointment scheduled:

1. Dashboard displays **"Your Appointment Today"** card
2. Information shown:
   - Appointment number (e.g., #12345)
   - Scheduled time
   - Current status
   - Your position in queue

3. **Status Meanings**:
   - **Pending**: Waiting for you to arrive
   - **Checked-in**: You've checked in, waiting for doctor
   - **In-progress**: Currently with doctor
   - **Completed**: Consultation finished

### Checking Appointment Status

1. Arrive at medical center
2. Check in with nurse at reception
3. Nurse updates your status to "Checked-in"
4. Wait in waiting area
5. Monitor dashboard for status updates
6. When status changes to "In-progress", proceed to consultation room

### Downloading Lab Reports

#### When Lab Reports are Available:

1. Dashboard shows **"📋 My Lab Reports"** section
2. Each report card displays:
   - Appointment number
   - Test date
   - Report status: "Ready for Download"

#### Download Process:

1. Click **"⬇ Download Report"** button
2. PDF file downloads automatically
3. File name: `Lab_Report_[AppointmentID].pdf`
4. Open PDF to view:
   - Test results
   - Reference ranges
   - Doctor's notes
   - Lab verification stamp

### Requesting Medical Certificates

#### When to Request:

- Illness requiring class/work absence
- Medical appointments
- Recovery periods
- Medical emergencies

#### Step-by-Step Request:

1. Click **"📄 Request Medical Certificate"** button
2. Fill in the request form:

   **Reason for Certificate**:
   - Describe your medical situation
   - Be specific but concise
   - Example: "Flu with high fever, doctor advised 3 days rest"

   **Start Date**:
   - First day of absence
   - Calendar picker

   **End Date**:
   - Last day of absence
   - Calendar picker

   **Days Requested**:
   - Auto-calculated from date range
   - Shows total number of days

   **Link to Appointment** (optional):
   - If you had recent appointment, select it
   - Helps doctor review your case

3. Click **"Submit Request"**
4. Request sent to doctor for review
5. Status: "Pending Approval"

#### Tracking Certificate Status:

1. Dashboard shows **"My Medical Certificate Requests"**
2. Each request displays:
   - Submission date
   - Date range
   - Days requested
   - Current status
   - Doctor response (if any)

3. **Status Types**:
   - **Pending**: Waiting for doctor review
   - **Approved**: Certificate ready for download
   - **Rejected**: Request denied with reason

#### Downloading Approved Certificate:

1. When status changes to "Approved"
2. Click **"⬇ Download Certificate"** button
3. PDF downloads automatically
4. Certificate includes:
   - University letterhead
   - Your details
   - Absence dates
   - Doctor notes
   - Doctor's digital signature
   - Official stamp
   - Issuance date

5. Submit certificate to:
   - Lecturer/Department
   - Supervisor
   - Administration

### Viewing Rejected Certificates:

1. If request is rejected
2. Status shows "Rejected"
3. Click **"View Details"**
4. See **Rejection Reason** from doctor
5. Options:
   - Understand the reason
   - Schedule appointment if needed
   - Submit new request with more information

### Changing Password

1. Click **"🔐 Change Password"**
2. Enter:
   - Current password
   - New password (min 6 characters)
   - Confirm new password
3. Click **"Change Password"**
4. Success notification
5. Continue using system

---

## Technical Documentation

### System Installation

#### Backend Setup (Laravel):

```bash
# 1. Navigate to project directory
cd medical-center/laravel-api

# 2. Install PHP dependencies
composer install

# 3. Copy environment file
copy .env.example .env

# 4. Generate application key
php artisan key:generate

# 5. Configure database in .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=medical-center
DB_USERNAME=root
DB_PASSWORD=your_password

# 6. Configure mail settings (Gmail example)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com

# 7. Run migrations and seeders
php artisan migrate:fresh --seed

# 8. Start development server
php artisan serve
```

#### Frontend Setup (React):

```bash
# 1. Navigate to frontend directory
cd medical-center/react-frontend

# 2. Install Node dependencies
npm install

# 3. Start development server
npm run dev
```

### Default Admin Credentials

After fresh installation:

- **Email**: `admin@medicalcenter.com`
- **Password**: `admin123`

**⚠️ IMPORTANT**: Change admin password immediately after first login!

### Database Schema

The system uses 14 migrations creating the following tables:

1. **users** - All system users (6 roles)
2. **personal_access_tokens** - API authentication tokens
3. **appointments** - Patient appointments
4. **prescriptions** - Doctor prescriptions
5. **medical_certificates** - Certificate requests
6. **cache** - Application cache
7. **cache_locks** - Cache locking mechanism
8. **jobs** - Background job queue
9. **job_batches** - Batch job tracking
10. **failed_jobs** - Failed job logs
11. **sessions** - User sessions
12. **password_reset_tokens** - Password reset tokens

### API Endpoints

#### Authentication:
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/verify-otp` - OTP verification (2FA)
- `POST /api/resend-otp` - Resend OTP code
- `POST /api/logout` - User logout
- `POST /api/change-password` - Change password

#### Appointments:
- `GET /api/appointments/history/{userId}` - Get user appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/{id}/check-in` - Check in patient
- `PUT /api/appointments/{id}/start` - Start consultation
- `PUT /api/appointments/{id}/complete` - Complete appointment

#### Prescriptions:
- `GET /api/prescriptions/pending` - Pending prescriptions
- `POST /api/prescriptions` - Create prescription
- `PUT /api/prescriptions/{id}/dispense` - Dispense medication

#### Lab Reports:
- `POST /api/lab-reports/upload` - Upload lab report
- `GET /api/lab-reports/my-reports` - Get patient reports
- `GET /api/lab-reports/download/{appointmentId}` - Download report

#### Medical Certificates:
- `POST /api/medical-certificates` - Request certificate
- `GET /api/medical-certificates/my-requests` - User's requests
- `GET /api/medical-certificates/pending` - Pending approvals (doctor)
- `PUT /api/medical-certificates/{id}/approve` - Approve certificate
- `PUT /api/medical-certificates/{id}/reject` - Reject certificate
- `GET /api/medical-certificates/{id}/download` - Download certificate PDF

#### Admin:
- `GET /api/admin/pending-users` - Pending user approvals
- `PUT /api/admin/approve-user/{id}` - Approve user
- `DELETE /api/admin/reject-user/{id}` - Reject user

### Security Features

#### Two-Factor Authentication (2FA):

- **Who**: Doctor, Nurse, Pharmacist only
- **Method**: Email OTP
- **Code**: 6-digit numeric
- **Validity**: 5 minutes
- **Storage**: Encrypted in database
- **Cleanup**: Cleared after verification

#### Password Security:

- **Hashing**: bcrypt algorithm
- **Min Length**: 6 characters
- **Confirmation**: Required on registration and password change
- **Reset**: Via email token

#### API Security:

- **Authentication**: Laravel Sanctum
- **Tokens**: Bearer token in Authorization header
- **Expiration**: Configurable per token
- **Rate Limiting**: Applied to all routes

#### File Upload Security:

- **PDF Only**: Lab reports and certificates
- **Validation**: File type and size checks
- **Storage**: Secure storage directory
- **Access Control**: Authenticated users only

### Email Configuration

For Gmail:

1. **Enable 2-Step Verification** on Google Account
2. **Generate App Password**:
   - Go to Google Account → Security
   - 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Update .env**:
   ```
   MAIL_MAILER=smtp
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=generated-app-password
   MAIL_ENCRYPTION=tls
   ```

### PDF Generation

Uses DomPDF library:

- **Medical Certificates**: Auto-generated on approval
- **Lab Reports**: Uploaded by doctors
- **Format**: A4 size
- **Content**: University letterhead, patient details, doctor signature
- **Storage**: `storage/app/public/` directory

---

## Troubleshooting

### Common Issues

#### 1. Unable to Login - 2FA Issues

**Problem**: OTP email not received

**Solutions**:
- Check spam/junk folder
- Verify email address is correct
- Wait 1 minute and click "Resend Code"
- Check email server settings (admin)
- Verify Gmail app password is correct

**Problem**: OTP expired

**Solutions**:
- OTP valid for 5 minutes only
- Click "Resend Code" button
- Enter new OTP code
- Complete verification quickly

#### 2. Registration Pending Approval

**Problem**: Cannot login after registration (medical staff)

**Solutions**:
- Medical staff require admin approval
- Wait for admin to review your registration
- Contact admin if waiting more than 24 hours
- Check registration email for status updates

#### 3. Appointment Not Showing

**Problem**: Created appointment doesn't appear

**Solutions**:
- Refresh browser page (F5)
- Check appointment date is correct
- Verify patient email/ID was entered correctly
- Check if appointment was accidentally cancelled
- System auto-refreshes every 15 seconds

#### 4. Cannot Download Lab Report

**Problem**: Download button doesn't work

**Solutions**:
- Ensure lab report has been uploaded by doctor
- Check browser popup blocker settings
- Try different browser
- Clear browser cache
- Check internet connection

#### 5. Medical Certificate Request Rejected

**Problem**: Certificate request was rejected

**Solutions**:
- Read rejection reason from doctor
- Ensure request is medically justified
- Link request to actual appointment
- Provide clear, detailed reason
- Schedule appointment if needed

#### 6. Prescription Not Appearing in Pharmacy

**Problem**: Doctor created prescription but pharmacist doesn't see it

**Solutions**:
- Verify prescription was saved (check confirmation)
- Refresh pharmacist dashboard
- Check prescription status with doctor
- Ensure appointment was completed
- Wait a few seconds for system sync

#### 7. Password Reset Issues

**Problem**: Forgot password

**Solutions**:
- Currently no self-service reset
- Contact system administrator
- Admin can reset your password
- Or register new account (students/staff only)

#### 8. Slow System Performance

**Problem**: Pages loading slowly

**Solutions**:
- Check internet connection speed
- Clear browser cache and cookies
- Try different browser
- Refresh page
- Contact IT if problem persists

---

## FAQ

### General Questions

**Q: What browsers are supported?**  
A: Chrome, Firefox, Safari, Edge (latest versions). Internet Explorer is not supported.

**Q: Can I access the system from mobile phone?**  
A: Yes, the system is responsive and works on mobile browsers.

**Q: How do I change my email address?**  
A: Contact system administrator to update email address.

**Q: Is my data secure?**  
A: Yes, all data is encrypted, passwords are hashed, and 2FA protects medical staff accounts.

### For Students/Staff

**Q: How do I book an appointment?**  
A: You cannot self-book. Visit the medical center and nurse will create appointment for you.

**Q: Can I cancel my appointment?**  
A: Contact the nurse at medical center to cancel or reschedule.

**Q: How long before I get my lab results?**  
A: Depends on test type. Usually 24-48 hours. You'll see download button when ready.

**Q: How many days can I request on medical certificate?**  
A: Doctor decides based on medical condition. Be reasonable with your request.

**Q: Can I download old certificates?**  
A: Yes, all approved certificates remain accessible in your dashboard.

### For Nurses

**Q: Can I create appointments for future dates?**  
A: Yes, select any date from the calendar.

**Q: What if patient doesn't show up?**  
A: Appointment stays "Pending". Doctor can mark as "Cancelled" if needed.

**Q: Can I edit appointment details after creation?**  
A: No, create a new appointment and cancel the old one.

**Q: How do I handle walk-in patients?**  
A: Create appointment with today's date and immediate time slot.

### For Doctors

**Q: Can I see previous consultations for a patient?**  
A: Yes, click on patient name to view appointment history.

**Q: What format for lab reports?**  
A: PDF only. Ensure reports are clear and readable.

**Q: Can I edit prescription after creation?**  
A: No, prescriptions cannot be edited. Create new prescription if needed.

**Q: How do I add my digital signature?**  
A: Go to Profile → Upload Signature → Draw or upload image.

**Q: Can I approve certificate without appointment?**  
A: Yes, but linking to appointment provides better documentation.

### For Pharmacists

**Q: What if medication is out of stock?**  
A: Note the shortage, dispense available items, coordinate with doctor for alternatives.

**Q: Can I partially dispense a prescription?**  
A: Yes, mark as "Dispensed" and add notes about partial fulfillment.

**Q: How do I track inventory?**  
A: Current system doesn't have inventory module. Use separate tracking.

### For Admins

**Q: How do I create additional admin accounts?**  
A: Register new user, manually update database role to 'admin', or use admin panel if available.

**Q: Can I delete user accounts?**  
A: Use database tools carefully. Ensure no active appointments/prescriptions linked.

**Q: How to backup the database?**  
A: Use MySQL dump: `mysqldump -u root -p medical-center > backup.sql`

**Q: How to view system logs?**  
A: Laravel logs: `laravel-api/storage/logs/laravel.log`

---

## Contact & Support

### Medical Center Contact

**Location**: Faculty of Engineering, University of Ruhuna  
**Operating Hours**: Monday - Friday, 8:00 AM - 5:00 PM  
**Phone**: [Contact Number]  
**Email**: medicalcenter@eng.ruh.ac.lk

### Technical Support

**System Administrator**: [Admin Name]  
**Email**: admin@medicalcenter.com  
**Support Hours**: During working hours

### Emergency

**University Emergency Number**: 911  
**Available**: 24/7

---

## Appendix

### Keyboard Shortcuts

- `Ctrl + R` - Refresh current page
- `Ctrl + F` - Search on page
- `F5` - Hard refresh
- `Ctrl + P` - Print current view

### Status Reference

#### Appointment Status:
- 🟡 **Pending** - Not checked in yet
- 🔵 **Checked-in** - Waiting for doctor
- 🟠 **In-progress** - With doctor now
- 🟢 **Completed** - Consultation finished
- 🔴 **Cancelled** - Appointment cancelled

#### Prescription Status:
- 🟡 **Pending** - Waiting to be dispensed
- 🟠 **Dispensed** - Medications given
- 🟢 **Completed** - Process finished

#### Certificate Status:
- 🟡 **Pending** - Awaiting doctor approval
- 🟢 **Approved** - Certificate ready
- 🔴 **Rejected** - Request denied

### File Upload Limits

- **Lab Reports**: Max 5MB PDF
- **Signature**: Max 2MB PNG/JPG
- **Supported Formats**: PDF for documents, PNG/JPG for images

---

## Glossary

- **2FA**: Two-Factor Authentication - Additional security layer
- **OTP**: One-Time Password - Temporary verification code
- **Sanctum**: Laravel's authentication system
- **API**: Application Programming Interface
- **PDF**: Portable Document Format
- **SMTP**: Simple Mail Transfer Protocol
- **UUID**: Universally Unique Identifier

---

## Version History

**Version 1.0** - January 2026
- Initial release
- Complete appointment management
- Prescription system
- Medical certificate workflow
- 2FA for medical staff
- Lab report upload/download
- Password change functionality

---

## Credits

**Developed By**: [Your Development Team]  
**Powered By**: Laravel + React  
**For**: University of Ruhuna - Faculty of Engineering

---

**Document End**

*For the latest updates and announcements, check the system dashboard or contact your administrator.*
