import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import patientService from '../../services/patientService';
import { Users, Search, History, Calendar, User, Phone, FileText } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';

export const ProfessionalPatients = () => {
  const { user } = useAuth();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState(null);

  // Historial administrativo
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, [user]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await patientService.getAll();
      if (res.success && Array.isArray(res.data)) {
        setPacientes(res.data);
      }
    } catch (err) {
      console.error('Error cargando pacientes:', err);
      setNotification({ type: 'error', message: 'No se pudo cargar la lista de pacientes vinculados.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenHistorial = async (paciente) => {
    setSelectedPatient(paciente);
    setHistoryModalOpen(true);
    try {
      setLoadingHistorial(true);
      const res = await patientService.getHistorial(paciente.id_paciente);
      if (res.success && Array.isArray(res.data)) {
        setHistorial(res.data);
      }
    } catch (err) {
      console.error('Error obteniendo historial administrativo:', err);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const pacientesFiltrados = pacientes.filter((p) => {
    const full = `${p.nombres} ${p.apellidos} ${p.correo || ''}`.toLowerCase();
    return full.includes(search.toLowerCase());
  });

  if (loading) return <Loader message="Cargando tus pacientes..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mis Pacientes Vinculados</h2>
          <p className="text-sm text-slate-500 mt-1">
            Consulta los expedientes y trazabilidad de los pacientes bajo tu atención.
          </p>
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
        </div>
      </div>

      {notification && (
        <Alert type={notification.type} onClose={() => setNotification(null)}>
          {notification.message}
        </Alert>
      )}

      {pacientesFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pacientesFiltrados.map((pac) => (
            <div
              key={pac.id_paciente}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-sm">
                    {pac.nombres.charAt(0)}
                  </div>
                  <Badge status={pac.estado} />
                </div>

                <h4 className="text-base font-bold text-slate-800">
                  {pac.nombres} {pac.apellidos}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">{pac.correo || 'Sin correo asociado'}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  {pac.telefono && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{pac.telefono}</span>
                    </div>
                  )}
                  {pac.fecha_nacimiento && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Nacimiento: {new Date(pac.fecha_nacimiento).toLocaleDateString('es-ES')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Expediente: #{pac.id_paciente}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleOpenHistorial(pac)}
                  icon={History}
                >
                  Historial de Cambios
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-10 text-slate-400 text-xs">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            No hay pacientes que coincidan con la búsqueda.
          </div>
        </Card>
      )}

      {/* Modal Historial Administrativo */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title={
          selectedPatient
            ? `Historial Administrativo: ${selectedPatient.nombres} ${selectedPatient.apellidos}`
            : 'Historial'
        }
        maxWidth="max-w-2xl"
      >
        {loadingHistorial ? (
          <Loader message="Cargando eventos de auditoría administrativa..." />
        ) : historial.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {historial.map((evento) => (
              <div key={evento.id_historial} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 text-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    {evento.tipo_evento.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(evento.fecha_evento).toLocaleString('es-ES')}
                  </span>
                </div>
                <p className="text-slate-600 font-medium">{evento.descripcion}</p>
                {evento.datos_adicionales && (
                  <pre className="mt-2 p-2 rounded-lg bg-slate-200/50 text-[10px] text-slate-700 overflow-x-auto">
                    {JSON.stringify(evento.datos_adicionales, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-6">No hay eventos registrados para este paciente.</p>
        )}
      </Modal>
    </div>
  );
};

export default ProfessionalPatients;
