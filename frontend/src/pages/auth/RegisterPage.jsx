import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HeartPulse, Mail, Lock, User, Phone, Calendar, UserPlus } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

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
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-slate-100 flex items-center justify-center p-4 py-8">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-primary-600/30 mb-4">
            <HeartPulse className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Crea tu cuenta de Paciente</h2>
          <p className="text-sm text-slate-500 mt-1">Registra tus datos para solicitar atención y gestionar citas</p>
        </div>

        {error && (
          <Alert type="error" onClose={() => setError(null)} className="mb-6">
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
              placeholder="Al menos 6 caracteres"
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

          <Button type="submit" loading={loading} className="w-full mt-4" size="lg">
            <UserPlus className="w-4 h-4 mr-1" />
            Completar Registro
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            ¿Ya tienes una cuenta registrada?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
