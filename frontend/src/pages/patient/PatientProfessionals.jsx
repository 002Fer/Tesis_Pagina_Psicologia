import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import professionalService from '../../services/professionalService';
import appointmentService from '../../services/appointmentService';
import { HeartPulse, Calendar, Clock, Check, AlertCircle, Sparkles, ChevronRight } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';

export const PatientProfessionals = () => {
  const { user } = useAuth();
  const [profesionales, setProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProf, setSelectedProf] = useState(null);

  // Fecha seleccionada (default: fecha de mañana en formato YYYY-MM-DD)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [fechaSeleccionada, setFechaSeleccionada] = useState(defaultDateStr);
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
          message: `¡Cita programada con éxito para el ${selectedSlot.fecha} de ${selectedSlot.hora_inicio} a ${selectedSlot.hora_fin}!`,
        });
        // Refrescar slots disponibles
        fetchSlots(selectedProf.id_profesional, fechaSeleccionada);
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Hubo un conflicto con el horario seleccionado. Por favor intente con otro horario.',
      });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <Loader message="Cargando catálogo de profesionales..." />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Profesionales y Disponibilidad de Citas</h2>
        <p className="text-sm text-slate-500 mt-1">
          Selecciona un profesional de salud psicológica y consulta los horarios libres para agendar tu cita inicial.
        </p>
      </div>

      {notification && (
        <Alert
          type={notification.type}
          onClose={() => setNotification(null)}
          title={notification.type === 'success' ? 'Operación Exitosa' : 'Aviso'}
        >
          {notification.message}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Lista de Profesionales */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Profesionales Disponibles ({profesionales.length})
          </p>

          {profesionales.map((prof) => {
            const isSelected = selectedProf?.id_profesional === prof.id_profesional;
            return (
              <div
                key={prof.id_profesional}
                onClick={() => setSelectedProf(prof)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-primary-50/70 border-primary-500 shadow-sm ring-1 ring-primary-500'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isSelected ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {prof.nombres.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Lic. {prof.nombres} {prof.apellidos}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">Atención y Evaluación Psicológica</p>
                    <span className="inline-block mt-1 text-[11px] text-primary-700 font-medium">
                      {prof.telefono || 'Atención en consultorio'}
                    </span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-primary-600' : 'text-slate-300'}`} />
              </div>
            );
          })}
        </div>

        {/* Columna Derecha: Selector de Fecha y Slots */}
        <div className="lg:col-span-2">
          <Card
            title={
              selectedProf
                ? `Horarios disponibles con Lic. ${selectedProf.nombres} ${selectedProf.apellidos}`
                : 'Seleccione un profesional'
            }
            subtitle="Consulta la disponibilidad en tiempo real"
          >
            {selectedProf ? (
              <div className="space-y-6">
                {/* Selector de Fecha */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <label htmlFor="fecha" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Fecha para la Consulta
                    </label>
                    <p className="text-xs text-slate-500">Selecciona el día que deseas acudir</p>
                  </div>
                  <input
                    id="fecha"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={fechaSeleccionada}
                    onChange={(e) => setFechaSeleccionada(e.target.value)}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white shadow-sm"
                  />
                </div>

                {/* Grilla de Slots */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Franjas Horarias Disponibles ({slots.length})
                    </p>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
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
                          className="group p-3.5 rounded-xl border border-slate-200 bg-white hover:border-primary-500 hover:bg-primary-50/50 text-left transition-all shadow-sm hover:shadow-md flex flex-col items-center justify-center text-center"
                        >
                          <span className="text-sm font-bold text-slate-800 group-hover:text-primary-700">
                            {slot.hora_inicio} - {slot.hora_fin}
                          </span>
                          <span className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Disponible
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
                      <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-600">No hay horarios libres para esta fecha</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        El profesional no tiene franjas activas o todas las citas ya han sido ocupadas. Intenta seleccionando otro día.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Seleccione un profesional de la lista izquierda.</p>
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
            <p className="text-sm text-slate-600">
              Estás a punto de reservar una cita de atención inicial con los siguientes datos:
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Profesional:</span>
                <span className="font-bold text-slate-800">
                  Lic. {selectedProf.nombres} {selectedProf.apellidos}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fecha:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(selectedSlot.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Horario:</span>
                <span className="font-semibold text-primary-700">
                  {selectedSlot.hora_inicio} a {selectedSlot.hora_fin} (60 min)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tipo de Cita:</span>
                <Badge status="PROGRAMADA">INICIAL</Badge>
              </div>
            </div>

            <div className="text-xs text-slate-500 bg-amber-50 border border-amber-200/60 p-3 rounded-lg text-amber-800">
              <strong>Validación de conflictos:</strong> El sistema validará en tiempo real la disponibilidad del consultorio y profesional antes de confirmar.
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setConfirmModalOpen(false)} disabled={bookingLoading}>
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
