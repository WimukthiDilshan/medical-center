import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import RegisterStaff from './pages/RegisterStaff';
import RegisterMedical from './pages/RegisterMedical';
import AdminDashboard from './pages/AdminDashboard';
import AdminMedicalCertificates from './pages/admin/AdminMedicalCertificates';
import ChangePassword from './pages/admin/ChangePassword';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import MedicalCertificatesDoctor from './pages/doctor/MedicalCertificates';
import NurseDashboard from './pages/nurse/NurseDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';
import StudentStaffDashboard from './pages/StudentStaffDashboard';
import PatientAppointments from './pages/patient/PatientAppointments';
import MedicalRequest from './pages/MedicalRequest';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/staff" element={<RegisterStaff />} />
        <Route path="/register/medical" element={<RegisterMedical />} />
        
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/medical-certificates"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminMedicalCertificates />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/change-password"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ChangePassword />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dashboard/doctor"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/doctor/medical-certificates"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <MedicalCertificatesDoctor />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dashboard/nurse"
          element={
            <ProtectedRoute allowedRoles={['nurse']}>
              <NurseDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dashboard/pharmacist"
          element={
            <ProtectedRoute allowedRoles={['pharmacist']}>
              <PharmacistDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dashboard/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentStaffDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dashboard/staff"
          element={
            <ProtectedRoute allowedRoles={['staff']}>
              <StudentStaffDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointments"
          element={
            <ProtectedRoute allowedRoles={['student', 'staff']}>
              <PatientAppointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/medical-certificate"
          element={
            <ProtectedRoute allowedRoles={['student', 'staff']}>
              <MedicalRequest />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
