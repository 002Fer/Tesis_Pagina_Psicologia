import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import appointmentService from '../../services/appointmentService';
import patientService from '../../services/patientService';
import { Calendar, User, Clock, ArrowRight, HeartPulse, ClipboardList, CheckCircle2 } from 'lucide-react';
import Card, { StatCard } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { formatDateUTC, formatTimeUTC } from '../../utils/date.utils';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pacienteDetalle, setPacienteDetalle] = useState(null);
  const [proximaCita, setProximaCita] = useState(null);
  const [totalCitas, setTotalCitas] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        if (user?.perfil?.id_paciente) {
          // Obtener detalle del paciente (vinculación, responsables, estado)
          const pacRes = await patientService.getById(user.perfil.id_paciente);
          if (pacRes.success) {
            setPacienteDetalle(pacRes.data);
          }

          // Obtener citas del paciente
          const citasRes = await appointmentService.getAll(
            user?.perfil?.id_paciente ? { id_paciente: user.perfil.id_paciente } : {}
          );
          if (citasRes.success && Array.isArray(citasRes.data)) {
            setTotalCitas(citasRes.data.length);
            const now = new Date();
            const proximas = citasRes.data
              .filter((c) => new Date(c.fecha_hora_inicio) >= now && c.estado === 'PROGRAMADA')
              .sort((a, b) => new Date(a.fecha_hora_inicio) - new Date(b.fecha_hora_inicio));

            if (proximas.length > 0) {
              setProximaCita(proximas[0]);
            }
          }
        }
      } catch (err) {
        console.error('Error cargando dashboard del paciente:', err);
        setError('No se pudo cargar la información del paciente.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) return <Loader message="Cargando tu información..." />;

  const vinculo = pacienteDetalle?.vinculacion_actual;

  return (
    <div className="space-y-6">
      {/* Banner de Bienvenida */}
      <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-primary-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">
              Portal del Paciente
            </span>
            <Badge status={pacienteDetalle?.estado || 'ACTIVO'} className="bg-white/90" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">
            Hola, {user?.perfil?.nombres || 'Paciente'}
          </h2>
          <p className="text-primary-100 text-sm mt-1 max-w-xl">
            Gestiona tus citas de atención psicológica, consulta a tus profesionales y realiza el seguimiento administrativo de tu tratamiento.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/paciente/profesionales">
            <Button variant="secondary" className="bg-white text-primary-700 hover:bg-primary-50 border-0 font-semibold shadow-md">
              Agendar Cita
            </Button>
          </Link>
          <Link to="/paciente/solicitud">
            <Button variant="ghost" className="text-white hover:bg-white/10 border border-white/20">
              Solicitud de Atención
            </Button>
          </Link>
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* Métricas / Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Estado del Proceso"
          value={pacienteDetalle?.estado || 'SOLICITANTE'}
          icon={CheckCircle2}
          color="emerald"
          description="Fase administrativa actual"
        />
        <StatCard
          title="Total de Citas"
          value={totalCitas}
          icon={Calendar}
          color="blue"
          description="Histórico de atenciones agendadas"
        />
        <StatCard
          title="Profesional Asignado"
          value={vinculo ? `${vinculo.prof_nombres}` : 'Por vincular'}
          icon={HeartPulse}
          color="purple"
          description={vinculo ? `${vinculo.prof_apellidos}` : 'Selecciona una cita inicial'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próxima Cita */}
        <div className="lg:col-span-2">
          <Card
            title="Próxima Cita Programada"
            subtitle="Detalles de tu siguiente sesión de atención"
            action={
              <Link to="/paciente/citas" className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                Ver todas <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {proximaCita ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl bg-primary-50/50 border border-primary-100 gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-primary-600/20">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-base capitalize">
                        {formatDateUTC(proximaCita.fecha_hora_inicio, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      <Badge status={proximaCita.estado} />
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary-600" />
                      {formatTimeUTC(proximaCita.fecha_hora_inicio)} - {formatTimeUTC(proximaCita.fecha_hora_fin)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Atendido por: <strong className="text-slate-700">{proximaCita.prof_nombres} {proximaCita.prof_apellidos}</strong>
                      {proximaCita.espacio_nombre && ` • ${proximaCita.espacio_nombre}`}
                    </p>
                  </div>
                </div>

                <Link to="/paciente/citas">
                  <Button size="sm" variant="secondary">
                    Gestionar Cita
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                  <Calendar className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-700">No tienes citas próximas agendadas</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Selecciona a uno de nuestros profesionales de atención psicológica y reserva un horario disponible.
                </p>
                <Link to="/paciente/profesionales">
                  <Button size="sm" className="mt-4">
                    Explorar Profesionales y Horarios
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Profesional y Seguimiento */}
        <div>
          <Card title="Tu Profesional" subtitle="Seguimiento de tu caso">
            {vinculo ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-sm">
                    {vinculo.prof_nombres?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      {vinculo.prof_nombres} {vinculo.prof_apellidos}
                    </h4>
                    <p className="text-[11px] text-slate-400">Atención Psicológica</p>
                  </div>
                </div>

                <div className="text-xs space-y-2 text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vinculación:</span>
                    <span className="font-medium text-emerald-600">Activa</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Desde:</span>
                    <span className="font-medium">{new Date(vinculo.fecha_inicio).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>

                <Link to="/paciente/profesionales" className="block">
                  <Button variant="secondary" size="sm" className="w-full">
                    Consultar Disponibilidad
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-slate-500">
                  Aún no estás formalmente vinculado a un profesional. Tu vinculación se establecerá tras tu primera atención.
                </p>
                <Link to="/paciente/profesionales">
                  <Button variant="secondary" size="sm" className="mt-3 w-full">
                    Buscar Profesional
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
