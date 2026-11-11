import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import appointmentService from '../../services/appointmentService';
import professionalService from '../../services/professionalService';
import {
  Calendar,
  Clock,
  XCircle,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Building2,
  Search,
  Filter,
  X,
  CalendarDays,
  Plus
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import Input from '../../components/common/Input';
import { formatDateUTC, formatTimeUTC, getLocalDateString } from '../../utils/date.utils';

export const PatientAppointments = () => {
  const { user } = useAuth();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Filtros de búsqueda
  const [filtroEstado, setFiltroEstado] = useState('TODAS');
  const [busqueda, setBusqueda] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');

  // Modal Cancelar
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Modal Reprogramar
  const [reprogramModalOpen, setReprogramModalOpen] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [slotsDisponibles, setSlotsDisponibles] = useState([]);
  const [selectedReprogramSlot, setSelectedReprogramSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Sugerencias frecuentes de cancelación
  const sugerenciasCancelacion = [
    'Motivo de salud o enfermedad imprevista',
    'Cruce de horario laboral o académico',
    'Emergencia familiar de última hora',
    'Dificultad de traslado o transporte',
    'Solicito reprogramar para otra fecha',
  ];

  useEffect(() => {
    fetchCitas();
  }, [user]);

  const fetchCitas = async () => {
    try {
      setLoading(true);
      // El backend filtra automáticamente por req.user.id_paciente cuando el rol es PACIENTE
      const params = {};
      if (user?.perfil?.id_paciente) {
        params.id_paciente = user.perfil.id_paciente;
      }
      const res = await appointmentService.getAll(params);
      if (res.success && Array.isArray(res.data)) {
        setCitas(res.data);
      }
    } catch (err) {
      console.error('Error cargando citas:', err);
      setNotification({ type: 'error', message: 'No se pudieron cargar tus citas.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCancel = (cita) => {
    setSelectedCita(cita);
    setMotivoCancelacion('');
    setCancelError('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedCita) return;

    const trimmed = motivoCancelacion.trim();
    if (trimmed.length < 15) {
      setCancelError('Por favor ingresa un motivo coherente y descriptivo (mínimo 15 caracteres).');
      return;
    }

    try {
      setActionLoading(true);
      setCancelError('');
      const res = await appointmentService.cancel(selectedCita.id_cita, trimmed);
      if (res.success) {
        setCancelModalOpen(false);
        setNotification({ type: 'success', message: 'Cita cancelada correctamente.' });
        fetchCitas();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'No se pudo cancelar la cita.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenReprogram = (cita) => {
    setSelectedCita(cita);
    setNuevaFecha('');
    setSlotsDisponibles([]);
    setSelectedReprogramSlot(null);
    setReprogramModalOpen(true);
  };

  const handleFechaReprogramChange = async (fecha) => {
    setNuevaFecha(fecha);
    setSelectedReprogramSlot(null);
    if (!fecha || !selectedCita) return;

    try {
      setLoadingSlots(true);
      const res = await professionalService.getHorariosLibres(selectedCita.id_profesional, fecha);
      if (res.success && Array.isArray(res.data)) {
        setSlotsDisponibles(res.data);
      }
    } catch (err) {
      console.error('Error al cargar horarios de reprogramación:', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirmReprogram = async () => {
    if (!selectedCita || !selectedReprogramSlot) return;

    try {
      setActionLoading(true);
      const res = await appointmentService.reschedule(selectedCita.id_cita, {
        nueva_fecha_hora_inicio: selectedReprogramSlot.inicio_iso,
        nueva_fecha_hora_fin: selectedReprogramSlot.fin_iso,
      });

      if (res.success) {
        setReprogramModalOpen(false);
        setNotification({
          type: 'success',
          message: '¡Cita reprogramada con éxito! La cita anterior fue actualizada conservando la trazabilidad.',
        });
        fetchCitas();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Error al reprogramar la cita.' });
    } finally {
      setActionLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltroEstado('TODAS');
    setBusqueda('');
    setFiltroFecha('');
  };

  const citasFiltradas = citas.filter((c) => {
    // Filtro por estado
    if (filtroEstado !== 'TODAS' && c.estado !== filtroEstado) {
      return false;
    }

    // Filtro por fecha específica (YYYY-MM-DD)
    if (filtroFecha) {
      const citaDate = c.fecha_hora_inicio ? c.fecha_hora_inicio.split('T')[0] : '';
      if (citaDate !== filtroFecha) {
        return false;
      }
    }

    // Filtro por búsqueda de texto (profesional, espacio, id, tipo)
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      const profNombre = `${c.prof_nombres || ''} ${c.prof_apellidos || ''}`.toLowerCase();
      const espacio = (c.espacio_nombre || '').toLowerCase();
      const tipo = (c.tipo || '').toLowerCase();
      const id = String(c.id_cita);
      const matches = profNombre.includes(q) || espacio.includes(q) || tipo.includes(q) || id.includes(q);
      if (!matches) return false;
    }

    return true;
  });

  if (loading) return <Loader message="Cargando tus citas..." />;

  const hayFiltrosActivos = filtroEstado !== 'TODAS' || busqueda.trim() !== '' || filtroFecha !== '';

  return (
    <div className="space-y-6">
      {/* Encabezado y Acción Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mis Citas de Atención</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Consulta tus citas programadas, historial y gestiona reprogramaciones o cancelaciones.
          </p>
        </div>

        <Link to="/paciente/profesionales">
          <Button icon={Plus} variant="primary" className="shadow-sm">
            Agendar Nueva Cita
          </Button>
        </Link>
      </div>

      {notification && (
        <Alert
          type={notification.type}
          onClose={() => setNotification(null)}
          autoClose={5000}
          title={notification.type === 'success' ? 'Éxito' : 'Aviso'}
        >
          {notification.message}
        </Alert>
      )}

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Input de Búsqueda */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por profesional, espacio, tipo o número de cita..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtro por Fecha */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {hayFiltrosActivos && (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline px-2 py-1 font-medium whitespace-nowrap"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Píldoras de Estado */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">
            Estado:
          </span>
          {['TODAS', 'PROGRAMADA', 'REALIZADA', 'CANCELADA', 'REPROGRAMADA'].map((st) => (
            <button
              key={st}
              onClick={() => setFiltroEstado(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                filtroEstado === st
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Citas */}
      {citasFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {citasFiltradas.map((cita) => {
            const fechaLabel = formatDateUTC(cita.fecha_hora_inicio, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
            const horaInicio = formatTimeUTC(cita.fecha_hora_inicio);
            const horaFin = formatTimeUTC(cita.fecha_hora_fin);
            const puedeGestionar = cita.estado === 'PROGRAMADA';

            return (
              <div
                key={cita.id_cita}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Cita #{cita.id_cita} • {cita.tipo}
                      </span>
                      <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 capitalize mt-0.5">
                        {fechaLabel}
                      </h4>
                    </div>
                    <Badge status={cita.estado} />
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {horaInicio} - {horaFin}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">Profesional:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        Lic. {cita.prof_nombres} {cita.prof_apellidos}
                      </span>
                    </div>

                    {cita.espacio_nombre && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>{cita.espacio_nombre}</span>
                      </div>
                    )}

                    {cita.motivo_cancelacion && (
                      <div className="text-rose-600 dark:text-rose-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                        <strong>Motivo de cancelación:</strong> {cita.motivo_cancelacion}
                      </div>
                    )}

                    {cita.cita_anterior && (
                      <div className="text-amber-700 dark:text-amber-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                        Proviene de reprogramación de la Cita #{cita.cita_anterior}
                      </div>
                    )}
                  </div>
                </div>

                {puedeGestionar && (
                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenReprogram(cita)}
                      icon={RefreshCw}
                    >
                      Reprogramar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleOpenCancel(cita)}
                      icon={XCircle}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CalendarDays className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
            {hayFiltrosActivos ? 'No se encontraron citas con esos filtros' : 'No tienes citas registradas'}
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
            {hayFiltrosActivos
              ? 'Intenta ajustar los términos de búsqueda o cambiar el estado seleccionado.'
              : 'Agenda tu primera cita de atención psicológica seleccionando un profesional disponible.'}
          </p>

          <div className="mt-5 flex justify-center gap-3">
            {hayFiltrosActivos ? (
              <Button variant="secondary" size="sm" onClick={limpiarFiltros}>
                Restablecer Filtros
              </Button>
            ) : (
              <Link to="/paciente/profesionales">
                <Button variant="primary" size="sm" icon={Plus}>
                  Agendar Cita Ahora
                </Button>
              </Link>
            )}
          </div>
        </Card>
      )}

      {/* Modal Cancelar */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancelar Cita Programada"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            ¿Estás seguro de cancelar tu cita del{' '}
            <strong className="text-slate-800 dark:text-slate-100">
              {selectedCita &&
                formatDateUTC(selectedCita.fecha_hora_inicio, {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
            </strong>
            ?
          </p>

          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Motivos sugeridos frecuentes (haz clic para aplicar):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {sugerenciasCancelacion.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setMotivoCancelacion(sug);
                    setCancelError('');
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:border-primary-400 dark:hover:border-primary-700 hover:text-primary-700 dark:hover:text-primary-300 transition-colors cursor-pointer text-left"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="motivo_cancel" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Motivo o justificación de cancelación <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="motivo_cancel"
              rows={3}
              required
              placeholder="Explica de manera clara el motivo de tu cancelación para que el terapeuta esté enterado..."
              value={motivoCancelacion}
              onChange={(e) => {
                setMotivoCancelacion(e.target.value);
                if (e.target.value.trim().length >= 15) setCancelError('');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
            <div className="flex justify-between items-center mt-1 text-xs">
              {cancelError ? (
                <span className="text-rose-600 dark:text-rose-400 font-medium">{cancelError}</span>
              ) : (
                <span className="text-slate-400 dark:text-slate-500">Mínimo 15 caracteres requeridos.</span>
              )}
              <span className={`font-mono text-[11px] ${motivoCancelacion.trim().length >= 15 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                {motivoCancelacion.trim().length} / 15
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setCancelModalOpen(false)} disabled={actionLoading}>
              Volver
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmCancel}
              loading={actionLoading}
              disabled={motivoCancelacion.trim().length < 15}
            >
              Confirmar Cancelación
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Reprogramar */}
      <Modal
        isOpen={reprogramModalOpen}
        onClose={() => setReprogramModalOpen(false)}
        title="Reprogramar Cita"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Selecciona la nueva fecha para consultar los horarios disponibles con el profesional. La cita anterior quedará marcada como reprogramada.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Nueva Fecha
            </label>
            <input
              type="date"
              min={getLocalDateString()}
              value={nuevaFecha}
              onChange={(e) => handleFechaReprogramChange(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          {loadingSlots ? (
            <Loader message="Buscando franjas libres..." />
          ) : nuevaFecha && slotsDisponibles.length > 0 ? (
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Selecciona la nueva hora:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {slotsDisponibles.map((slot, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedReprogramSlot(slot)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                      selectedReprogramSlot?.inicio_iso === slot.inicio_iso
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary-400 hover:bg-primary-50/30'
                    }`}
                  >
                    {slot.hora_inicio} - {slot.hora_fin}
                  </button>
                ))}
              </div>
            </div>
          ) : nuevaFecha ? (
            <p className="text-xs text-slate-400 text-center py-3">No hay horarios libres para esta fecha.</p>
          ) : null}

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" onClick={() => setReprogramModalOpen(false)} disabled={actionLoading}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmReprogram}
              disabled={!selectedReprogramSlot}
              loading={actionLoading}
            >
              Confirmar Reprogramación
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PatientAppointments;
