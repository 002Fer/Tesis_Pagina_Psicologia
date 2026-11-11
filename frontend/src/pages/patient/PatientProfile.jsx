import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import patientService from '../../services/patientService';
import { User, Phone, Calendar, Mail, ShieldAlert, Plus, Users, Save } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';

export const PatientProfile = () => {
  const { user } = useAuth();
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Formulario de edición datos personales
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    telefono: '',
    fecha_nacimiento: '',
  });
  const [saving, setSaving] = useState(false);

  // Modal para agregar responsable
  const [modalOpen, setModalOpen] = useState(false);
  const [respData, setRespData] = useState({
    nombres: '',
    apellidos: '',
    parentesco: '',
    telefono: '',
    correo: '',
  });
  const [addingResp, setAddingResp] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      if (user?.perfil?.id_paciente) {
        const res = await patientService.getById(user.perfil.id_paciente);
        if (res.success && res.data) {
          setPaciente(res.data);
          setFormData({
            nombres: res.data.nombres || '',
            apellidos: res.data.apellidos || '',
            telefono: res.data.telefono || '',
            fecha_nacimiento: res.data.fecha_nacimiento ? res.data.fecha_nacimiento.split('T')[0] : '',
          });
        }
      }
    } catch (err) {
      console.error('Error cargando perfil:', err);
      setNotification({ type: 'error', message: 'No se pudo cargar la información del perfil.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setNotification(null);
      const res = await patientService.update(paciente.id_paciente, formData);
      if (res.success) {
        setNotification({ type: 'success', message: 'Tus datos han sido actualizados con éxito.' });
        fetchProfile();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Error al actualizar el perfil.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddResponsable = async (e) => {
    e.preventDefault();
    try {
      setAddingResp(true);
      const res = await patientService.addResponsable(paciente.id_paciente, respData);
      if (res.success) {
        setModalOpen(false);
        setRespData({ nombres: '', apellidos: '', parentesco: '', telefono: '', correo: '' });
        setNotification({ type: 'success', message: 'Contacto responsable agregado.' });
        fetchProfile();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Error al agregar responsable.' });
    } finally {
      setAddingResp(false);
    }
  };

  if (loading) return <Loader message="Cargando perfil del paciente..." />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Mi Perfil y Expediente</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Actualiza tus datos de contacto y administra a tus personas de contacto o responsables.
          </p>
        </div>
        <Badge status={paciente?.estado || 'ACTIVO'} />
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Datos Personales */}
        <div className="md:col-span-2">
          <Card
            title="Datos Personales"
            subtitle="Información registrada en tu expediente"
            className="dark:bg-[#111827] dark:border-slate-800 shadow-md dark:shadow-black/40"
          >
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="nombres"
                  label="Nombres"
                  required
                  value={formData.nombres}
                  onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                  icon={User}
                />
                <Input
                  id="apellidos"
                  label="Apellidos"
                  required
                  value={formData.apellidos}
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                  icon={User}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="telefono"
                  label="Teléfono de Contacto"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  icon={Phone}
                />
                <Input
                  id="fecha_nacimiento"
                  label="Fecha de Nacimiento"
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                  icon={Calendar}
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 font-bold text-sm px-5 py-2.5 rounded-xl text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-md shadow-teal-600/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* Resumen de Cuenta */}
        <div>
          <Card
            title="Detalles de Cuenta"
            className="dark:bg-[#111827] dark:border-slate-800 shadow-md dark:shadow-black/40"
          >
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block mb-0.5">Correo registrado</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{user?.correo}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500 block mb-0.5">Expediente #</span>
                <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">{paciente?.id_paciente}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500 block mb-0.5">Fecha de registro</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {paciente?.fecha_registro ? new Date(paciente.fecha_registro).toLocaleDateString('es-ES') : '-'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Responsables o Contactos de Emergencia */}
      <Card
        title="Contactos Responsables / Familiares"
        subtitle="Personas autorizadas o de apoyo para contacto administrativo"
        className="dark:bg-[#111827] dark:border-slate-800 shadow-md dark:shadow-black/40"
        action={
          <Button size="sm" variant="secondary" onClick={() => setModalOpen(true)} icon={Plus}>
            Agregar Contacto
          </Button>
        }
      >
        {paciente?.responsables && paciente.responsables.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {paciente.responsables.map((resp) => (
              <div key={resp.id_responsable} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0b0f19]">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                    {resp.nombres} {resp.apellidos}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                    {resp.parentesco || 'Responsable'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 space-y-1 mt-2">
                  {resp.telefono && <p>Teléfono: <strong>{resp.telefono}</strong></p>}
                  {resp.correo && <p>Correo: <strong>{resp.correo}</strong></p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-xs">
            No tienes contactos responsables registrados. Puedes agregar uno en cualquier momento.
          </div>
        )}
      </Card>

      {/* Modal Agregar Responsable */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Agregar Contacto Responsable">
        <form onSubmit={handleAddResponsable} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="resp_nombres"
              label="Nombres"
              required
              value={respData.nombres}
              onChange={(e) => setRespData({ ...respData, nombres: e.target.value })}
            />
            <Input
              id="resp_apellidos"
              label="Apellidos"
              required
              value={respData.apellidos}
              onChange={(e) => setRespData({ ...respData, apellidos: e.target.value })}
            />
          </div>

          <Input
            id="parentesco"
            label="Parentesco o Relación"
            placeholder="Ej. Madre, Padre, Tutor, Cónyuge..."
            value={respData.parentesco}
            onChange={(e) => setRespData({ ...respData, parentesco: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              id="resp_telefono"
              label="Teléfono"
              value={respData.telefono}
              onChange={(e) => setRespData({ ...respData, telefono: e.target.value })}
            />
            <Input
              id="resp_correo"
              label="Correo"
              type="email"
              value={respData.correo}
              onChange={(e) => setRespData({ ...respData, correo: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={addingResp}>
              Guardar Contacto
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PatientProfile;
