import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/appointmentService';
import appointmentService from '../../services/appointmentService';
import { CheckCircle2, XCircle, Clock, Calendar, User, Check, AlertCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import Select from '../../components/common/Select';

export const ProfessionalAttendance = () => {
  const { user } = useAuth();
  const [citasPendientes, setCitasPendientes] = useState([]);
  const [asistenciasRecientes, setAsistenciasRecientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Modal Registro
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  const [estado, setEstado] = useState('ASISTIO');
  const [tipoInasistencia, setTipoInasistencia] = useState('JUSTIFICADA');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (user?.perfil?.id_profesional) {
        // Citas programadas
        const citasRes = await appointmentService.getAll({
          id_profesional: user.perfil.id_profesional,
          estado: 'PROGRAMADA',
        });
        if (citasRes.success && Array.isArray(citasRes.data)) {
          setCitasPendientes(citasRes.data);
        }

        // Historial de asistencias
        const asistRes = await attendanceService.getAll({ id_profesional: user.perfil.id_profesional });
        if (asistRes.success && Array.isArray(asistRes.data)) {
          setAsistenciasRecientes(asistRes.data);
        }
      }
    } catch (err) {
      console.error('Error cargando asistencias:', err);
      setNotification({ type: 'error', message: 'No se pudo cargar la información de asistencias.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cita) => {
    setSelectedCita(cita);
    setEstado('ASISTIO');
    setTipoInasistencia('JUSTIFICADA');
    setModalOpen(true);
  };

  const handleConfirmAttendance = async () => {
    if (!selectedCita) return;
    try {
      setActionLoading(true);
      const res = await attendanceService.register({
        id_cita: selectedCita.id_cita,
        estado,
        tipo_inasistencia: estado === 'NO_ASISTIO' ? tipoInasistencia : null,
      });

      if (res.success) {
        setModalOpen(false);
        setNotification({
          type: 'success',
          message: `Asistencia registrada como '${estado}' para ${selectedCita.pac_nombres} ${selectedCita.pac_apellidos}.`,
        });
        fetchData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Error al registrar la asistencia.' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader message="Cargando panel de asistencias..." />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Control de Asistencia e Inasistencia</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Registra el cumplimiento de las sesiones de atención y justificaciones de inasistencia.
        </p>
      </div>

      {notification && (
        <Alert type={notification.type} onClose={() => setNotification(null)}>
          {notification.message}
        </Alert>
      )}

      {/* Citas Pendientes de Registro */}
      <Card
        title={`Citas Pendientes de Asistencia (${citasPendientes.length})`}
        subtitle="Sesiones programadas que requieren confirmación administrativa"
      >
        {citasPendientes.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {citasPendientes.map((cita) => {
              const inicio = new Date(cita.fecha_hora_inicio);
              return (
                <div key={cita.id_cita} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {cita.pac_nombres} {cita.pac_apellidos}
                      </h4>
                      <Badge status="PROGRAMADA">{cita.tipo}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {inicio.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })} •{' '}
                      {inicio.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <Button size="sm" onClick={() => handleOpenModal(cita)} icon={CheckCircle2}>
                    Registrar Asistencia
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">
            No tienes citas programadas pendientes de registro de asistencia.
          </p>
        )}
      </Card>

      {/* Registro Histórico */}
      <Card title="Historial de Asistencias Registradas" subtitle="Últimas atenciones completadas o inasistencias">
        {asistenciasRecientes.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50 max-h-96 overflow-y-auto">
            {asistenciasRecientes.map((asist) => (
              <div key={asist.id_asistencia} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-slate-100">
                    {asist.pac_nombres} {asist.pac_apellidos}
                  </h5>
                  <p className="text-slate-400 dark:text-slate-500">
                    Fecha de cita:{' '}
                    {new Date(asist.fecha_hora_inicio).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge status={asist.estado} />
                  {asist.tipo_inasistencia && (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/40 px-2 py-0.5 rounded-full font-medium">
                      {asist.tipo_inasistencia}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">Aún no hay registros de asistencia en el sistema.</p>
        )}
      </Card>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Asistencia">
        {selectedCita && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Sesión con <strong>{selectedCita.pac_nombres} {selectedCita.pac_apellidos}</strong>.
            </p>

            <Select
              id="estado"
              label="Resultado"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              placeholder=""
              options={[
                { value: 'ASISTIO', label: 'Asistió a la Sesión (Realizada)' },
                { value: 'NO_ASISTIO', label: 'No Asistió (Inasistencia)' },
              ]}
            />

            {estado === 'NO_ASISTIO' && (
              <Select
                id="tipoInasistencia"
                label="Tipo de Inasistencia"
                value={tipoInasistencia}
                onChange={(e) => setTipoInasistencia(e.target.value)}
                placeholder=""
                options={[
                  { value: 'JUSTIFICADA', label: 'Justificada con comprobante o aviso' },
                  { value: 'INJUSTIFICADA', label: 'Injustificada (Falta no notificada)' },
                ]}
              />
            )}

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmAttendance} loading={actionLoading}>
                Guardar Asistencia
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProfessionalAttendance;
