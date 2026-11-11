import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import appointmentService from '../../services/appointmentService';
import reportService from '../../services/reportService';
import { Calendar, Users, CheckCircle, Clock, HeartPulse, ArrowRight, UserCheck } from 'lucide-react';
import Card, { StatCard } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';

export const ProfessionalDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [citasHoy, setCitasHoy] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      // Métricas de profesional
      const repRes = await reportService.getDashboardSummary();
      if (repRes.success && repRes.data) {
        setStats(repRes.data);
      }

      // Citas de hoy
      if (user?.perfil?.id_profesional) {
        const todayStr = new Date().toISOString().split('T')[0];
        const citasRes = await appointmentService.getAll({
          id_profesional: user.perfil.id_profesional,
          fecha: todayStr,
        });
        if (citasRes.success && Array.isArray(citasRes.data)) {
          setCitasHoy(citasRes.data);
        }
      }
    } catch (err) {
      console.error('Error cargando dashboard del profesional:', err);
      setError('No se pudieron obtener las métricas de atención.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Cargando panel profesional..." />;

  return (
    <div className="space-y-6">
      {/* Saludo */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/50 shadow-sm dark:shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
            Espacio de Atención Clínica
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1">
            Lic. {user?.perfil?.nombres} {user?.perfil?.apellidos}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gestión de agenda, pacientes vinculados, asistencia y planes de seguimiento terapéutico.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link to="/profesional/agenda">
            <Button size="sm" icon={Calendar}>
              Mi Agenda
            </Button>
          </Link>
          <Link to="/profesional/disponibilidad">
            <Button variant="secondary" size="sm" icon={Clock}>
              Mis Horarios
            </Button>
          </Link>
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* Tarjetas de Indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pacientes Activos"
          value={stats?.mis_pacientes_activos ?? 0}
          icon={Users}
          color="primary"
          description="En seguimiento activo"
        />
        <StatCard
          title="Citas de Hoy"
          value={stats?.mis_citas_hoy ?? citasHoy.length}
          icon={Calendar}
          color="blue"
          description="Programadas para la fecha"
        />
        <StatCard
          title="Citas Realizadas"
          value={stats?.mis_citas_realizadas ?? 0}
          icon={CheckCircle}
          color="emerald"
          description="Atenciones completadas"
        />
        <StatCard
          title="Citas Programadas"
          value={stats?.mis_citas_programadas ?? 0}
          icon={Clock}
          color="amber"
          description="Próximas en agenda"
        />
      </div>

      {/* Citas de Hoy */}
      <Card
        title="Agenda del Día de Hoy"
        subtitle="Pacientes y sesiones programadas para hoy"
        action={
          <Link to="/profesional/agenda" className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1">
            Ver Agenda Completa <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      >
        {citasHoy.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {citasHoy.map((cita) => (
              <div key={cita.id_cita} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-bold flex items-center justify-center text-xs shrink-0">
                    {new Date(cita.fecha_hora_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {cita.pac_nombres} {cita.pac_apellidos}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Cita {cita.tipo} • Espacio: {cita.espacio_nombre || 'Consultorio Asignado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge status={cita.estado} />
                  {cita.estado === 'PROGRAMADA' && (
                    <Link to="/profesional/asistencia">
                      <Button size="sm" variant="secondary">
                        Registrar Asistencia
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
            <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            No tienes citas agendadas para el día de hoy.
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProfessionalDashboard;
