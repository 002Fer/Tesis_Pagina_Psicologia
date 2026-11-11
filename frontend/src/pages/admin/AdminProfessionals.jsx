import React, { useState, useEffect } from 'react';
import professionalService from '../../services/professionalService';
import { HeartPulse, Plus, Search, Phone, Mail, CheckCircle2, XCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import PasswordRequirements from '../../components/common/PasswordRequirements';
import { validatePassword } from '../../utils/password.utils';

export const AdminProfessionals = () => {
  const [profesionales, setProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState(null);

  // Modal Crear Profesional
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    password: '',
    telefono: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const res = await professionalService.getAll();
      if (res.success && Array.isArray(res.data)) {
        setProfesionales(res.data);
      }
    } catch (err) {
      console.error('Error cargando profesionales:', err);
      setNotification({ type: 'error', message: 'No se pudo cargar el directorio de profesionales.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfessional = async (e) => {
    e.preventDefault();
    setNotification(null);

    const val = validatePassword(formData.password);
    if (!val.isValid) {
      setNotification({ type: 'error', message: val.errorMessage });
      return;
    }

    try {
      setSaving(true);
      const res = await professionalService.create(formData);
      if (res.success) {
        setModalOpen(false);
        setFormData({ nombres: '', apellidos: '', correo: '', password: '', telefono: '' });
        setNotification({ type: 'success', message: 'Profesional registrado exitosamente.' });
        fetchProfessionals();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Error al registrar profesional.' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEstado = async (prof) => {
    const nuevoEstado = prof.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    try {
      const res = await professionalService.update(prof.id_profesional, { estado: nuevoEstado });
      if (res.success) {
        setNotification({ type: 'success', message: `Estado del profesional actualizado a ${nuevoEstado}.` });
        fetchProfessionals();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Error al actualizar estado.' });
    }
  };

  const profesionalesFiltrados = profesionales.filter((p) => {
    const full = `${p.nombres} ${p.apellidos} ${p.correo || ''}`.toLowerCase();
    return full.includes(search.toLowerCase());
  });

  if (loading) return <Loader message="Cargando profesionales..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Equipo de Profesionales</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Administra a los psicólogos y terapeutas habilitados en la plataforma.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Buscar profesional..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-[#111827] dark:border-slate-700 dark:text-slate-200"
            />
          </div>
          <Button onClick={() => setModalOpen(true)} icon={Plus}>
            Nuevo Profesional
          </Button>
        </div>
      </div>

      {notification && (
        <Alert type={notification.type} onClose={() => setNotification(null)}>
          {notification.message}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profesionalesFiltrados.map((prof) => (
          <div
            key={prof.id_profesional}
            className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-glow-teal/5 transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-11 h-11 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-bold flex items-center justify-center text-sm">
                  {prof.nombres.charAt(0)}
                </div>
                <Badge status={prof.estado} />
              </div>

              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Lic. {prof.nombres} {prof.apellidos}
              </h4>
              <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-0.5">Atención Psicológica</p>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>{prof.correo}</span>
                </div>
                {prof.telefono && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>{prof.telefono}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex justify-end">
              <Button
                size="sm"
                variant={prof.estado === 'ACTIVO' ? 'secondary' : 'primary'}
                onClick={() => handleToggleEstado(prof)}
              >
                {prof.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Crear Profesional */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Nuevo Profesional">
        <form onSubmit={handleCreateProfessional} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="nombres"
              label="Nombres"
              required
              value={formData.nombres}
              onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
            />
            <Input
              id="apellidos"
              label="Apellidos"
              required
              value={formData.apellidos}
              onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
            />
          </div>

          <Input
            id="correo"
            label="Correo Electrónico"
            type="email"
            required
            value={formData.correo}
            onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
          />

          <Input
            id="password"
            label="Contraseña Inicial"
            type="password"
            required
            placeholder="Mín. 8 caracteres, mayús, núm, símb"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <PasswordRequirements password={formData.password} />

          <Input
            id="telefono"
            label="Teléfono / Contacto"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Registrar Profesional
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminProfessionals;
