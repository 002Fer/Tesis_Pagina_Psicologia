import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import professionalService from '../../services/professionalService';
import { Clock, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';

export const ProfessionalAvailability = () => {
  const { user } = useAuth();
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Modal Agregar
  const [modalOpen, setModalOpen] = useState(false);
  const [diaSemana, setDiaSemana] = useState('1');
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('14:00');
  const [saving, setSaving] = useState(false);

  const diasMap = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
    7: 'Domingo',
  };

  useEffect(() => {
    fetchDisponibilidad();
  }, [user]);

  const fetchDisponibilidad = async () => {
    try {
      setLoading(true);
      if (user?.perfil?.id_profesional) {
        const res = await professionalService.getDisponibilidad(user.perfil.id_profesional);
        if (res.success && Array.isArray(res.data)) {
          setDisponibilidad(res.data);
        }
      }
    } catch (err) {
      console.error('Error cargando disponibilidad:', err);
      setNotification({ type: 'error', message: 'No se pudo cargar la configuración de horarios.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (horaInicio >= horaFin) {
      setNotification({ type: 'error', message: 'La hora de inicio debe ser anterior a la hora de fin.' });
      return;
    }

    try {
      setSaving(true);
      setNotification(null);
      const res = await professionalService.addDisponibilidad(user.perfil.id_profesional, {
        dia_semana: parseInt(diaSemana, 10),
        hora_inicio: `${horaInicio}:00`,
        hora_fin: `${horaFin}:00`,
      });

      if (res.success) {
        setModalOpen(false);
        setNotification({ type: 'success', message: 'Franja de disponibilidad agregada correctamente.' });
        fetchDisponibilidad();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Error al guardar la franja horaria.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async (idDisp) => {
    if (!window.confirm('¿Seguro que deseas desactivar esta franja de disponibilidad?')) return;
    try {
      const res = await professionalService.deleteDisponibilidad(user.perfil.id_profesional, idDisp);
      if (res.success) {
        setNotification({ type: 'success', message: 'Franja horaria desactivada.' });
        fetchDisponibilidad();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Error al desactivar el horario.' });
    }
  };

  // Agrupar por día
  const slotsPorDia = [1, 2, 3, 4, 5, 6, 7].map((d) => ({
    diaNum: d,
    nombre: diasMap[d],
    franjas: disponibilidad.filter((slot) => slot.dia_semana === d),
  }));

  if (loading) return <Loader message="Cargando configuración de horarios..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mi Disponibilidad de Atención</h2>
          <p className="text-sm text-slate-500 mt-1">
            Configura los días y franjas horarias en las que ofreces atención para que los pacientes puedan agendar citas.
          </p>
        </div>

        <Button onClick={() => setModalOpen(true)} icon={Plus}>
          Agregar Franja Horaria
        </Button>
      </div>

      {notification && (
        <Alert type={notification.type} onClose={() => setNotification(null)}>
          {notification.message}
        </Alert>
      )}

      {/* Vista de Calendario Semanal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {slotsPorDia.map((dia) => (
          <div
            key={dia.diaNum}
            className={`rounded-2xl border p-4 transition-all ${
              dia.franjas.length > 0 ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50/70 border-dashed border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h4 className="text-sm font-bold text-slate-800">{dia.nombre}</h4>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  dia.franjas.length > 0 ? 'bg-primary-50 text-primary-700' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {dia.franjas.length} {dia.franjas.length === 1 ? 'franja' : 'franjas'}
              </span>
            </div>

            {dia.franjas.length > 0 ? (
              <div className="space-y-2">
                {dia.franjas.map((slot) => (
                  <div
                    key={slot.id_disponibilidad}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 group"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-primary-600" />
                      <span className="text-xs font-semibold text-slate-700">
                        {slot.hora_inicio.substring(0, 5)} - {slot.hora_fin.substring(0, 5)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteSlot(slot.id_disponibilidad)}
                      className="text-slate-300 hover:text-rose-600 p-1 rounded transition-colors opacity-70 group-hover:opacity-100"
                      title="Eliminar franja"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">Sin atención este día</p>
            )}
          </div>
        ))}
      </div>

      {/* Modal Agregar Horario */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Agregar Franja de Disponibilidad">
        <form onSubmit={handleAddSlot} className="space-y-4">
          <Select
            id="dia"
            label="Día de la Semana"
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
              { value: '7', label: 'Domingo' },
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Hora de Inicio
              </label>
              <input
                type="time"
                required
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Hora de Fin
              </label>
              <input
                type="time"
                required
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Guardar Horario
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfessionalAvailability;
