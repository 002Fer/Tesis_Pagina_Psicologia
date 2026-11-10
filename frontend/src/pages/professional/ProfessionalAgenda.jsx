import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import appointmentService from '../../services/appointmentService';
import { attendanceService } from '../../services/appointmentService';
import { Calendar, Clock, User, Building2, CheckCircle, XCircle, Filter } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import Select from '../../components/common/Select';

export const ProfessionalAgenda = () => {
  const { user } = useAuth();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [notification, setNotification] = useState(null);

  // Modal Asistencia Rápida
  const [asistenciaModalOpen, setAsistenciaModalOpen] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  const [estadoAsistencia, setEstadoAsistencia] = useState('ASISTIO');
  const [tipoInasistencia, setTipoInasistencia] = useState('JUSTIFICADA');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAgenda();
  }, [user, fechaFiltro, estadoFiltro]);

  const fetchAgenda = async () => {
    try {
      setLoading(true);
      if (user?.perfil?.id_profesional) {
        const params = { id_profesional: user.perfil.id_profesional };
        if (fechaFiltro) params.fecha = fechaFiltro;
        if (estadoFiltro) params.estado = estadoFiltro;

        const res = await appointmentService.getAll(params);
        if (res.success && Array.isArray(res.data)) {
          setCitas(res.data);
        }
      }
    } catch (err) {
      console.error('Error cargando agenda:', err);
      setNotification({ type: 'error', message: 'No se pudo cargar la agenda.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAsistencia = (cita) => {
    setSelectedCita(cita);
    setEstadoAsistencia('ASISTIO');
    setTipoInasistencia('JUSTIFICADA');
    setAsistenciaModalOpen(true);
  };

  const handleConfirmAsistencia = async () => {
    if (!selectedCita) return;
    try {
      setActionLoading(true);
      const res = await attendanceService.register({
        id_cita: selectedCita.id_cita,
        estado: estadoAsistencia,
        tipo_inasistencia: estadoAsistencia === 'NO_ASISTIO' ? tipoInasistencia : null,
      });

      if (res.success) {
        setAsistenciaModalOpen(false);
        setNotification({ type: 'success', message: 'Resultado de asistencia registrado exitosamente.' });
        fetchAgenda();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Error al registrar la asistencia.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mi Agenda de Citas</h2>
          <p className="text-sm text-slate-500 mt-1">
            Revisa las sesiones programadas, confirma asistencia y supervisa el uso de consultorios.
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

          {(fechaFiltro || estadoFiltro) && (
            <button
              onClick={() => {
                setFechaFiltro('');
                setEstadoFiltro('');
              }}
              className="text-xs text-primary-600 hover:text-primary-700 font-semibold"
            >
              Limpiar Filtros
            </button>
          )}
        </div>
      </div>

      {notification && (
        <Alert
          type={notification.type}
          onClose={() => setNotification(null)}
          title={notification.type === 'success' ? 'Éxito' : 'Aviso'}
        >
          {notification.message}
        </Alert>
      )}

      {loading ? (
        <Loader message="Cargando agenda de citas..." />
      ) : citas.length > 0 ? (
        <div className="space-y-3">
          {citas.map((cita) => {
            const inicio = new Date(cita.fecha_hora_inicio);
            const fin = new Date(cita.fecha_hora_fin);

            return (
              <div
                key={cita.id_cita}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex flex-col items-center justify-center shrink-0 text-slate-700">
                    <span className="text-xs font-bold leading-none">{inicio.getDate()}</span>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      {inicio.toLocaleDateString('es-ES', { month: 'short' })}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-800">
                        {cita.pac_nombres} {cita.pac_apellidos}
                      </h4>
                      <Badge status={cita.estado} />
                      <span className="text-[11px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                        {cita.tipo}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {inicio.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {fin.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {cita.espacio_nombre && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {cita.espacio_nombre}
                        </span>
                      )}
                      {cita.pac_telefono && <span>Tel: {cita.pac_telefono}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  {cita.estado === 'PROGRAMADA' && (
                    <Button
                      size="sm"
                      onClick={() => handleOpenAsistencia(cita)}
                      icon={CheckCircle}
                    >
                      Asistencia
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12 text-slate-400 text-xs">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            No se encontraron citas con los criterios seleccionados.
          </div>
        </Card>
      )}

      {/* Modal Registrar Asistencia */}
      <Modal
        isOpen={asistenciaModalOpen}
        onClose={() => setAsistenciaModalOpen(false)}
        title="Registrar Resultado de la Cita"
      >
        {selectedCita && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Registrar asistencia para la sesión de{' '}
              <strong>
                {selectedCita.pac_nombres} {selectedCita.pac_apellidos}
              </strong>{' '}
              del {new Date(selectedCita.fecha_hora_inicio).toLocaleDateString('es-ES')}.
            </p>

            <Select
              id="estadoAsistencia"
              label="Resultado de Asistencia"
              value={estadoAsistencia}
              onChange={(e) => setEstadoAsistencia(e.target.value)}
              placeholder=""
              options={[
                { value: 'ASISTIO', label: 'Asistió a la Sesión (Cita Realizada)' },
                { value: 'NO_ASISTIO', label: 'No Asistió (Inasistencia)' },
              ]}
            />

            {estadoAsistencia === 'NO_ASISTIO' && (
              <Select
                id="tipoInasistencia"
                label="Tipo de Inasistencia"
                value={tipoInasistencia}
                onChange={(e) => setTipoInasistencia(e.target.value)}
                placeholder=""
                options={[
                  { value: 'JUSTIFICADA', label: 'Justificada con aviso previo' },
                  { value: 'INJUSTIFICADA', label: 'Injustificada (Falta sin aviso)' },
                ]}
              />
            )}

            {selectedCita.tipo === 'INICIAL' && estadoAsistencia === 'ASISTIO' && (
              <div className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg">
                <strong>Nota:</strong> Al registrar asistencia a la primera cita inicial, el paciente quedará formalmente vinculado a ti para el seguimiento terapéutico.
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="secondary" onClick={() => setAsistenciaModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmAsistencia} loading={actionLoading}>
                Guardar Registro
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProfessionalAgenda;
