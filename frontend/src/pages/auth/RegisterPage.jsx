import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { HeartPulse, Mail, Lock, User, Phone, Calendar, UserPlus, Sun, Moon } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import PasswordRequirements from '../../components/common/PasswordRequirements';
import { validatePassword } from '../../utils/password.utils';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    fecha_nacimiento: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errorMessage);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await register({
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        correo: formData.correo,
        password: formData.password,
        telefono: formData.telefono,
        fecha_nacimiento: formData.fecha_nacimiento || null,
      });
      navigate('/paciente');
    } catch (err) {
      setError(err.message || 'Error al registrar la cuenta. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 py-8 relative transition-colors duration-200">
      {/* Botón modo oscuro en la esquina superior derecha */}
      <button
        onClick={toggleTheme}
        type="button"
        className="absolute top-6 right-6 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-amber-400 hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm"
        title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 sm:p-10 transition-colors">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-primary-600/30 mb-4">
            <HeartPulse className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Crea tu cuenta de Paciente</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Registra tus datos para solicitar atención y gestionar citas</p>
        </div>

        {error && (
          <Alert type="error" onClose={() => setError(null)} autoClose={5000} className="mb-6">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="nombres"
              label="Nombres"
              required
              placeholder="Ej. Ana María"
              value={formData.nombres}
              onChange={handleChange}
              icon={User}
            />
            <Input
              id="apellidos"
              label="Apellidos"
              required
              placeholder="Ej. Martínez Ruiz"
              value={formData.apellidos}
              onChange={handleChange}
              icon={User}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="correo"
              label="Correo Electrónico"
              type="email"
              required
              placeholder="ana.martinez@ejemplo.com"
              value={formData.correo}
              onChange={handleChange}
              icon={Mail}
            />
            <Input
              id="telefono"
              label="Teléfono / Celular"
              placeholder="Ej. 555-1234"
              value={formData.telefono}
              onChange={handleChange}
              icon={Phone}
            />
          </div>

          <Input
            id="fecha_nacimiento"
            label="Fecha de Nacimiento"
            type="date"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            icon={Calendar}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="password"
              label="Contraseña"
              type="password"
              required
              placeholder="Mín. 8 caracteres, mayús, núm, símb"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
            />
            <Input
              id="confirmPassword"
              label="Confirmar Contraseña"
              type="password"
              required
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              icon={Lock}
            />
          </div>

          <PasswordRequirements password={formData.password} />

          <Button type="submit" loading={loading} className="w-full mt-4" size="lg">
            <UserPlus className="w-4 h-4 mr-1" />
            Completar Registro
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ¿Ya tienes una cuenta registrada?{' '}
            <Link to="/login" className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
