import React, { useState, useEffect } from 'react';
import patientService from '../../services/patientService';
import professionalService from '../../services/professionalService';
import followUpService from '../../services/followUpService';
import { Users, Search, Plus, UserPlus, Phone, Calendar, HeartPulse } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';

export const AdminPatients = () => {
  const [pacientes, setPacientes] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [notification, setNotification] = useState(null);

  // Modal Registrar Paciente
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '',
    telefono: '',
    estado: 'SOLICITANTE',
  });
  const [saving, setSaving] = useState(false);

  // Modal Asignar Profesional
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedProfId, setSelectedProfId] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filtroEstado]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtroEstado) params.estado = filtroEstado;

      const [pacRes, profRes] = await Promise.all([
        patientService.getAll(params),
        professionalService.getAll({ estado: 'ACTIVO' }),
      ]);

      if (pacRes.success && Array.isArray(pacRes.data)) {
        setPacientes(pacRes.data);
      }
      if (profRes.success && Array.isArray(profRes.data)) {
        setProfesionales(profRes.data);
      }
    } catch (err) {
      console.error('Error cargando pacientes:', err);
      setNotification({ type: 'error', message: 'No se pudo cargar el directorio de pacientes.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setNotification(null);
      const res = await patientService.create(formData);
      if (res.success) {
        setCreateModalOpen(false);
        setFormData({ nombres: '', apellidos: '', fecha_nacimiento: '', telefono: '', estado: 'SOLICITANTE' });
        setNotification({ type: 'success', message: 'Paciente registrado exitosamente.' });
        fetchData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Error al registrar paciente.' });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAssign = (paciente) => {
    setSelectedPatient(paciente);
    setSelectedProfId(paciente.id_profesional || '');
    setAssignModalOpen(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedPatient || !selectedProfId) return;
    try {
      setAssigning(true);
      const res = await followUpService.vincular({
        id_paciente: selectedPatient.id_paciente,
        id_profesional: parseInt(selectedProfId, 10),
        origen: 'ASIGNACION_ADMINISTRATIVA',
      });

      if (res.success) {
        setAssignModalOpen(false);
        setNotification({
          type: 'success',
          message: 'Asignación administrativa realizada exitosamente.',
        });
        fetchData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Error al asignar profesional.' });
    } finally {
      setAssigning(false);
    }
  };

  const pacientesFiltrados = pacientes.filter((p) => {
    const full = `${p.nombres} ${p.apellidos} ${p.correo || ''}`.toLowerCase();
    return full.includes(search.toLowerCase());
  });

  if (loading) return <Loader message="Cargando directorio de pacientes..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Directorio de Pacientes</h2>
          <p className="text-sm text-slate-500 mt-1">
            Supervisa los expedientes, estado de atención y asignaciones de terapeutas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos los Estados</option>
            <option value="SOLICITANTE">Solicitante</option>
            <option value="EN_ESPERA">En Espera</option>
            <option value="ACTIVO">Activo</option>
            <option value="FINALIZADO">Finalizado</option>
            <option value="BAJA">Baja</option>
          </select>

          <Button onClick={() => setCreateModalOpen(true)} icon={Plus}>
            Registrar Paciente
          </Button>
        </div>
      </div>

      {notification && (
        <Alert type={notification.type} onClose={() => setNotification(null)}>
          {notification.message}
        </Alert>
      )}

      {/* Tabla de Pacientes */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 px-3">Expediente / Nombre</th>
                <th className="pb-3 px-3">Contacto</th>
                <th className="pb-3 px-3">Estado</th>
                <th className="pb-3 px-3">Profesional Vinculado</th>
                <th className="pb-3 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pacientesFiltrados.map((pac) => (
                <tr key={pac.id_paciente} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-800 text-sm">
                      {pac.nombres} {pac.apellidos}
                    </p>
                    <p className="text-[11px] text-slate-400">Expediente #{pac.id_paciente}</p>
                  </td>
                  <td className="py-3 px-3">
                    <p className="text-slate-700">{pac.telefono || 'Sin teléfono'}</p>
                    <p className="text-[11px] text-slate-400">{pac.correo || 'Sin correo asociado'}</p>
                  </td>
                  <td className="py-3 px-3">
                    <Badge status={pac.estado} />
                  </td>
                  <td className="py-3 px-3">
                    {pac.prof_nombres ? (
                      <span className="font-semibold text-slate-700">
                        Lic. {pac.prof_nombres} {pac.prof_apellidos}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Sin asignar</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleOpenAssign(pac)}
                      icon={HeartPulse}
                    >
                      Asignar Terapeuta
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Registrar Paciente */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Registrar Paciente">
        <form onSubmit={handleCreatePatient} className="space-y-4">
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

          <div className="grid grid-cols-2 gap-3">
            <Input
              id="telefono"
              label="Teléfono"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            />
            <Input
              id="fecha_nacimiento"
              label="Fecha de Nacimiento"
              type="date"
              value={formData.fecha_nacimiento}
              onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
            />
          </div>

          <Select
            id="estado"
            label="Estado Administrativo Inicial"
            value={formData.estado}
            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
            placeholder=""
            options={[
              { value: 'SOLICITANTE', label: 'Solicitante' },
              { value: 'EN_ESPERA', label: 'En Espera' },
              { value: 'ACTIVO', label: 'Activo' },
            ]}
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Registrar Paciente
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Asignar Profesional */}
      <Modal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Asignación Administrativa">
        {selectedPatient && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Asignar profesional responsable a <strong>{selectedPatient.nombres} {selectedPatient.apellidos}</strong>.
            </p>

            <Select
              id="prof"
              label="Profesional Responsable"
              value={selectedProfId}
              onChange={(e) => setSelectedProfId(e.target.value)}
              placeholder="Seleccione un profesional"
              options={profesionales.map((p) => ({
                value: p.id_profesional.toString(),
                label: `Lic. ${p.nombres} ${p.apellidos}`,
              }))}
            />

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="secondary" onClick={() => setAssignModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmAssign} loading={assigning} disabled={!selectedProfId}>
                Confirmar Asignación
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminPatients;
