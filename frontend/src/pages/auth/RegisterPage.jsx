import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  HeartPulse,
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  UserPlus,
  Sun,
  Moon,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  Info,
} from 'lucide-react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import PasswordRequirements from '../../components/common/PasswordRequirements';
import { validatePassword } from '../../utils/password.utils';
import { validateEmail } from '../../utils/email.utils';
import { calculateAge, isMinor } from '../../utils/date.utils';

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

  // Datos del tutor o responsable legal si el paciente es menor de edad
  const [responsableData, setResponsableData] = useState({
    nombres: '',
    apellidos: '',
    parentesco: 'Madre',
    telefono: '',
    correo: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Cálculo en tiempo real de edad y minoría de edad
  const edadCalculada = calculateAge(formData.fecha_nacimiento);
  const esMenorDeEdad = isMinor(formData.fecha_nacimiento);
  const esMayorDeEdad = edadCalculada !== null && edadCalculada >= 18;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleResponsableChange = (e) => {
    setResponsableData({ ...responsableData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // 1. Validar correo electrónico principal
    const emailValidation = validateEmail(formData.correo);
    if (!emailValidation.isValid) {
      setError(emailValidation.errorMessage);
      return;
    }

    // 2. Validar fecha de nacimiento y edad
    if (!formData.fecha_nacimiento) {
      setError('Por favor ingrese su fecha de nacimiento.');
      return;
    }
    if (edadCalculada === null || edadCalculada < 0 || edadCalculada > 120) {
      setError('La fecha de nacimiento no es válida. Por favor verifique el año.');
      return;
    }

    // 3. Validar requisitos de contraseña segura
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errorMessage);
      return;
    }

    // 4. Validar confirmación de contraseña
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    // 5. Validar tutor legal si es menor de 18 años
    if (esMenorDeEdad) {
      if (!responsableData.nombres.trim() || !responsableData.apellidos.trim()) {
        setError('Al ser menor de 18 años, es obligatorio ingresar los nombres y apellidos del padre, madre o tutor legal.');
        return;
      }
      if (!responsableData.telefono.trim()) {
        setError('Debe proporcionar el teléfono de contacto del padre, madre o tutor legal.');
        return;
      }
      if (responsableData.correo.trim()) {
        const tutorEmailVal = validateEmail(responsableData.correo);
        if (!tutorEmailVal.isValid) {
          setError(`Correo del tutor inválido: ${tutorEmailVal.errorMessage}`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      await register({
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        correo: formData.correo.trim().toLowerCase(),
        password: formData.password,
        telefono: formData.telefono,
        fecha_nacimiento: formData.fecha_nacimiento,
        responsable: esMenorDeEdad ? responsableData : null,
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
      {/* Botón volver al inicio */}
      <Link
        to="/"
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Inicio</span>
      </Link>

      {/* Botón modo oscuro en la esquina superior derecha */}
      <button
        onClick={toggleTheme}
        type="button"
        className="absolute top-6 right-6 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-amber-400 hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm"
        title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="max-w-xl w-full bg-white dark:bg-[#111827] rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-glow-teal/10 border border-slate-100 dark:border-slate-700/50 p-8 sm:p-10 transition-colors">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-teal-600/30 mb-4 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Crea tu cuenta de Paciente</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Atención psicológica para pacientes mayores y menores de edad
          </p>
        </div>

        {error && (
          <Alert type="error" onClose={() => setError(null)} autoClose={5000} className="mb-6">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombres y Apellidos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="nombres"
              label="Nombres del Paciente"
              required
              placeholder="Ej. Ana María"
              value={formData.nombres}
              onChange={handleChange}
              icon={User}
            />
            <Input
              id="apellidos"
              label="Apellidos del Paciente"
              required
              placeholder="Ej. Martínez Ruiz"
              value={formData.apellidos}
              onChange={handleChange}
              icon={User}
            />
          </div>

          {/* Correo y Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="correo"
              label="Correo Electrónico"
              type="email"
              required
              placeholder="usuario@ejemplo.com"
              value={formData.correo}
              onChange={handleChange}
              icon={Mail}
              helperText="Debe ser una dirección válida (ej. nombre@correo.com)"
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

          {/* Fecha de Nacimiento con cálculo de edad */}
          <div>
            <Input
              id="fecha_nacimiento"
              label="Fecha de Nacimiento"
              type="date"
              required
              value={formData.fecha_nacimiento}
              onChange={handleChange}
              icon={Calendar}
            />

            {/* Indicador de Mayor o Menor de Edad */}
            {formData.fecha_nacimiento && edadCalculada !== null && (
              <div className="mt-2.5">
                {esMenorDeEdad ? (
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 flex items-start gap-3 text-xs leading-relaxed">
                    <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-800 dark:text-amber-300">
                        Paciente Menor de Edad ({edadCalculada} {edadCalculada === 1 ? 'año' : 'años'})
                      </p>
                      <p className="mt-0.5 text-amber-700 dark:text-amber-300/90">
                        Por normativa ética y legal en salud mental, los pacientes menores de 18 años requieren registrar los datos de un padre, madre o tutor legal responsable.
                      </p>
                    </div>
                  </div>
                ) : esMayorDeEdad ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>
                      Paciente Mayor de Edad (<strong>{edadCalculada} años</strong>) • Registro directo
                    </span>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* ========================================================
              SECCIÓN TUTOR / RESPONSABLE LEGAL (Si es menor de edad)
          ======================================================== */}
          {esMenorDeEdad && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#0f172a] border border-amber-200/80 dark:border-amber-800/50 space-y-3.5 transition-all">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                  !
                </span>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Datos del Padre, Madre o Tutor Legal Responsable
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  id="nombres"
                  label="Nombres del Tutor"
                  required
                  placeholder="Ej. Carlos Roberto"
                  value={responsableData.nombres}
                  onChange={handleResponsableChange}
                  icon={User}
                />
                <Input
                  id="apellidos"
                  label="Apellidos del Tutor"
                  required
                  placeholder="Ej. Martínez Gómez"
                  value={responsableData.apellidos}
                  onChange={handleResponsableChange}
                  icon={User}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  id="parentesco"
                  label="Parentesco o Relación"
                  required
                  placeholder=""
                  value={responsableData.parentesco}
                  onChange={handleResponsableChange}
                  options={[
                    { value: 'Madre', label: 'Madre' },
                    { value: 'Padre', label: 'Padre' },
                    { value: 'Tutor Legal', label: 'Tutor / Representante Legal' },
                    { value: 'Abuelo/a', label: 'Abuelo / Abuela' },
                    { value: 'Tío/a', label: 'Tío / Tía' },
                    { value: 'Hermano/a Mayor', label: 'Hermano(a) Mayor de Edad' },
                    { value: 'Otro', label: 'Otro Responsable' },
                  ]}
                />
                <Input
                  id="telefono"
                  label="Teléfono del Tutor"
                  required
                  placeholder="Ej. 555-9876"
                  value={responsableData.telefono}
                  onChange={handleResponsableChange}
                  icon={Phone}
                />
              </div>

              <Input
                id="correo"
                label="Correo Electrónico del Tutor (Opcional)"
                type="email"
                placeholder="tutor@ejemplo.com"
                value={responsableData.correo}
                onChange={handleResponsableChange}
                icon={Mail}
                helperText="Para envío de copias de confirmaciones y consentimientos"
              />
            </div>
          )}

          {/* Contraseñas */}
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
