import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import professionalService from '../services/professionalService';
import {
  HeartPulse,
  Calendar,
  ShieldCheck,
  Clock,
  Users,
  CheckCircle2,
  ArrowRight,
  LogIn,
  UserPlus,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Sun,
  Moon,
  Brain,
  Award,
  ChevronRight,
  Activity,
  Smile,
  Check,
} from 'lucide-react';
import Button from '../components/common/Button';

export const LandingPage = () => {
  const { user, token, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profesionales, setProfesionales] = useState([]);
  const [loadingProfs, setLoadingProfs] = useState(true);

  // Especialidades de muestra para enriquecer la presentación clínica
  const especialidadesFicticias = [
    'Psicoterapia de Adultos y Terapia Cognitivo-Conductual',
    'Psicología Clínica, Manejo del Estrés y Ansiedad',
    'Atención Psicológica Integral y Terapia Familiar',
    'Psicoterapia Infanto-Juvenil y Duelo Emocional',
    'Desarrollo Personal y Autoestima',
  ];

  useEffect(() => {
    const fetchPublicProfessionals = async () => {
      try {
        setLoadingProfs(true);
        const res = await professionalService.getPublicList();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setProfesionales(res.data);
        } else {
          // Fallback con datos demostrativos
          setProfesionales([
            {
              id_profesional: 1,
              nombres: 'Carlos Roberto',
              apellidos: 'Gómez Morales',
              correo: 'profesional@clinica.com',
              telefono: '555-0192',
            },
            {
              id_profesional: 2,
              nombres: 'María Elena',
              apellidos: 'Vásquez Soto',
              correo: 'mvasquez@clinica.com',
              telefono: '555-0144',
            },
            {
              id_profesional: 3,
              nombres: 'Alejandro',
              apellidos: 'Pérez Méndez',
              correo: 'aperez@clinica.com',
              telefono: '555-0188',
            },
          ]);
        }
      } catch (err) {
        console.error('Error cargando lista pública de profesionales:', err);
        // Fallback demostrativo
        setProfesionales([
          {
            id_profesional: 1,
            nombres: 'Carlos Roberto',
            apellidos: 'Gómez Morales',
            correo: 'profesional@clinica.com',
            telefono: '555-0192',
          },
          {
            id_profesional: 2,
            nombres: 'María Elena',
            apellidos: 'Vásquez Soto',
            correo: 'mvasquez@clinica.com',
            telefono: '555-0144',
          },
        ]);
      } finally {
        setLoadingProfs(false);
      }
    };

    fetchPublicProfessionals();
  }, []);

  // Determinar ruta del dashboard según el rol del usuario si ya está autenticado
  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.rol === 'ADMINISTRADOR') return '/admin';
    if (user.rol === 'PROFESIONAL') return '/profesional';
    return '/paciente';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* =========================================
          BARRA DE NAVEGACIÓN SUPERIOR
      ========================================= */}
      <nav className="sticky top-0 z-50 bg-white/85 dark:bg-[#0f172a]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logotipo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/25 group-hover:scale-105 transition-transform">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  PsiControl
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800/50">
                    Clínica
                  </span>
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none">
                  Gestión y Atención Psicológica
                </p>
              </div>
            </Link>

            {/* Enlaces de Navegación de Escritorio */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
              <a href="#inicio" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Inicio
              </a>
              <a href="#sobre-plataforma" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Servicios
              </a>
              <a href="#profesionales" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Psicólogos
              </a>
              <a href="#como-funciona" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                ¿Cómo funciona?
              </a>
              <a href="#contacto" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Contacto
              </a>
            </div>

            {/* Acciones de la barra */}
            <div className="flex items-center gap-3">
              {/* Botón Modo Oscuro */}
              <button
                onClick={toggleTheme}
                type="button"
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 text-slate-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
                title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {token && user ? (
                /* Usuario Autenticado */
                <div className="flex items-center gap-2">
                  <Link to={getDashboardPath()}>
                    <Button size="sm" className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-glow-teal/20" icon={ArrowRight}>
                      Mi Panel ({user.rol?.toLowerCase()})
                    </Button>
                  </Link>
                </div>
              ) : (
                /* Usuario Invitado */
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="secondary" size="sm" icon={LogIn}>
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link to="/register" className="hidden sm:inline-block">
                    <Button size="sm" className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-glow-teal/20" icon={UserPlus}>
                      Registrarse
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* =========================================
          HERO SECTION (BIENVENIDA PRINCIPAL)
      ========================================= */}
      <section id="inicio" className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Fondos con gradientes decorativos */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[650px] h-96 sm:h-[650px] bg-gradient-to-tr from-teal-500/15 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge de entrada */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-teal-500 animate-pulse" />
            <span>Plataforma Segura para Servicios Psicológicos</span>
          </div>

          {/* Título principal */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Cuidado de la Salud Mental con{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-500">
              Acompañamiento Profesional
            </span>
          </h1>

          {/* Descripción */}
          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Un espacio confidencial y estructurado diseñado para conectar pacientes con terapeutas especializados,
            gestionar solicitudes de atención, programar citas en consultorio y sostener un seguimiento terapéutico continuo.
          </p>

          {/* Botones de acción principales */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link to={token ? getDashboardPath() : '/register'}>
              <Button size="lg" className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-glow-teal px-6">
                {token ? 'Acceder a mi Cuenta' : 'Solicitar Primera Cita'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <a href="#profesionales">
              <Button variant="secondary" size="lg" className="px-6">
                Conocer a los Psicólogos
              </Button>
            </a>

            {!token && (
              <Link to="/login">
                <Button variant="ghost" size="lg" className="text-slate-700 dark:text-slate-200">
                  <LogIn className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </Button>
              </Link>
            )}
          </div>

          {/* Tarjetas de Métricas / Ventajas Rápidas */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/70 dark:border-slate-800 shadow-sm text-left">
              <ShieldCheck className="w-6 h-6 text-teal-600 dark:text-teal-400 mb-2" />
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">100% Confidencial</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Protección estricta de expediente</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/70 dark:border-slate-800 shadow-sm text-left">
              <Calendar className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2" />
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">Citas en Línea</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Elige día y hora disponible</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/70 dark:border-slate-800 shadow-sm text-left">
              <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">Profesionales</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Equipo clínico capacitado</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/70 dark:border-slate-800 shadow-sm text-left">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">Planes Continuos</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Frecuencia personalizada</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          SOBRE LA PLATAFORMA Y SERVICIOS
      ========================================= */}
      <section id="sobre-plataforma" className="py-16 sm:py-24 bg-white dark:bg-[#0f172a] border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Gestión Integral de Servicios
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              Diseñada para la comodidad del paciente y la eficacia terapéutica
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-3">
              Facilitamos cada etapa del proceso: desde la primera manifestación de interés hasta el cierre formal del seguimiento clínico.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-slate-700/50 hover:border-teal-500/40 transition-all hover:shadow-lg dark:hover:shadow-glow-teal/5">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Atención para Pacientes
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                Autoservicio para buscar psicólogos colegiados, solicitar tu primera cita, consultar tu historial de sesiones y gestionar reprogramaciones o cancelaciones justificadas con total transparencia.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-500" /> Selección según especialidad y horario
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-500" /> Notificaciones claras de citas
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-500" /> Registro de contactos de emergencia
                </li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-slate-700/50 hover:border-teal-500/40 transition-all hover:shadow-lg dark:hover:shadow-glow-teal/5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-5">
                <Brain className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Espacio de Trabajo para Profesionales
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                Herramientas avanzadas para que los psicólogos configuren su disponibilidad semanal, gestionen sus agendas diarias, registren asistencias e inasistencias y definan planes terapéuticos periódicos.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Trazabilidad de asistencia e inasistencias
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Vinculación formal paciente-profesional
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Planes semanales, quincenales o mensuales
                </li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-slate-700/50 hover:border-teal-500/40 transition-all hover:shadow-lg dark:hover:shadow-glow-teal/5">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Supervisión y Control Institucional
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                Panel central para coordinadores y administradores: monitoreo de ocupación física de consultorios clínicos, padrón general de expedientes, asignaciones administrativas y reportes estadísticos.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-500" /> Gestión de consultorios físicos y virtuales
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-500" /> Reportes analíticos de cumplimiento
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-500" /> Registro seguro de credenciales con roles
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          EQUIPO DE PSICÓLOGOS (SECCIÓN DINÁMICA)
      ========================================= */}
      <section id="profesionales" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Equipo Clínico Colegiado
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
                Conoce a Nuestros Profesionales
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">
                Terapeutas especializados y acreditados dedicados a brindarte un acompañamiento seguro, ético y personalizado.
              </p>
            </div>

            <Link to="/register">
              <Button size="sm" className="bg-primary-600 hover:bg-primary-700 text-white" icon={Calendar}>
                Agendar con un Profesional
              </Button>
            </Link>
          </div>

          {loadingProfs ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Cargando directorio de profesionales...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profesionales.map((prof, index) => {
                const especialidad = especialidadesFicticias[index % especialidadesFicticias.length];

                return (
                  <div
                    key={prof.id_profesional}
                    className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-700/50 p-6 shadow-sm hover:shadow-md dark:hover:shadow-glow-teal/5 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Avatar y Badge */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                          {prof.nombres?.charAt(0)}
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/50">
                          Disponible
                        </span>
                      </div>

                      <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        Lic. {prof.nombres} {prof.apellidos}
                      </h4>
                      <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-0.5">
                        Atención Psicológica Profesional
                      </p>

                      <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                          Áreas de Enfoque:
                        </span>
                        {especialidad}
                      </div>

                      <div className="mt-4 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                        {prof.correo && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{prof.correo}</span>
                          </div>
                        )}
                        {prof.telefono && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{prof.telefono}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-400">
                        Sesiones de 60 min
                      </span>
                      <Link to={token ? '/paciente/profesionales' : '/login'}>
                        <Button size="sm" variant="secondary" className="gap-1.5">
                          <span>Agendar Cita</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* =========================================
          CÓMO FUNCIONA EL PROCESO
      ========================================= */}
      <section id="como-funciona" className="py-16 sm:py-24 bg-white dark:bg-[#0f172a] border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Paso a Paso
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
              ¿Cómo iniciar tu proceso terapéutico?
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-2">
              Un flujo intuitivo y transparente diseñado para facilitarte el acceso al apoyo que necesitas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Paso 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 relative text-left">
              <div className="w-10 h-10 rounded-xl bg-teal-500 text-white font-extrabold flex items-center justify-center text-base mb-4 shadow-md shadow-teal-500/20">
                1
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Crea tu Cuenta
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Regístrate con tus datos personales y una contraseña segura. Tu información estará protegida bajo estrictos estándares.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 relative text-left">
              <div className="w-10 h-10 rounded-xl bg-teal-500 text-white font-extrabold flex items-center justify-center text-base mb-4 shadow-md shadow-teal-500/20">
                2
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Elige tu Terapeuta
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Revisa los perfiles profesionales, consulta los días disponibles y selecciona el horario de atención que mejor se adapte a tu rutina.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 relative text-left">
              <div className="w-10 h-10 rounded-xl bg-teal-500 text-white font-extrabold flex items-center justify-center text-base mb-4 shadow-md shadow-teal-500/20">
                3
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Asiste a tu Primera Cita
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                El sistema valida la reserva en un consultorio asignado. Acude a tu sesión inicial para comenzar el vínculo terapéutico.
              </p>
            </div>

            {/* Paso 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 relative text-left">
              <div className="w-10 h-10 rounded-xl bg-teal-500 text-white font-extrabold flex items-center justify-center text-base mb-4 shadow-md shadow-teal-500/20">
                4
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Seguimiento Personalizado
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Tu psicólogo acordará contigo una frecuencia adecuada (semanal, quincenal o mensual) para asegurar la continuidad de tu evolución.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          BANNER FINAL DE LLAMADO A LA ACCIÓN (CTA)
      ========================================= */}
      <section className="py-16 sm:py-20 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-3xl p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden text-center sm:text-left flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                Comienza Hoy Mismo
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold mt-1">
                ¿Listo para priorizar tu bienestar emocional?
              </h3>
              <p className="text-teal-100 text-sm mt-3 leading-relaxed">
                Crea tu cuenta de paciente en pocos minutos o ingresa con tus credenciales para solicitar tu primera cita con nuestros terapeutas.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-white text-teal-900 hover:bg-teal-50 font-bold shadow-lg">
                  Registrarme como Paciente
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/25">
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          PIE DE PÁGINA (FOOTER)
      ========================================= */}
      <footer id="contacto" className="bg-white dark:bg-[#0b0f19] border-t border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 py-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Columna 1: Info */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base mb-3">
                <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <span>PsiControl • Clínica de Atención Psicológica</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                Plataforma web segura para la administración y acompañamiento de servicios psicológicos.
                Proyecto académico de grado orientado a la gestión transparente, confidencial y estructurada de la atención en salud mental.
              </p>
            </div>

            {/* Columna 2: Enlaces */}
            <div>
              <h5 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3 text-[11px]">
                Navegación
              </h5>
              <ul className="space-y-2">
                <li><a href="#inicio" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Inicio</a></li>
                <li><a href="#sobre-plataforma" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Servicios Clínicos</a></li>
                <li><a href="#profesionales" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Directorio de Psicólogos</a></li>
                <li><a href="#como-funciona" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">¿Cómo Funciona?</a></li>
              </ul>
            </div>

            {/* Columna 3: Accesos de Sistema */}
            <div>
              <h5 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3 text-[11px]">
                Acceso al Sistema
              </h5>
              <ul className="space-y-2">
                <li><Link to="/login" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Ingreso a la Plataforma</Link></li>
                <li><Link to="/register" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Registro de Pacientes</Link></li>
                <li><span className="text-slate-400">Atención: Lun a Sáb 08:00 - 18:00</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400">
            <p>© {new Date().getFullYear()} PsiControl. Todos los derechos reservados.</p>
            <p className="text-[11px]">
              Tesis de Grado • Plataforma Web Segura para Gestión Administrativa de Servicios Psicológicos
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
