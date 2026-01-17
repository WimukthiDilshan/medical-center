# Medical Center Management System

A comprehensive medical center management system built with Laravel (backend) and React (frontend) with role-based authentication and dashboards.

## Features

### User Roles
1. **Admin** - Full system access, user approval, password management
2. **Doctor** - Medical consultations and prescriptions
3. **Nurse** - Patient care and ward management
4. **Pharmacist** - Prescription dispensing and inventory
5. **Student/Staff** - Book appointments and access medical services

### Authentication & Authorization
- Separate registration flows for medical personnel and students/staff
- Admin approval required for doctors, nurses, and pharmacists
- Auto-approval for students and staff
- Role-based access control for all dashboards
- Secure JWT-based authentication with Laravel Sanctum

### Key Functionalities
- **Admin Dashboard**: 
  - Approve/reject pending medical personnel registrations
  - View all users
  - Change passwords for doctors, nurses, and pharmacists
  
- **Medical Personnel Dashboards**: 
  - Custom dashboards for each role
  - Access to relevant medical functions
  
- **Student/Staff Dashboard**: 
  - Book appointments
  - View medical history
  - Access prescriptions
  - Student/Staff ID tracking

## Tech Stack

### Backend (Laravel)
- Laravel 11.x
- MySQL Database
- Laravel Sanctum for API authentication
- RESTful API architecture

### Frontend (React)
- React 18.x
- React Router for navigation
- Axios for API calls
- Clean and simple UI design

## Installation

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- npm
- MySQL

### Backend Setup

1. Navigate to Laravel API directory:
```bash
cd laravel-api
```

2. Install PHP dependencies:
```bash
composer install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure database in `.env`:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=medical-center
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

5. Generate application key:
```bash
php artisan key:generate
```

6. Run migrations and seed admin user:
```bash
php artisan migrate:fresh --seed
```

7. Start Laravel development server:
```bash
php artisan serve
```

Backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to React frontend directory:
```bash
cd react-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Default Admin Credentials

```
Email: admin@medical.com
Password: admin123
```

## API Endpoints

### Public Routes
- `POST /api/register` - Register new user
- `POST /api/login` - User login

### Protected Routes
- `POST /api/logout` - Logout user
- `GET /api/me` - Get current user

### Admin Routes (Admin only)
- `GET /api/admin/pending-users` - Get pending approval users
- `POST /api/admin/approve-user/{id}` - Approve user
- `DELETE /api/admin/reject-user/{id}` - Reject user
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/change-password/{id}` - Change user password

## User Flows

### Medical Personnel Registration
1. Register at `/register/medical`
2. Select role (Doctor/Nurse/Pharmacist)
3. Wait for admin approval
4. Login after approval

### Student/Staff Registration
1. Register at `/register/staff`
2. Provide Student/Staff ID
3. Immediate access after registration
4. Login directly

### Admin Workflow
1. Login with admin credentials
2. Review pending user approvals
3. Approve or reject registrations
4. Manage user passwords
5. View all system users

## Project Structure

```
medical-center/
├── laravel-api/
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── AuthController.php
│   │   │   │   └── AdminController.php
│   │   │   └── Middleware/
│   │   │       └── RoleMiddleware.php
│   │   └── Models/
│   │       └── User.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
│       └── api.php
│
└── react-frontend/
    ├── src/
    │   ├── components/
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── RegisterStaff.jsx
    │   │   ├── RegisterMedical.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   ├── DoctorDashboard.jsx
    │   │   ├── NurseDashboard.jsx
    │   │   ├── PharmacistDashboard.jsx
    │   │   └── StudentStaffDashboard.jsx
    │   ├── services/
    │   │   ├── api.js
    │   │   ├── authService.js
    │   │   └── adminService.js
    │   └── App.jsx
    └── package.json
```

## Design Principles

- **Clean Code**: Following SOLID principles and Laravel best practices
- **Separation of Concerns**: Clear separation between business logic and presentation
- **DRY (Don't Repeat Yourself)**: Reusable components and services
- **Single Responsibility**: Each controller and component has a single purpose
- **Security**: Role-based middleware, input validation, password hashing

## Future Enhancements

- Appointment booking system
- Medical records management
- Prescription management
- Inventory tracking
- Email notifications
- Password reset functionality
- Two-factor authentication
- Patient management system
- Laboratory results integration

## License

This project is open-source and available for educational purposes.

## Support

For issues or questions, please create an issue in the project repository.
