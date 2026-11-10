import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import authService from '../../services/authService';
import { UserCheck, Search, Plus, Mail, Shield, User } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import PasswordRequirements from '../../components/common/PasswordRequirements';
import { validatePassword } from '../../utils/password.utils';

export const AdminUsers = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState(null);

  // Modal Crear Usuario
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    correo: '',
    password: '',
    nombres: '',
    apellidos: '',
    id_rol: '2', // Default: PROFESIONAL
    telefono: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Podemos consultar los usuarios a través de profesionales y pacientes o un endpoint directo
      const [profRes, pacRes] = await Promise.all([
        api.get('/profesionales'),
        api.get('/pacientes'),
      ]);

      const lista = [];
      if (profRes.success && Array.isArray(profRes.data)) {
        profRes.data.forEach((p) => {
          lista.push({
            id_usuario: p.id_usuario,
            correo: p.correo,
            rol: 'PROFESIONAL',
            nombres: `${p.nombres} ${p.apellidos}`,
            telefono: p.telefono,
            estado: p.estado,
            fecha_registro: p.fecha_registro,
          });
        });
      }
      if (pacRes.success && Array.isArray(pacRes.data)) {
        pacRes.data.forEach((p) => {
          lista.push({
            id_usuario: p.id_usuario || `p-${p.id_paciente}`,
            correo: p.correo || 'Sin correo',
            rol: 'PACIENTE',
            nombres: `${p.nombres} ${p.apellidos}`,
            telefono: p.telefono,
            estado: p.estado,
            fecha_registro: p.fecha_registro,
          });
        });
      }

      setUsuarios(lista);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      setNotification({ type: 'error', message: 'No se pudo cargar la lista de usuarios.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setNotification(null);

    const val = validatePassword(formData.password);
    if (!val.isValid) {
      setNotification({ type: 'error', message: val.errorMessage });
      return;
    }

    try {
      setSaving(true);
      const res = await authService.register({
        correo: formData.correo,
        password: formData.password,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        telefono: formData.telefono,
        id_rol: parseInt(formData.id_rol, 10),
      });

      if (res.success) {
        setModalOpen(false);
        setFormData({ correo: '', password: '', nombres: '', apellidos: '', id_rol: '2', telefono: '' });
        setNotification({ type: 'success', message: 'Usuario registrado exitosamente.' });
        fetchUsers();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Error al registrar usuario.' });
    } finally {
      setSaving(false);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const full = `${u.nombres} ${u.correo} ${u.rol}`.toLowerCase();
    return full.includes(search.toLowerCase());
  });

  if (loading) return <Loader message="Cargando directorio de usuarios..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Administración de Usuarios</h2>
          <p className="text-sm text-slate-500 mt-1">
            Gestión de credenciales, roles y accesos a la plataforma.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar usuario o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            />
          </div>
          <Button onClick={() => setModalOpen(true)} icon={Plus}>
            Crear Usuario
          </Button>
        </div>
      </div>

      {notification && (
        <Alert type={notification.type} onClose={() => setNotification(null)}>
          {notification.message}
        </Alert>
      )}

      {/* Tabla de Usuarios */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 px-3">Usuario / Nombre</th>
                <th className="pb-3 px-3">Correo Electrónico</th>
                <th className="pb-3 px-3">Rol Asignado</th>
                <th className="pb-3 px-3">Estado</th>
                <th className="pb-3 px-3">Fecha de Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuariosFiltrados.map((u, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-800">{u.nombres}</td>
                  <td className="py-3 px-3 text-slate-600">{u.correo}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.rol === 'ADMINISTRADOR'
                          ? 'bg-purple-50 text-purple-700'
                          : u.rol === 'PROFESIONAL'
                          ? 'bg-primary-50 text-primary-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {u.rol}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <Badge status={u.estado || 'ACTIVO'} />
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {u.fecha_registro ? new Date(u.fecha_registro).toLocaleDateString('es-ES') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Crear Usuario */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Nuevo Usuario">
        <form onSubmit={handleCreateUser} className="space-y-4">
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
            label="Contraseña"
            type="password"
            required
            placeholder="Mín. 8 caracteres, mayús, núm, símb"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <PasswordRequirements password={formData.password} />

          <Select
            id="id_rol"
            label="Tipo de Usuario (Rol)"
            value={formData.id_rol}
            onChange={(e) => setFormData({ ...formData, id_rol: e.target.value })}
            placeholder=""
            options={[
              { value: '1', label: 'Administrador / Coordinador' },
              { value: '2', label: 'Profesional de Atención Psicológica' },
              { value: '3', label: 'Paciente' },
            ]}
          />

          <Input
            id="telefono"
            label="Teléfono de Contacto"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Crear Usuario
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminUsers;
