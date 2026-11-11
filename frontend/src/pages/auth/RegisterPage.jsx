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
  ShieldCheck,
  ShieldAlert,
  Users,
  Baby,
  CheckCircle2,
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
  // Tipo de registro: 'MAYOR' o 'MENOR'
  const [tipoRegistro, setTipoRegistro] = useState('MAYOR');

  // Formulario para Paciente Mayor de Edad
  const [adultData, setAdultData] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    fecha_nacimiento: '',
    password: '',
    confirmPassword: '',
  });

  // Formulario para Paciente Menor de Edad (registrado por Tutor)
  const [minorData, setMinorData] = useState({
    // Datos del Menor (el paciente a atender)
    menor_nombres: '',
    menor_apellidos: '',
    menor_fecha_nacimiento: '',
    // Datos del Tutor Legal (titular de la cuenta y contacto)
    tutor_nombres: '',
    tutor_apellidos: '',
    tutor_parentesco: 'Madre',
    tutor_telefono: '',
    tutor_correo: '',
    // Contraseña creada por el tutor
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Cálculos en tiempo real
  const adultAge = calculateAge(adultData.fecha_nacimiento);
  const minorAge = calculateAge(minorData.menor_fecha_nacimiento);

  const handleAdultChange = (e) => {
    setAdultData({ ...adultData, [e.target.id]: e.target.value });
  };

  const handleMinorChange = (e) => {
    setMinorData({ ...minorData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (tipoRegistro === 'MAYOR') {
      // ----------------------------------------------------
      // VALIDACIONES PARA MAYOR DE EDAD
      // ----------------------------------------------------
      const emailVal = validateEmail(adultData.correo);
      if (!emailVal.isValid) {
        setError(emailVal.errorMessage);
        return;
      }

      if (!adultData.fecha_nacimiento) {
        setError('Por favor ingrese su fecha de nacimiento.');
        return;
      }

      if (adultAge === null || adultAge < 0 || adultAge > 120) {
        setError('La fecha de nacimiento no es válida. Verifique el año.');
        return;
      }

      if (adultAge < 18) {
        setError(
          `La fecha ingresada corresponde a un menor de 18 años (${adultAge} años). Por favor seleccione la opción 'Padre / Madre / Tutor de un Menor de Edad' para registrar los datos del tutor legal.`
        );
        return;
      }

      const passVal = validatePassword(adultData.password);
      if (!passVal.isValid) {
        setError(passVal.errorMessage);
        return;
      }

      if (adultData.password !== adultData.confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }

      setLoading(true);
      try {
        await register({
          es_menor_edad: false,
          nombres: adultData.nombres.trim(),
          apellidos: adultData.apellidos.trim(),
          fecha_nacimiento: adultData.fecha_nacimiento,
          telefono: adultData.telefono.trim() || null,
          correo: adultData.correo.trim().toLowerCase(),
          password: adultData.password,
        });
        navigate('/paciente');
      } catch (err) {
        setError(err.message || 'Error al registrar la cuenta. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    } else {
      // ----------------------------------------------------
      // VALIDACIONES PARA MENOR DE EDAD
      // ----------------------------------------------------
      if (!minorData.menor_nombres.trim() || !minorData.menor_apellidos.trim()) {
        setError('Por favor ingrese los nombres y apellidos completos del menor de edad.');
        return;
      }

      if (!minorData.menor_fecha_nacimiento) {
        setError('Por favor ingrese la fecha de nacimiento del menor de edad.');
        return;
      }

      if (minorAge === null || minorAge < 0 || minorAge > 120) {
        setError('La fecha de nacimiento del menor no es válida.');
        return;
      }

      if (minorAge >= 18) {
        setError(
          `La fecha de nacimiento ingresada corresponde a una persona mayor de edad (${minorAge} años). Si el paciente tiene 18 años o más, seleccione la opción 'Soy un Paciente Mayor de Edad'.`
        );
        return;
      }

      if (!minorData.tutor_nombres.trim() || !minorData.tutor_apellidos.trim()) {
        setError('Por favor ingrese los nombres y apellidos del padre, madre o tutor legal responsable.');
        return;
      }

      if (!minorData.tutor_telefono.trim()) {
        setError('Debe proporcionar el número de teléfono o celular del tutor legal.');
        return;
      }

      const tutorEmailVal = validateEmail(minorData.tutor_correo);
      if (!tutorEmailVal.isValid) {
        setError(`Correo del tutor inválido: ${tutorEmailVal.errorMessage}`);
        return;
      }

      const passVal = validatePassword(minorData.password);
      if (!passVal.isValid) {
        setError(passVal.errorMessage);
        return;
      }

      if (minorData.password !== minorData.confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }

      setLoading(true);
      try {
        await register({
          es_menor_edad: true,
          // Datos del paciente atendido (el menor)
          nombres: minorData.menor_nombres.trim(),
          apellidos: minorData.menor_apellidos.trim(),
          fecha_nacimiento: minorData.menor_fecha_nacimiento,
          // Datos de contacto y credenciales de la cuenta (el tutor)
          telefono: minorData.tutor_telefono.trim(),
          correo: minorData.tutor_correo.trim().toLowerCase(),
          password: minorData.password,
          responsable: {
            nombres: minorData.tutor_nombres.trim(),
            apellidos: minorData.tutor_apellidos.trim(),
            parentesco: minorData.tutor_parentesco,
            telefono: minorData.tutor_telefono.trim(),
            correo: minorData.tutor_correo.trim().toLowerCase(),
          },
        });
        navigate('/paciente');
      } catch (err) {
        setError(err.message || 'Error al registrar la cuenta. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
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

      <div className="max-w-2xl w-full bg-white dark:bg-[#111827] rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-glow-teal/10 border border-slate-100 dark:border-slate-700/50 p-6 sm:p-10 transition-colors">
        {/* Encabezado */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-teal-600/30 mb-3 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Registro de Paciente
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Plataforma de atención psicológica para pacientes adultos y menores de edad
          </p>
        </div>

        {/* ========================================================
            SELECTOR DE TIPO DE PACIENTE: MAYOR O MENOR DE EDAD
        ======================================================== */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 text-center">
            ¿Quién recibirá la atención psicológica?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Opción A: Paciente Mayor de Edad */}
            <button
              type="button"
              onClick={() => {
                setTipoRegistro('MAYOR');
                setError(null);
              }}
              className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                tipoRegistro === 'MAYOR'
                  ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 shadow-sm ring-2 ring-teal-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  tipoRegistro === 'MAYOR'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  Mayor de Edad
                  {tipoRegistro === 'MAYOR' && <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  Tengo 18 años o más y registraré mi propia cuenta personal.
                </p>
              </div>
            </button>

            {/* Opción B: Menor de Edad (registrado por Tutor) */}
            <button
              type="button"
              onClick={() => {
                setTipoRegistro('MENOR');
                setError(null);
              }}
              className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                tipoRegistro === 'MENOR'
                  ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 shadow-sm ring-2 ring-teal-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  tipoRegistro === 'MENOR'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  Menor de Edad
                  {tipoRegistro === 'MENOR' && <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  Soy el padre, madre o tutor legal y registraré a un menor a mi cargo.
                </p>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <Alert type="error" onClose={() => setError(null)} autoClose={6000} className="mb-6">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ========================================================
              CASO 1: FORMULARIO PACIENTE MAYOR DE EDAD
          ======================================================== */}
          {tipoRegistro === 'MAYOR' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="nombres"
                  label="Tus Nombres"
                  required
                  placeholder="Ej. Ana María"
                  value={adultData.nombres}
                  onChange={handleAdultChange}
                  icon={User}
                />
                <Input
                  id="apellidos"
                  label="Tus Apellidos"
                  required
                  placeholder="Ej. Martínez Ruiz"
                  value={adultData.apellidos}
                  onChange={handleAdultChange}
                  icon={User}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    id="fecha_nacimiento"
                    label="Fecha de Nacimiento"
                    type="date"
                    required
                    value={adultData.fecha_nacimiento}
                    onChange={handleAdultChange}
                    icon={Calendar}
                  />
                  {adultData.fecha_nacimiento && adultAge !== null && (
                    <p className="mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Edad calculada: {adultAge} años {adultAge >= 18 ? '✓ (Mayor de edad)' : '⚠️ (Menor de 18 años)'}
                    </p>
                  )}
                </div>

                <Input
                  id="telefono"
                  label="Teléfono / Celular"
                  placeholder="Ej. 555-1234"
                  value={adultData.telefono}
                  onChange={handleAdultChange}
                  icon={Phone}
                />
              </div>

              <Input
                id="correo"
                label="Tu Correo Electrónico"
                type="email"
                required
                placeholder="tu.correo@ejemplo.com"
                value={adultData.correo}
                onChange={handleAdultChange}
                icon={Mail}
                helperText="Se utilizará para iniciar sesión y recibir notificaciones"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="password"
                  label="Contraseña"
                  type="password"
                  required
                  placeholder="Mín. 8 caracteres, mayús, núm, símb"
                  value={adultData.password}
                  onChange={handleAdultChange}
                  icon={Lock}
                />
                <Input
                  id="confirmPassword"
                  label="Confirmar Contraseña"
                  type="password"
                  required
                  placeholder="Repite tu contraseña"
                  value={adultData.confirmPassword}
                  onChange={handleAdultChange}
                  icon={Lock}
                />
              </div>

              <PasswordRequirements password={adultData.password} />
            </div>
          )}

          {/* ========================================================
              CASO 2: FORMULARIO PACIENTE MENOR DE EDAD (TUTOR LEGAL)
          ======================================================== */}
          {tipoRegistro === 'MENOR' && (
            <div className="space-y-5">
              {/* Nota explicativa de registro de menor */}
              <div className="p-3.5 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-bold text-teal-800 dark:text-teal-300">
                    Atención psicológica a menores de edad:
                  </p>
                  <p className="mt-0.5 text-teal-700 dark:text-teal-300/90">
                    El expediente clínico se creará a nombre del menor, pero los datos de acceso (correo, celular y contraseña) pertenecerán al padre, madre o tutor legal responsable.
                  </p>
                </div>
              </div>

              {/* SECCIÓN 1: DATOS DEL MENOR DE EDAD */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  <Baby className="w-4 h-4" />
                  <span>1. Datos del Paciente (Menor de Edad a Ser Atendido)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    id="menor_nombres"
                    label="Nombres del Menor"
                    required
                    placeholder="Ej. Juan Daniel"
                    value={minorData.menor_nombres}
                    onChange={handleMinorChange}
                    icon={User}
                  />
                  <Input
                    id="menor_apellidos"
                    label="Apellidos del Menor"
                    required
                    placeholder="Ej. López Gómez"
                    value={minorData.menor_apellidos}
                    onChange={handleMinorChange}
                    icon={User}
                  />
                </div>

                <div>
                  <Input
                    id="menor_fecha_nacimiento"
                    label="Fecha de Nacimiento del Menor"
                    type="date"
                    required
                    value={minorData.menor_fecha_nacimiento}
                    onChange={handleMinorChange}
                    icon={Calendar}
                  />
                  {minorData.menor_fecha_nacimiento && minorAge !== null && (
                    <p className="mt-1 text-[11px] font-semibold text-teal-700 dark:text-teal-400">
                      Edad del paciente: {minorAge} {minorAge === 1 ? 'año' : 'años'}{' '}
                      {minorAge < 18 ? '✓ (Menor de edad)' : '⚠️ (Es mayor de 18 años)'}
                    </p>
                  )}
                </div>
              </div>

              {/* SECCIÓN 2: DATOS DEL PADRE, MADRE O TUTOR LEGAL */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>2. Datos del Padre, Madre o Tutor Legal (Titular de la Cuenta)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    id="tutor_nombres"
                    label="Tus Nombres (Tutor)"
                    required
                    placeholder="Ej. Carmen Elena"
                    value={minorData.tutor_nombres}
                    onChange={handleMinorChange}
                    icon={User}
                  />
                  <Input
                    id="tutor_apellidos"
                    label="Tus Apellidos (Tutor)"
                    required
                    placeholder="Ej. Gómez de López"
                    value={minorData.tutor_apellidos}
                    onChange={handleMinorChange}
                    icon={User}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select
                    id="tutor_parentesco"
                    label="Parentesco o Relación con el Menor"
                    required
                    placeholder=""
                    value={minorData.tutor_parentesco}
                    onChange={handleMinorChange}
                    options={[
                      { value: 'Madre', label: 'Madre' },
                      { value: 'Padre', label: 'Padre' },
                      { value: 'Tutor Legal', label: 'Tutor(a) / Representante Legal' },
                      { value: 'Abuelo/a', label: 'Abuelo / Abuela' },
                      { value: 'Tío/a', label: 'Tío / Tía' },
                      { value: 'Hermano/a Mayor', label: 'Hermano(a) Mayor de Edad' },
                      { value: 'Otro', label: 'Otro Familiar Responsable' },
                    ]}
                  />
                  <Input
                    id="tutor_telefono"
                    label="Teléfono / Celular del Tutor"
                    required
                    placeholder="Ej. 555-9876"
                    value={minorData.tutor_telefono}
                    onChange={handleMinorChange}
                    icon={Phone}
                    helperText="Número para confirmaciones y contacto clínico"
                  />
                </div>

                <Input
                  id="tutor_correo"
                  label="Correo Electrónico del Tutor (Para Iniciar Sesión)"
                  type="email"
                  required
                  placeholder="tutor@ejemplo.com"
                  value={minorData.tutor_correo}
                  onChange={handleMinorChange}
                  icon={Mail}
                  helperText="Este será el correo para ingresar a la plataforma y recibir citas"
                />
              </div>

              {/* SECCIÓN 3: CONTRASEÑA DE LA CUENTA */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="password"
                    label="Contraseña de la Cuenta"
                    type="password"
                    required
                    placeholder="Mín. 8 caracteres, mayús, núm, símb"
                    value={minorData.password}
                    onChange={handleMinorChange}
                    icon={Lock}
                  />
                  <Input
                    id="confirmPassword"
                    label="Confirmar Contraseña"
                    type="password"
                    required
                    placeholder="Repite la contraseña"
                    value={minorData.confirmPassword}
                    onChange={handleMinorChange}
                    icon={Lock}
                  />
                </div>

                <PasswordRequirements password={minorData.password} />
              </div>
            </div>
          )}

          {/* Botón enviar */}
          <Button type="submit" loading={loading} className="w-full mt-4" size="lg">
            <UserPlus className="w-4 h-4 mr-1.5" />
            {tipoRegistro === 'MAYOR' ? 'Completar Registro' : 'Registrar Menor con Tutor'}
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
