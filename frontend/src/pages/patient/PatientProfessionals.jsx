import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import professionalService from '../../services/professionalService';
import appointmentService from '../../services/appointmentService';
import {
  HeartPulse,
  Calendar,
  Clock,
  Check,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Search,
  CalendarCheck2,
  CalendarDays,
  Info
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import {
  getLocalDateString,
  getTomorrowLocalDateString,
  formatDateUTC
} from '../../utils/date.utils';

const DIAS_SEMANA_NOMBRES = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo',
};

export const PatientProfessionals = () => {
  const { user } = useAuth();
  const [profesionales, setProfesionales] = useState([]);
  const [busquedaProf, setBusquedaProf] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProf, setSelectedProf] = useState(null);

  // Disponibilidad semanal configurada del profesional seleccionado
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [loadingDisp, setLoadingDisp] = useState(false);

  // Fecha seleccionada (default: mañana en hora local)
  const [fechaSeleccionada, setFechaSeleccionada] = useState(getTomorrowLocalDateString());
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Modal de confirmación
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchProfesionales();
  }, []);

  const fetchProfesionales = async () => {
    try {
      setLoading(true);
      const res = await professionalService.getAll({ estado: 'ACTIVO' });
      if (res.success && Array.isArray(res.data)) {
        setProfesionales(res.data);
        if (res.data.length > 0) {
          setSelectedProf(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Error cargando profesionales:', err);
      setNotification({ type: 'error', message: 'No se pudo cargar la lista de profesionales.' });
    } finally {
      setLoading(false);
    }
  };

  // Cargar disponibilidad semanal cuando cambia el profesional seleccionado
  useEffect(() => {
    if (selectedProf?.id_profesional) {
      fetchDisponibilidadSemanal(selectedProf.id_profesional);
    }
  }, [selectedProf]);

  const fetchDisponibilidadSemanal = async (profId) => {
    try {
      setLoadingDisp(true);
      const res = await professionalService.getDisponibilidad(profId);
      if (res.success && Array.isArray(res.data)) {
        setDisponibilidades(res.data.filter((d) => d.activo));
      } else {
        setDisponibilidades([]);
      }
    } catch (err) {
      console.error('Error cargando disponibilidad semanal:', err);
      setDisponibilidades([]);
    } finally {
      setLoadingDisp(false);
    }
  };

  // Cargar slots libres cuando cambia el profesional o la fecha
  useEffect(() => {
    if (selectedProf && fechaSeleccionada) {
      fetchSlots(selectedProf.id_profesional, fechaSeleccionada);
    }
  }, [selectedProf, fechaSeleccionada]);

  const fetchSlots = async (profId, fecha) => {
    try {
      setLoadingSlots(true);
      setSlots([]);
      const res = await professionalService.getHorariosLibres(profId, fecha);
      if (res.success && Array.isArray(res.data)) {
        setSlots(res.data);
      }
    } catch (err) {
      console.error('Error consultando horarios:', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    setConfirmModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedProf || !selectedSlot) return;

    try {
      setBookingLoading(true);
      setNotification(null);

      const res = await appointmentService.create({
        id_paciente: user?.perfil?.id_paciente,
        id_profesional: selectedProf.id_profesional,
        fecha_hora_inicio: selectedSlot.inicio_iso,
        fecha_hora_fin: selectedSlot.fin_iso,
        tipo: 'INICIAL',
      });

      if (res.success) {
        setConfirmModalOpen(false);
        setNotification({
          type: 'success',
          title: 'Cita creada',
          message: `¡Cita programada con éxito para el ${selectedSlot.fecha} de ${selectedSlot.hora_inicio} a ${selectedSlot.hora_fin}!`,
        });
        // Refrescar slots disponibles para actualizar franjas
        fetchSlots(selectedProf.id_profesional, fechaSeleccionada);
      }
    } catch (err) {
      setNotification({
        type: 'error',
        title: 'Conflicto de Horario',
        message: err.message || 'Hubo un conflicto con el horario seleccionado. Por favor intente con otro horario.',
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const profesionalesFiltrados = profesionales.filter((p) => {
    if (!busquedaProf.trim()) return true;
    const term = busquedaProf.toLowerCase().trim();
    const nombreCompleto = `${p.nombres || ''} ${p.apellidos || ''}`.toLowerCase();
    return nombreCompleto.includes(term);
  });

  if (loading) return <Loader message="Cargando catálogo de profesionales..." />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Profesionales y Disponibilidad de Citas
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Selecciona un profesional de salud psicológica y consulta los horarios libres para agendar tu cita inicial.
        </p>
      </div>

      {notification && (
        <Alert
          type={notification.type}
          onClose={() => setNotification(null)}
          autoClose={5000}
          title={notification.title || (notification.type === 'success' ? 'Cita creada' : 'Aviso')}
        >
          {notification.message}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Lista de Profesionales */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Profesionales Disponibles ({profesionalesFiltrados.length})
            </p>
          </div>

          {/* Filtro de búsqueda de profesional */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar profesional..."
              value={busquedaProf}
              onChange={(e) => setBusquedaProf(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {profesionalesFiltrados.map((prof) => {
              const isSelected = selectedProf?.id_profesional === prof.id_profesional;
              return (
                <div
                  key={prof.id_profesional}
                  onClick={() => setSelectedProf(prof)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-primary-50/70 dark:bg-primary-950/40 border-primary-500 dark:border-primary-500 shadow-sm ring-1 ring-primary-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isSelected
                          ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {prof.nombres.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        Lic. {prof.nombres} {prof.apellidos}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Atención y Evaluación Psicológica
                      </p>
                      <span className="inline-block mt-1 text-[11px] text-primary-700 dark:text-primary-400 font-medium">
                        {prof.telefono || 'Atención en consultorio'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-slate-300 dark:text-slate-600'}`} />
                </div>
              );
            })}

            {profesionalesFiltrados.length === 0 && (
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">
                No se encontraron profesionales con ese nombre.
              </p>
            )}
          </div>
        </div>

        {/* Columna Derecha: Horarios y Disponibilidad */}
        <div className="lg:col-span-2 space-y-4">
          <Card
            title={
              selectedProf
                ? `Horarios con Lic. ${selectedProf.nombres} ${selectedProf.apellidos}`
                : 'Seleccione un profesional'
            }
            subtitle="Consulta la disponibilidad en tiempo real y reserva tu cita"
          >
            {selectedProf ? (
              <div className="space-y-6">
                {/* Días de atención configurados */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    <CalendarCheck2 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    <span>Días de Atención Semanal</span>
                  </div>

                  {loadingDisp ? (
                    <p className="text-xs text-slate-400">Consultando días de atención...</p>
                  ) : disponibilidades.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {disponibilidades.map((d) => (
                        <span
                          key={d.id_disponibilidad}
                          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300 shadow-2xs"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <strong>{DIAS_SEMANA_NOMBRES[d.dia_semana] || `Día ${d.dia_semana}`}:</strong>{' '}
                          {d.hora_inicio?.substring(0, 5)} - {d.hora_fin?.substring(0, 5)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      El profesional aún no tiene horarios semanales activos configurados.
                    </p>
                  )}
                </div>

                {/* Selector de Fecha */}
                <div className="bg-primary-50/40 dark:bg-slate-800/40 p-4 rounded-xl border border-primary-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <label htmlFor="fecha" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Fecha para la Consulta
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Selecciona un día que coincida con los días de atención arriba
                    </p>
                  </div>
                  <input
                    id="fecha"
                    type="date"
                    min={getLocalDateString()}
                    value={fechaSeleccionada}
                    onChange={(e) => setFechaSeleccionada(e.target.value)}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-2xs"
                  />
                </div>

                {/* Grilla de Franjas Libres */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Franjas Horarias Disponibles ({slots.length})
                    </p>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Sesiones de 60 minutos
                    </span>
                  </div>

                  {loadingSlots ? (
                    <Loader message="Comprobando disponibilidad y detección de conflictos..." />
                  ) : slots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {slots.map((slot, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSlotClick(slot)}
                          className="group p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-950/30 text-left transition-all shadow-2xs hover:shadow-md flex flex-col items-center justify-center text-center cursor-pointer"
                        >
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-700 dark:group-hover:text-primary-300">
                            {slot.hora_inicio} - {slot.hora_fin}
                          </span>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Disponible
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      <CalendarDays className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        No hay horarios libres para la fecha seleccionada ({fechaSeleccionada})
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                        Verifica que la fecha seleccionada coincida con los días de atención semanal del profesional indicados arriba.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Seleccione un profesional de la lista izquierda.
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Modal de Confirmación de Cita */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirmar Solicitud de Cita Inicial"
      >
        {selectedSlot && selectedProf && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Estás a punto de reservar una cita de atención inicial con los siguientes datos:
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Profesional:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  Lic. {selectedProf.nombres} {selectedProf.apellidos}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Fecha:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100 capitalize">
                  {formatDateUTC(selectedSlot.inicio_iso, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Horario:</span>
                <span className="font-semibold text-primary-700 dark:text-primary-300">
                  {selectedSlot.hora_inicio} a {selectedSlot.hora_fin} (60 min)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Tipo de Cita:</span>
                <Badge status="PROGRAMADA">INICIAL</Badge>
              </div>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 p-3 rounded-lg text-amber-800 dark:text-amber-300">
              <strong>Validación en tiempo real:</strong> El sistema comprobará la disponibilidad del consultorio y profesional antes de confirmar la reserva.
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setConfirmModalOpen(false)}
                disabled={bookingLoading}
              >
                Cancelar
              </Button>
              <Button onClick={handleConfirmBooking} loading={bookingLoading}>
                Confirmar y Reservar Cita
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientProfessionals;
