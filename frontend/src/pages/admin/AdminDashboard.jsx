import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import reportService from '../../services/reportService';
import { Users, HeartPulse, Calendar, Building2, CheckCircle2, XCircle, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import Card, { StatCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await reportService.getDashboardSummary();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error cargando métricas:', err);
      setError('No se pudieron cargar los indicadores del dashboard.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Cargando panel de administración global..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-primary-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary-500/20 text-primary-300 border border-primary-500/30">
              Coordinación General
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">Panel de Administración y Control</h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl dark:text-slate-400">
            Supervisión global de servicios psicológicos: gestión de terapeutas, pacientes, espacios clínicos y citas.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link to="/admin/profesionales">
            <Button size="sm" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold">
              Nuevo Profesional
            </Button>
          </Link>
          <Link to="/admin/espacios">
            <Button size="sm" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
              Consultorios
            </Button>
          </Link>
          <Link to="/admin/reportes">
            <Button size="sm" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
              Ver Reportes
            </Button>
          </Link>
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* Grid de Indicadores Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pacientes Activos"
          value={stats?.pacientes_activos ?? 0}
          icon={Users}
          color="primary"
          description="En tratamiento continuo"
        />
        <StatCard
          title="Pacientes en Espera"
          value={stats?.pacientes_en_espera ?? 0}
          icon={Users}
          color="amber"
          description="Con primera cita agendada"
        />
        <StatCard
          title="Profesionales Activos"
          value={stats?.profesionales_activos ?? 0}
          icon={HeartPulse}
          color="purple"
          description="Equipo psicológico activo"
        />
        <StatCard
          title="Espacios Disponibles"
          value={stats?.espacios_disponibles ?? 0}
          icon={Building2}
          color="emerald"
          description="Consultorios operativos"
        />
      </div>

      {/* Grid de Operaciones de Citas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Citas Programadas"
          value={stats?.citas_programadas ?? 0}
          icon={Calendar}
          color="blue"
          description="Sesiones pendientes"
        />
        <StatCard
          title="Citas Realizadas"
          value={stats?.citas_realizadas ?? 0}
          icon={CheckCircle2}
          color="emerald"
          description="Atenciones completadas"
        />
        <StatCard
          title="Citas Canceladas"
          value={stats?.citas_canceladas ?? 0}
          icon={XCircle}
          color="rose"
          description="Cancelaciones registradas"
        />
      </div>

      {/* Accesos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Gestión de Pacientes" subtitle="Expedientes y asignación">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Consulta el padrón completo de solicitantes, pacientes activos y asignaciones administrativas.
          </p>
          <Link to="/admin/pacientes">
            <Button variant="secondary" size="sm" className="w-full justify-between">
              <span>Administrar Pacientes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </Card>

        <Card title="Equipo de Profesionales" subtitle="Carga clínica y agenda">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Monitorea la carga de pacientes por profesional y registra nuevos terapeutas al sistema.
          </p>
          <Link to="/admin/profesionales">
            <Button variant="secondary" size="sm" className="w-full justify-between">
              <span>Administrar Profesionales</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </Card>

        <Card title="Espacios de Atención" subtitle="Ocupación física de salas">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Verifica el uso de consultorios físicos y virtuales para evitar traslapes o conflictos.
          </p>
          <Link to="/admin/espacios">
            <Button variant="secondary" size="sm" className="w-full justify-between">
              <span>Administrar Espacios</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
