import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Clock,
  ClipboardList,
  CheckCircle,
  Building2,
  BarChart3,
  UserCheck,
  LogOut,
  Menu,
  X,
  HeartPulse,
  User,
  Search,
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    switch (user?.rol) {
      case 'PACIENTE':
        return [
          { to: '/paciente', label: 'Mi Inicio', icon: LayoutDashboard },
          { to: '/paciente/profesionales', label: 'Profesionales y Citas', icon: Search },
          { to: '/paciente/citas', label: 'Mis Citas', icon: Calendar },
          { to: '/paciente/solicitud', label: 'Solicitud de Atención', icon: ClipboardList },
          { to: '/paciente/perfil', label: 'Mi Perfil', icon: User },
        ];
      case 'PROFESIONAL':
        return [
          { to: '/profesional', label: 'Mi Panel', icon: LayoutDashboard },
          { to: '/profesional/agenda', label: 'Mi Agenda', icon: Calendar },
          { to: '/profesional/pacientes', label: 'Mis Pacientes', icon: Users },
          { to: '/profesional/disponibilidad', label: 'Mi Disponibilidad', icon: Clock },
          { to: '/profesional/seguimiento', label: 'Planes de Seguimiento', icon: ClipboardList },
          { to: '/profesional/asistencia', label: 'Registro de Asistencias', icon: CheckCircle },
        ];
      case 'ADMINISTRADOR':
        return [
          { to: '/admin', label: 'Dashboard Global', icon: LayoutDashboard },
          { to: '/admin/usuarios', label: 'Usuarios', icon: UserCheck },
          { to: '/admin/profesionales', label: 'Profesionales', icon: HeartPulse },
          { to: '/admin/pacientes', label: 'Pacientes', icon: Users },
          { to: '/admin/citas', label: 'Todas las Citas', icon: Calendar },
          { to: '/admin/espacios', label: 'Espacios y Salas', icon: Building2 },
          { to: '/admin/reportes', label: 'Reportes e Indicadores', icon: BarChart3 },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ADMINISTRADOR':
        return 'Administrador';
      case 'PROFESIONAL':
        return 'Profesional de Salud';
      case 'PACIENTE':
        return 'Paciente';
      default:
        return role;
    }
  };

  const getUserDisplayName = () => {
    if (user?.perfil) {
      return `${user.perfil.nombres} ${user.perfil.apellidos}`;
    }
    return user?.correo?.split('@')[0] || 'Usuario';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 leading-tight">PsicoGestión</h1>
            <p className="text-[10px] text-slate-400 font-medium">Servicios Psicológicos</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Menú Principal
          </p>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/paciente' || item.to === '/profesional' || item.to === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs">
              {getUserDisplayName().charAt(0)}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-slate-800 truncate">{getUserDisplayName()}</p>
              <p className="text-[11px] text-slate-400 truncate">{getRoleLabel(user?.rol)}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex flex-col w-72 bg-white h-full shadow-2xl z-10">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-slate-800">PsicoGestión</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/paciente' || item.to === '/profesional' || item.to === '/admin'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              {getRoleLabel(user?.rol)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{getUserDisplayName()}</p>
              <p className="text-[11px] text-slate-400">{user?.correo}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              {getUserDisplayName().charAt(0)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
