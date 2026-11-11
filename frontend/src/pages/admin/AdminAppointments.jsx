import React, { useState, useEffect } from 'react';
import appointmentService from '../../services/appointmentService';
import { Calendar, Clock, User, Building2, Search, Filter } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import { formatDateUTC, formatTimeUTC } from '../../utils/date.utils';

export const AdminAppointments = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [fechaFiltro, estadoFiltro]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (fechaFiltro) params.fecha = fechaFiltro;
      if (estadoFiltro) params.estado = estadoFiltro;

      const res = await appointmentService.getAll(params);
      if (res.success && Array.isArray(res.data)) {
        setCitas(res.data);
      }
    } catch (err) {
      console.error('Error cargando citas globales:', err);
      setNotification({ type: 'error', message: 'No se pudieron cargar las citas del sistema.' });
    } finally {
      setLoading(false);
    }
  };

  const citasFiltradas = citas.filter((c) => {
    const full = `${c.pac_nombres} ${c.pac_apellidos} ${c.prof_nombres} ${c.prof_apellidos}`.toLowerCase();
    return full.includes(search.toLowerCase());
  });

  if (loading) return <Loader message="Cargando agenda global..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Supervisión Global de Citas</h2>
          <p className="text-sm text-slate-500 mt-1">
            Visualización y control de todas las citas del centro psicológico.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={fechaFiltro}
            onChange={(e) => setFechaFiltro(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />

          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos los Estados</option>
            <option value="PROGRAMADA">Programada</option>
            <option value="REALIZADA">Realizada</option>
            <option value="CANCELADA">Cancelada</option>
            <option value="REPROGRAMADA">Reprogramada</option>
            <option value="INASISTENCIA">Inasistencia</option>
          </select>

          <input
            type="text"
            placeholder="Buscar paciente o terapeuta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {notification && (
        <Alert type={notification.type} onClose={() => setNotification(null)}>
          {notification.message}
        </Alert>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 px-3">Fecha y Hora</th>
                <th className="pb-3 px-3">Paciente</th>
                <th className="pb-3 px-3">Terapeuta Asignado</th>
                <th className="pb-3 px-3">Espacio / Sala</th>
                <th className="pb-3 px-3">Tipo</th>
                <th className="pb-3 px-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {citasFiltradas.map((c) => {
                const inicio = new Date(c.fecha_hora_inicio);
                const fin = new Date(c.fecha_hora_fin);

                return (
                  <tr key={c.id_cita} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-800">
                        {formatDateUTC(c.fecha_hora_inicio, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {formatTimeUTC(c.fecha_hora_inicio)} - {formatTimeUTC(c.fecha_hora_fin)}
                      </p>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {c.pac_nombres} {c.pac_apellidos}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      Lic. {c.prof_nombres} {c.prof_apellidos}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {c.espacio_nombre || <span className="italic text-slate-400">Por asignar</span>}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full text-[10px]">
                        {c.tipo}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge status={c.estado} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminAppointments;
