import React, { useState, useEffect } from 'react';
import reportService from '../../services/reportService';
import { BarChart3, Users, Calendar, Building2, CheckCircle2, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import Card, { StatCard } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';

export const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [citasReport, setCitasReport] = useState(null);
  const [pacientesReport, setPacientesReport] = useState(null);
  const [profesionalesReport, setProfesionalesReport] = useState(null);
  const [espaciosReport, setEspaciosReport] = useState(null);
  const [asistenciasReport, setAsistenciasReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      const [citasRes, pacRes, profRes, espRes, asistRes] = await Promise.all([
        reportService.getCitas(),
        reportService.getPacientes(),
        reportService.getProfesionales(),
        reportService.getEspacios(),
        reportService.getAsistencias(),
      ]);

      if (citasRes.success) setCitasReport(citasRes.data);
      if (pacRes.success) setPacientesReport(pacRes.data);
      if (profRes.success) setProfesionalesReport(profRes.data);
      if (espRes.success) setEspaciosReport(espRes.data);
      if (asistRes.success) setAsistenciasReport(asistRes.data);
    } catch (err) {
      console.error('Error cargando reportes:', err);
      setError('No se pudieron obtener todos los reportes analíticos.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Generando reportes e indicadores cuantitativos..." />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Reportes e Indicadores de Gestión</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Métricas cuantitativas e indicadores administrativos de atención psicológica.
        </p>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* Resumen de Asistencias e Inasistencias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Asistencias"
          value={asistenciasReport?.total_asistencias ?? 0}
          icon={CheckCircle2}
          color="emerald"
          description="Sesiones cumplidas"
        />
        <StatCard
          title="Total Inasistencias"
          value={asistenciasReport?.total_inasistencias ?? 0}
          icon={XCircle}
          color="rose"
          description="Faltas registradas"
        />
        <StatCard
          title="Inasistencias Justificadas"
          value={asistenciasReport?.inasistencias_justificadas ?? 0}
          icon={TrendingUp}
          color="amber"
          description="Notificadas con antelación"
        />
        <StatCard
          title="Inasistencias Injustificadas"
          value={asistenciasReport?.inasistencias_injustificadas ?? 0}
          icon={AlertCircle}
          color="purple"
          description="Sin previo aviso"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 32.2 & 32.6 Carga de Atención por Profesional */}
        <Card title="Carga de Atención por Profesional" subtitle="Pacientes activos y citas por terapeuta">
          {profesionalesReport && profesionalesReport.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700/50 text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="pb-3 px-2">Profesional</th>
                    <th className="pb-3 px-2 text-center">Pacientes Activos</th>
                    <th className="pb-3 px-2 text-center">Total Citas</th>
                    <th className="pb-3 px-2 text-center">Realizadas</th>
                    <th className="pb-3 px-2 text-center">Canceladas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {profesionalesReport.map((p) => (
                    <tr key={p.id_profesional} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-2 font-bold text-slate-800 dark:text-slate-100">
                        Lic. {p.nombres} {p.apellidos}
                      </td>
                      <td className="py-2.5 px-2 text-center font-semibold text-primary-700 dark:text-primary-300">
                        {p.pacientes_activos}
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-600 dark:text-slate-300">{p.total_citas}</td>
                      <td className="py-2.5 px-2 text-center text-emerald-600 font-semibold">{p.citas_realizadas}</td>
                      <td className="py-2.5 px-2 text-center text-rose-600 font-semibold">{p.citas_canceladas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">Sin registros de carga profesional.</p>
          )}
        </Card>

        {/* 32.4 Ocupación de Espacios */}
        <Card title="Ocupación de Espacios y Salas" subtitle="Uso de consultorios para sesiones">
          {espaciosReport && espaciosReport.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700/50 text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="pb-3 px-2">Espacio / Consultorio</th>
                    <th className="pb-3 px-2">Ubicación</th>
                    <th className="pb-3 px-2 text-center">Citas Asignadas</th>
                    <th className="pb-3 px-2 text-center">Completadas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {espaciosReport.map((e) => (
                    <tr key={e.id_espacio} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-2 font-bold text-slate-800 dark:text-slate-100">{e.nombre}</td>
                      <td className="py-2.5 px-2 text-slate-500 dark:text-slate-400">{e.ubicacion}</td>
                      <td className="py-2.5 px-2 text-center font-semibold text-primary-700 dark:text-primary-300">{e.total_citas_asignadas}</td>
                      <td className="py-2.5 px-2 text-center text-emerald-600 font-semibold">{e.citas_completadas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">Sin registros de uso de espacios.</p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 32.5 Pacientes por Estado */}
        <Card title="Distribución de Pacientes por Estado" subtitle="Fase del proceso administrativo">
          {pacientesReport?.pacientes_por_estado && pacientesReport.pacientes_por_estado.length > 0 ? (
            <div className="space-y-3">
              {pacientesReport.pacientes_por_estado.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                  <span className="font-semibold text-xs text-slate-700 dark:text-slate-200">{item.estado}</span>
                  <span className="font-bold text-sm text-primary-700 dark:text-primary-300 px-3 py-1 bg-white dark:bg-[#111827] rounded-lg border border-slate-200 dark:border-slate-700/50">
                    {item.total} {item.total === 1 ? 'paciente' : 'pacientes'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">Sin datos de pacientes.</p>
          )}
        </Card>

        {/* 32.1 Citas por Estado */}
        <Card title="Distribución de Citas por Estado" subtitle="Resultados de agendamiento">
          {citasReport?.por_estado && citasReport.por_estado.length > 0 ? (
            <div className="space-y-3">
              {citasReport.por_estado.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                  <Badge status={item.estado}>{item.estado}</Badge>
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-100 px-3 py-1 bg-white dark:bg-[#111827] rounded-lg border border-slate-200 dark:border-slate-700/50">
                    {item.total} {item.total === 1 ? 'cita' : 'citas'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">Sin datos de citas.</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminReports;
