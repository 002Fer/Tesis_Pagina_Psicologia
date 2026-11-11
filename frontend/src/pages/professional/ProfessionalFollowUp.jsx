import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import patientService from '../../services/patientService';
import followUpService from '../../services/followUpService';
import { ClipboardList, Plus, Calendar, Clock, RefreshCw, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';

export const ProfessionalFollowUp = () => {
  const { user } = useAuth();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Modal Crear Plan
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [frecuencia, setFrecuencia] = useState('SEMANAL');
  const [diaSemana, setDiaSemana] = useState('1');
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [actionLoading, setActionLoading] = useState(false);

  // Modal Cambiar Frecuencia
  const [frecuenciaModalOpen, setFrecuenciaModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [nuevaFrecuencia, setNuevaFrecuencia] = useState('QUINCENAL');

  // Modal Generar Citas
  const [generarModalOpen, setGenerarModalOpen] = useState(false);
  const [semanasACrear, setSemanasACrear] = useState('4');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await patientService.getAll();
      if (res.success && Array.isArray(res.data)) {
        // Traer detalle de cada paciente para ver si tiene vinculación y plan
        const detailed = await Promise.all(
          res.data.map(async (p) => {
            try {
              const det = await patientService.getById(p.id_paciente);
              return det.success ? det.data : p;
            } catch {
              return p;
            }
          })
        );
        setPacientes(detailed);
      }
    } catch (err) {
      console.error('Error cargando planes de seguimiento:', err);
      setNotification({ type: 'error', message: 'No se pudo cargar la información de pacientes.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreatePlan = (paciente) => {
    setSelectedPatientId(paciente.id_paciente);
    setFrecuencia('SEMANAL');
    setDiaSemana('1');
    setHoraInicio('09:00');
    setCreateModalOpen(true);
  };

  const handleConfirmCreatePlan = async (e) => {
    e.preventDefault();
    const paciente = pacientes.find((p) => p.id_paciente === Number(selectedPatientId));
    if (!paciente?.vinculacion_actual) {
      setNotification({
        type: 'error',
        message: 'El paciente debe tener una vinculación activa para establecer un plan de seguimiento.',
      });
      return;
    }

    try {
      setActionLoading(true);
      const res = await followUpService.createPlan({
        id_vinculacion: paciente.vinculacion_actual.id_vinculacion,
        frecuencia,
        horarios: [
          {
            dia_semana: parseInt(diaSemana, 10),
            hora_inicio: `${horaInicio}:00`,
            duracion_minutos: 60,
          },
        ],
      });

      if (res.success) {
        setCreateModalOpen(false);
        setNotification({
          type: 'success',
          message: `Plan de seguimiento con frecuencia ${frecuencia} configurado correctamente.`,
        });
        fetchData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Error al crear el plan de seguimiento.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenUpdateFrecuencia = (paciente) => {
    const planId = paciente.plan_actual?.id_plan_seguimiento || paciente.id_plan_seguimiento;
    if (!planId) {
      setNotification({ type: 'error', message: 'No se encontró un plan activo para este paciente.' });
      return;
    }
    setSelectedPlan({
      id_paciente: paciente.id_paciente,
      id_plan: planId,
      frecuenciaActual: paciente.plan_actual?.frecuencia || 'SEMANAL',
    });
    setNuevaFrecuencia(paciente.plan_actual?.frecuencia || 'QUINCENAL');
    setFrecuenciaModalOpen(true);
  };

  const handleConfirmUpdateFrecuencia = async () => {
    if (!selectedPlan?.id_plan) return;
    try {
      setActionLoading(true);
      const res = await followUpService.updateFrecuencia(selectedPlan.id_plan, {
        nueva_frecuencia: nuevaFrecuencia,
      });
      if (res.success) {
        setFrecuenciaModalOpen(false);
        setNotification({ type: 'success', message: `Frecuencia modificada exitosamente a ${nuevaFrecuencia}.` });
        fetchData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Error al actualizar la frecuencia.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinalizarSeguimiento = async (paciente) => {
    const planId = paciente.plan_actual?.id_plan_seguimiento || paciente.id_plan_seguimiento;
    if (!planId) {
      setNotification({ type: 'error', message: 'El paciente no tiene un plan activo que finalizar.' });
      return;
    }

    if (!window.confirm(`¿Confirmas finalizar formalmente el proceso de atención para ${paciente.nombres} ${paciente.apellidos}?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await followUpService.finalizar(planId);
      if (res.success) {
        setNotification({ type: 'success', message: 'Proceso de seguimiento finalizado exitosamente.' });
        fetchData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Error al finalizar seguimiento.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenGenerarCitas = (paciente) => {
    const planId = paciente.plan_actual?.id_plan_seguimiento || paciente.id_plan_seguimiento;
    if (!planId) {
      setNotification({ type: 'error', message: 'Primero debe configurar un plan para generar citas periódicas.' });
      return;
    }
    setSelectedPlan({
      ...paciente,
      id_plan_seguimiento: planId,
    });
    setSemanasACrear('4');
    setGenerarModalOpen(true);
  };

  const handleConfirmGenerarCitas = async () => {
    if (!selectedPlan?.id_plan_seguimiento) return;
    try {
      setActionLoading(true);
      const res = await followUpService.generarCitas(selectedPlan.id_plan_seguimiento, parseInt(semanasACrear, 10));
      if (res.success) {
        setGenerarModalOpen(false);
        setNotification({
          type: 'success',
          message: `${res.data?.length || 0} citas periódicas proyectadas y registradas con éxito en tu agenda.`,
        });
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Error al generar citas periódicas.' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader message="Cargando planes de seguimiento..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Planes de Seguimiento Terapéutico</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Administra la frecuencia de atención (Semanal, Quincenal, Mensual) y programa citas periódicas de forma estructurada.
          </p>
        </div>
      </div>

      {notification && (
        <Alert type={notification.type} onClose={() => setNotification(null)}>
          {notification.message}
        </Alert>
      )}

      <div className="space-y-4">
        {pacientes.map((paciente) => {
          const tieneVinculo = !!paciente.vinculacion_actual;

          return (
            <div
              key={paciente.id_paciente}
              className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5 shadow-sm dark:shadow-none flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    {paciente.nombres} {paciente.apellidos}
                  </h4>
                  <Badge status={paciente.estado} />
                  {paciente.plan_actual && (
                    <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 px-2 py-0.5 rounded-full">
                      Plan {paciente.plan_actual.frecuencia}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Expediente #{paciente.id_paciente} • Vinculación:{' '}
                  {tieneVinculo ? (
                    <strong className="text-emerald-700 font-semibold">Activa</strong>
                  ) : (
                    <span className="text-amber-600 font-semibold">Pendiente de primera atención</span>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {tieneVinculo ? (
                  <>
                    {!paciente.plan_actual ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenCreatePlan(paciente)}
                        icon={Plus}
                      >
                        Configurar Plan
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenGenerarCitas(paciente)}
                          icon={Calendar}
                        >
                          Generar Citas
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenUpdateFrecuencia(paciente)}
                          icon={RefreshCw}
                        >
                          Modificar Frecuencia
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleFinalizarSeguimiento(paciente)}
                          className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                        >
                          Finalizar Proceso
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                    El plan se habilitará al registrar la primera cita como realizada.
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Crear Plan */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Establecer Plan de Seguimiento">
        <form onSubmit={handleConfirmCreatePlan} className="space-y-4">
          <Select
            id="frecuencia"
            label="Frecuencia de Atención"
            value={frecuencia}
            onChange={(e) => setFrecuencia(e.target.value)}
            placeholder=""
            options={[
              { value: 'DOS_VECES_SEMANA', label: 'Dos veces por semana' },
              { value: 'SEMANAL', label: 'Semanal (1 sesión cada 7 días)' },
              { value: 'QUINCENAL', label: 'Quincenal (1 sesión cada 14 días)' },
              { value: 'MENSUAL', label: 'Mensual (1 sesión al mes)' },
              { value: 'PERSONALIZADA', label: 'Personalizada' },
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              id="diaPlan"
              label="Día Habitual de Sesión"
              value={diaSemana}
              onChange={(e) => setDiaSemana(e.target.value)}
              placeholder=""
              options={[
                { value: '1', label: 'Lunes' },
                { value: '2', label: 'Martes' },
                { value: '3', label: 'Miércoles' },
                { value: '4', label: 'Jueves' },
                { value: '5', label: 'Viernes' },
                { value: '6', label: 'Sábado' },
              ]}
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Hora Habitual
              </label>
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none dark:bg-[#111827] dark:text-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)} disabled={actionLoading}>
              Cancelar
            </Button>
            <Button type="submit" loading={actionLoading}>
              Guardar Plan de Seguimiento
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Modificar Frecuencia */}
      <Modal isOpen={frecuenciaModalOpen} onClose={() => setFrecuenciaModalOpen(false)} title="Modificar Frecuencia de Atención">
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ajusta la periodicidad del seguimiento de acuerdo con el avance del paciente. El cambio quedará registrado en el historial administrativo con trazabilidad.
          </p>

          <Select
            id="nuevaFrecuencia"
            label="Nueva Frecuencia"
            value={nuevaFrecuencia}
            onChange={(e) => setNuevaFrecuencia(e.target.value)}
            placeholder=""
            options={[
              { value: 'SEMANAL', label: 'Semanal' },
              { value: 'QUINCENAL', label: 'Quincenal' },
              { value: 'MENSUAL', label: 'Mensual' },
              { value: 'DOS_VECES_SEMANA', label: 'Dos veces por semana' },
              { value: 'PERSONALIZADA', label: 'Personalizada' },
            ]}
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" onClick={() => setFrecuenciaModalOpen(false)} disabled={actionLoading}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmUpdateFrecuencia} loading={actionLoading}>
              Actualizar Frecuencia
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Generar Citas Periódicas */}
      <Modal
        isOpen={generarModalOpen}
        onClose={() => setGenerarModalOpen(false)}
        title="Proyectar y Generar Citas Periódicas"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            El sistema generará automáticamente las sesiones en tu agenda según la frecuencia y los días configurados en el plan terapéutico de{' '}
            <strong>
              {selectedPlan?.nombres} {selectedPlan?.apellidos}
            </strong>.
          </p>

          <Select
            id="semanasACrear"
            label="Proyección de Semanas hacia Adelante"
            value={semanasACrear}
            onChange={(e) => setSemanasACrear(e.target.value)}
            placeholder=""
            options={[
              { value: '2', label: 'Próximas 2 semanas' },
              { value: '4', label: 'Próximas 4 semanas (1 mes recomendado)' },
              { value: '8', label: 'Próximas 8 semanas (2 meses)' },
              { value: '12', label: 'Próximas 12 semanas (3 meses)' },
            ]}
          />

          <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-xs text-teal-800 dark:text-teal-300">
            <strong>Verificación automática:</strong> El sistema validará que los consultorios y tu agenda no presenten traslapes antes de fijar cada cita.
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" onClick={() => setGenerarModalOpen(false)} disabled={actionLoading}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmGenerarCitas} loading={actionLoading} icon={Calendar}>
              Generar Citas en Agenda
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfessionalFollowUp;
