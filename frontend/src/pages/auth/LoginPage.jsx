import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { HeartPulse, Mail, Lock, LogIn, Sun, Moon } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

export const LoginPage = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const usuario = await login(correo, password);
      if (usuario.rol === 'ADMINISTRADOR') {
        navigate('/admin');
      } else if (usuario.rol === 'PROFESIONAL') {
        navigate('/profesional');
      } else {
        navigate('/paciente');
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Verifique sus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setCorreo(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 relative transition-colors duration-200">
      {/* Botón modo oscuro en la esquina superior derecha */}
      <button
        onClick={toggleTheme}
        type="button"
        className="absolute top-6 right-6 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-amber-400 hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm"
        title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="max-w-md w-full bg-white dark:bg-[#111827] rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-glow-teal/10 border border-slate-100 dark:border-slate-700/50 p-8 sm:p-10 transition-colors">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-teal-600/30 mb-4">
            <HeartPulse className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Bienvenido de nuevo</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Plataforma de Gestión de Servicios Psicológicos</p>
        </div>

        {error && (
          <Alert type="error" onClose={() => setError(null)} autoClose={5000} className="mb-6">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="correo"
            label="Correo Electrónico"
            type="email"
            required
            placeholder="usuario@ejemplo.com"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            icon={Mail}
          />

          <Input
            id="password"
            label="Contraseña"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
          />

          <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
            <LogIn className="w-4 h-4 mr-1" />
            Iniciar Sesión
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ¿No tienes una cuenta de paciente?{' '}
            <Link to="/register" className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700">
              Regístrate aquí
            </Link>
          </p>
        </div>

        {/* Cuentas de demostración rápida */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 text-center">
            Acceso Rápido para Pruebas (Demo)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@clinica.com', 'Admin123*')}
              className="text-[11px] font-medium py-1.5 px-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('profesional@clinica.com', 'Profe123*')}
              className="text-[11px] font-medium py-1.5 px-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              Profesional
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('paciente@gmail.com', 'Paciente123*')}
              className="text-[11px] font-medium py-1.5 px-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              Paciente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
