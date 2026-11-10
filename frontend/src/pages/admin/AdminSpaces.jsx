import React, { useState, useEffect } from 'react';
import spaceService from '../../services/spaceService';
import { Building2, Plus, Edit2, CheckCircle2, XCircle, Search } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';

export const AdminSpaces = () => {
  const [espacios, setEspacios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Modal Crear Espacio
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    ubicacion: '',
    estado: 'DISPONIBLE',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      const res = await spaceService.getAll();
      if (res.success && Array.isArray(res.data)) {
        setEspacios(res.data);
      }
    } catch (err) {
      console.error('Error cargando espacios:', err);
      setNotification({ type: 'error', message: 'No se pudieron cargar los espacios clínicos.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSpace = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setNotification(null);
      const res = await spaceService.create(formData);
      if (res.success) {
        setModalOpen(false);
        setFormData({ nombre: '', descripcion: '', ubicacion: '', estado: 'DISPONIBLE' });
        setNotification({ type: 'success', message: 'Consultorio / Espacio creado con éxito.' });
        fetchSpaces();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Error al crear espacio.' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEstado = async (espacio) => {
    const nuevoEstado = espacio.estado === 'DISPONIBLE' ? 'NO_DISPONIBLE' : 'DISPONIBLE';
    try {
      const res = await spaceService.update(espacio.id_espacio, { estado: nuevoEstado });
      if (res.success) {
        setNotification({ type: 'success', message: `Espacio actualizado a ${nuevoEstado}.` });
        fetchSpaces();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Error al actualizar espacio.' });
    }
  };

  if (loading) return <Loader message="Cargando espacios clínicos..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Espacios de Atención Clínica</h2>
          <p className="text-sm text-slate-500 mt-1">
            Gestión y disponibilidad de consultorios físicos y salas telemáticas para sesiones psicológicas.
          </p>
        </div>

        <Button onClick={() => setModalOpen(true)} icon={Plus}>
          Nuevo Espacio
        </Button>
      </div>

      {notification && (
        <Alert type={notification.type} onClose={() => setNotification(null)}>
          {notification.message}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {espacios.map((esp) => (
          <div
            key={esp.id_espacio}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <Badge status={esp.estado} />
              </div>

              <h4 className="text-base font-bold text-slate-800">{esp.nombre}</h4>
              <p className="text-xs text-slate-500 mt-1">{esp.descripcion || 'Sin descripción adicional'}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <span className="text-slate-400">Ubicación: </span>
                <span className="font-semibold text-slate-700">{esp.ubicacion || 'Instalaciones Centrales'}</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <Button
                size="sm"
                variant={esp.estado === 'DISPONIBLE' ? 'secondary' : 'primary'}
                onClick={() => handleToggleEstado(esp)}
              >
                {esp.estado === 'DISPONIBLE' ? 'Marcar No Disponible' : 'Habilitar'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Crear Espacio */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Espacio de Atención">
        <form onSubmit={handleCreateSpace} className="space-y-4">
          <Input
            id="nombre"
            label="Nombre del Consultorio / Espacio"
            required
            placeholder="Ej. Consultorio 4 - Atención Infantil"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          />

          <Input
            id="ubicacion"
            label="Ubicación Física o Modalidad"
            placeholder="Ej. Piso 2 - Ala Norte / Sala Telemática"
            value={formData.ubicacion}
            onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Descripción del Espacio
            </label>
            <textarea
              id="descripcion"
              rows={3}
              placeholder="Equipamiento, propósito o características del consultorio..."
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <Select
            id="estado"
            label="Estado Inicial"
            value={formData.estado}
            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
            placeholder=""
            options={[
              { value: 'DISPONIBLE', label: 'Disponible' },
              { value: 'NO_DISPONIBLE', label: 'No Disponible / En mantenimiento' },
              { value: 'INACTIVO', label: 'Inactivo' },
            ]}
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Guardar Espacio
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminSpaces;
