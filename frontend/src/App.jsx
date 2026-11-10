import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientProfessionals from './pages/patient/PatientProfessionals';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientRequest from './pages/patient/PatientRequest';
import PatientProfile from './pages/patient/PatientProfile';

// Professional Pages
import ProfessionalDashboard from './pages/professional/ProfessionalDashboard';
import ProfessionalAgenda from './pages/professional/ProfessionalAgenda';
import ProfessionalPatients from './pages/professional/ProfessionalPatients';
import ProfessionalAvailability from './pages/professional/ProfessionalAvailability';
import ProfessionalFollowUp from './pages/professional/ProfessionalFollowUp';
import ProfessionalAttendance from './pages/professional/ProfessionalAttendance';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProfessionals from './pages/admin/AdminProfessionals';
import AdminPatients from './pages/admin/AdminPatients';
import AdminSpaces from './pages/admin/AdminSpaces';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminReports from './pages/admin/AdminReports';

const RootRedirect = () => {
  const { user, token } = useAuth();
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  if (user.rol === 'ADMINISTRADOR') return <Navigate to="/admin" replace />;
  if (user.rol === 'PROFESIONAL') return <Navigate to="/profesional" replace />;
  return <Navigate to="/paciente" replace />;
};

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Módulo Paciente */}
          <Route element={<ProtectedRoute allowedRoles={['PACIENTE']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/paciente" element={<PatientDashboard />} />
              <Route path="/paciente/profesionales" element={<PatientProfessionals />} />
              <Route path="/paciente/citas" element={<PatientAppointments />} />
              <Route path="/paciente/solicitud" element={<PatientRequest />} />
              <Route path="/paciente/perfil" element={<PatientProfile />} />
            </Route>
          </Route>

          {/* Módulo Profesional */}
          <Route element={<ProtectedRoute allowedRoles={['PROFESIONAL']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/profesional" element={<ProfessionalDashboard />} />
              <Route path="/profesional/agenda" element={<ProfessionalAgenda />} />
              <Route path="/profesional/pacientes" element={<ProfessionalPatients />} />
              <Route path="/profesional/disponibilidad" element={<ProfessionalAvailability />} />
              <Route path="/profesional/seguimiento" element={<ProfessionalFollowUp />} />
              <Route path="/profesional/asistencia" element={<ProfessionalAttendance />} />
            </Route>
          </Route>

          {/* Módulo Administrador */}
          <Route element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/usuarios" element={<AdminUsers />} />
              <Route path="/admin/profesionales" element={<AdminProfessionals />} />
              <Route path="/admin/pacientes" element={<AdminPatients />} />
              <Route path="/admin/citas" element={<AdminAppointments />} />
              <Route path="/admin/espacios" element={<AdminSpaces />} />
              <Route path="/admin/reportes" element={<AdminReports />} />
            </Route>
          </Route>

          {/* Ruta no encontrada */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
  );
};

export default App;
