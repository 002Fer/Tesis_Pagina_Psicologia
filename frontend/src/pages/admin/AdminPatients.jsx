import React, { useState, useEffect } from 'react';
import patientService from '../../services/patientService';
import professionalService from '../../services/professionalService';
import followUpService from '../../services/followUpService';
import { Users, Search, Plus, UserPlus, Phone, Calendar, HeartPulse, ShieldAlert, ShieldCheck } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import { calculateAge, isMinor } from '../../utils/date.utils';
import { validateEmail } from '../../utils/email.utils';

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
  const [respData, setRespData] = useState({
    nombres: '',
    apellidos: '',
    parentesco: 'Madre',
    telefono: '',
    correo: '',
  });
  const [saving, setSaving] = useState(false);

  const edadModal = calculateAge(formData.fecha_nacimiento);
  const esMenorModal = isMinor(formData.fecha_nacimiento);

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
    if (esMenorModal) {
      if (!respData.nombres.trim() || !respData.apellidos.trim()) {
        setNotification({ type: 'error', message: 'Para pacientes menores de 18 años, debe registrar los nombres y apellidos del tutor legal.' });
        return;
      }
      if (!respData.telefono.trim()) {
        setNotification({ type: 'error', message: 'Debe ingresar el teléfono del tutor legal responsable.' });
        return;
      }
      if (respData.correo.trim()) {
        const emailVal = validateEmail(respData.correo);
        if (!emailVal.isValid) {
          setNotification({ type: 'error', message: `Correo del tutor inválido: ${emailVal.errorMessage}` });
          return;
        }
      }
    }

    try {
      setSaving(true);
      setNotification(null);
      const payload = {
        ...formData,
        responsable: esMenorModal ? respData : null,
      };
      const res = await patientService.create(payload);
      if (res.success) {
        setCreateModalOpen(false);
        setFormData({ nombres: '', apellidos: '', fecha_nacimiento: '', telefono: '', estado: 'SOLICITANTE' });
        setRespData({ nombres: '', apellidos: '', parentesco: 'Madre', telefono: '', correo: '' });
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
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Directorio de Pacientes</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Supervisa los expedientes, estado de atención y asignaciones de terapeutas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-[#111827] dark:border-slate-700 dark:text-slate-200"
          >
            <option value="" className="dark:bg-[#111827]">Todos los Estados</option>
            <option value="SOLICITANTE" className="dark:bg-[#111827]">Solicitante</option>
            <option value="EN_ESPERA" className="dark:bg-[#111827]">En Espera</option>
            <option value="ACTIVO" className="dark:bg-[#111827]">Activo</option>
            <option value="FINALIZADO" className="dark:bg-[#111827]">Finalizado</option>
            <option value="BAJA" className="dark:bg-[#111827]">Baja</option>
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
              <tr className="border-b border-slate-100 dark:border-slate-700/50 text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                <th className="pb-3 px-3">Expediente / Nombre</th>
                <th className="pb-3 px-3">Contacto</th>
                <th className="pb-3 px-3">Estado</th>
                <th className="pb-3 px-3">Profesional Vinculado</th>
                <th className="pb-3 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {pacientesFiltrados.map((pac) => {
                const edad = calculateAge(pac.fecha_nacimiento);
                const menor = isMinor(pac.fecha_nacimiento);
                const tutor = pac.responsable_principal;

                return (
                  <tr key={pac.id_paciente} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                          {pac.nombres} {pac.apellidos}
                        </p>
                        {edad !== null && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              menor
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {menor ? `Menor (${edad} a.)` : `Mayor (${edad} a.)`}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">Expediente #{pac.id_paciente}</p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="text-slate-700 dark:text-slate-200">{pac.telefono || 'Sin teléfono'}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">{pac.correo || 'Sin correo asociado'}</p>
                      {menor && tutor && (
                        <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium mt-0.5">
                          Tutor: {tutor.nombres} {tutor.apellidos} ({tutor.parentesco || 'Tutor'}) • Tel: {tutor.telefono || 'S/T'}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <Badge status={pac.estado} />
                    </td>
                    <td className="py-3 px-3">
                      {pac.prof_nombres ? (
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          Lic. {pac.prof_nombres} {pac.prof_apellidos}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic">Sin asignar</span>
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
                );
              })}
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

          {/* Indicador de menor/mayor de edad */}
          {formData.fecha_nacimiento && edadModal !== null && (
            <div>
              {esMenorModal ? (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>
                    Paciente <strong>Menor de Edad ({edadModal} años)</strong>. Se requieren datos del tutor legal.
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Paciente Mayor de Edad ({edadModal} años)</span>
                </div>
              )}
            </div>
          )}

          {/* Sección Tutor Legal para Menor de Edad */}
          {esMenorModal && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-amber-200 dark:border-amber-800/50 space-y-3">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Datos del Padre, Madre o Tutor Legal Responsable
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="resp_nombres"
                  label="Nombres del Tutor"
                  required
                  value={respData.nombres}
                  onChange={(e) => setRespData({ ...respData, nombres: e.target.value })}
                />
                <Input
                  id="resp_apellidos"
                  label="Apellidos del Tutor"
                  required
                  value={respData.apellidos}
                  onChange={(e) => setRespData({ ...respData, apellidos: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  id="resp_parentesco"
                  label="Parentesco"
                  value={respData.parentesco}
                  onChange={(e) => setRespData({ ...respData, parentesco: e.target.value })}
                  placeholder=""
                  options={[
                    { value: 'Madre', label: 'Madre' },
                    { value: 'Padre', label: 'Padre' },
                    { value: 'Tutor Legal', label: 'Tutor Legal' },
                    { value: 'Abuelo/a', label: 'Abuelo/a' },
                    { value: 'Tío/a', label: 'Tío/a' },
                    { value: 'Otro', label: 'Otro' },
                  ]}
                />
                <Input
                  id="resp_telefono"
                  label="Teléfono del Tutor"
                  required
                  value={respData.telefono}
                  onChange={(e) => setRespData({ ...respData, telefono: e.target.value })}
                />
              </div>

              <Input
                id="resp_correo"
                label="Correo del Tutor (Opcional)"
                type="email"
                value={respData.correo}
                onChange={(e) => setRespData({ ...respData, correo: e.target.value })}
              />
            </div>
          )}

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
            <p className="text-sm text-slate-600 dark:text-slate-300">
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
