# Quick Start Guide - Medical Center System

## Current Status
✅ Backend server running on: http://localhost:8000
✅ Frontend server running on: http://localhost:5173

## Default Admin Login
- **Email**: admin@medical.com
- **Password**: admin123

## How to Use the System

### 1. Login as Admin
1. Open browser to http://localhost:5173
2. You'll be redirected to the login page
3. Login with admin credentials above
4. You'll see the Admin Dashboard with 3 tabs:
   - **Pending Approvals**: Review and approve medical personnel
   - **All Users**: View all registered users
   - **Change Password**: Change passwords for medical staff

### 2. Register Medical Personnel (Doctor/Nurse/Pharmacist)
1. From login page, click "Register as Medical Personnel"
2. Fill in the form:
   - Full Name
   - Role (Doctor/Nurse/Pharmacist)
   - Email
   - Phone
   - Password & Confirmation
3. Submit registration
4. You'll see message: "Registration successful. Please wait for admin approval."
5. Login as admin to approve this user
6. After approval, the medical personnel can login

### 3. Register Student/Staff
1. From login page, click "Register as Student/Staff"
2. Fill in the form:
   - Full Name
   - Role (Student or Staff)
   - **Student/Staff ID** (Required!)
   - Email
   - Phone
   - Password & Confirmation
3. Submit registration
4. You'll see message: "Registration successful. You can now login."
5. Students/Staff can login immediately (no approval needed)

### 4. Test the Workflows

#### Test Medical Personnel Approval Flow:
1. Register a doctor at `/register/medical`
2. Try to login - you'll get "pending approval" message
3. Login as admin
4. Go to "Pending Approvals" tab
5. Approve the doctor
6. Logout and login as the doctor
7. See the Doctor Dashboard

#### Test Student Registration:
1. Register a student at `/register/staff`
2. Provide student ID
3. Login immediately (no approval needed)
4. See the Student Dashboard with appointment booking features

## Dashboards Overview

### Admin Dashboard Features:
- Approve/Reject pending medical personnel
- View all system users
- Change passwords for doctors, nurses, pharmacists
- See user statistics

### Doctor Dashboard:
- Patient consultations
- Medical records access
- Prescription management
- Schedule viewing

### Nurse Dashboard:
- Patient care monitoring
- Medication administration
- Ward management
- Patient records

### Pharmacist Dashboard:
- Prescription dispensing
- Inventory management
- Drug information
- Dispensing logs

### Student/Staff Dashboard:
- Book appointments
- View appointments
- Medical history
- Prescriptions
- Health resources
- Emergency contacts

## API Testing (Optional)

You can test the API directly using tools like Postman or curl:

### Login API:
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@medical.com",
    "password": "admin123"
  }'
```

### Register Student:
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@student.com",
    "password": "password123",
    "password_confirmation": "password123",
    "role": "student",
    "staff_id": "STU2024001",
    "phone": "1234567890"
  }'
```

## Troubleshooting

### Backend Issues:
- Check if MySQL is running
- Verify database credentials in `.env`
- Run `php artisan migrate:fresh --seed` to reset database

### Frontend Issues:
- Clear browser cache
- Check browser console for errors
- Verify API URL in `src/services/api.js`

### CORS Issues:
- Laravel Sanctum is configured for localhost
- Frontend should be on http://localhost:5173
- Backend should be on http://localhost:8000

## Stop Servers

To stop the servers:
1. Press `Ctrl+C` in both terminal windows
2. Or close the terminal windows

## Next Steps

The system is ready for:
- Adding appointment booking functionality
- Implementing medical records management
- Creating prescription system
- Adding email notifications
- Implementing file uploads for medical documents

Enjoy testing your Medical Center System! 🏥
