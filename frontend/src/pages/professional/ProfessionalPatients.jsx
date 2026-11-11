import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import patientService from '../../services/patientService';
import { Users, Search, History, Calendar, User, Phone, FileText, ShieldAlert, ShieldCheck } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import { calculateAge, isMinor } from '../../utils/date.utils';

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
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mis Pacientes Vinculados</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Consulta los expedientes y trazabilidad de los pacientes bajo tu atención.
          </p>
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-[#111827] dark:text-slate-200"
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
          {pacientesFiltrados.map((pac) => {
            const edad = calculateAge(pac.fecha_nacimiento);
            const menor = isMinor(pac.fecha_nacimiento);
            const tutor = pac.responsable_principal;

            return (
              <div
                key={pac.id_paciente}
                className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-glow-teal/5 transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-bold flex items-center justify-center text-sm">
                      {pac.nombres.charAt(0)}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
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
                      <Badge status={pac.estado} />
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    {pac.nombres} {pac.apellidos}
                  </h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{pac.correo || 'Sin correo asociado'}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {pac.telefono && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>{pac.telefono}</span>
                      </div>
                    )}
                    {pac.fecha_nacimiento && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>
                          Nacimiento: {new Date(pac.fecha_nacimiento).toLocaleDateString('es-ES')}{' '}
                          {edad !== null && `(${edad} años)`}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>Expediente: #{pac.id_paciente}</span>
                    </div>

                    {/* Tutor legal para menor de edad */}
                    {menor && tutor && (
                      <div className="mt-2.5 p-2 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-200">
                        <span className="font-bold block text-amber-800 dark:text-amber-300">
                          Tutor Legal ({tutor.parentesco || 'Responsable'}):
                        </span>
                        <span>{tutor.nombres} {tutor.apellidos}</span>
                        {tutor.telefono && <span className="block text-slate-500 dark:text-slate-400">Tel: {tutor.telefono}</span>}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex justify-end">
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
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs">
            <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
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
              <div key={evento.id_historial} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50 text-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-[11px]">
                    {evento.tipo_evento.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {new Date(evento.fecha_evento).toLocaleString('es-ES')}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-medium">{evento.descripcion}</p>
                {evento.datos_adicionales && (
                  <pre className="mt-2 p-2 rounded-lg bg-slate-200/50 dark:bg-slate-700/40 text-[10px] text-slate-700 dark:text-slate-200 overflow-x-auto">
                    {JSON.stringify(evento.datos_adicionales, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">No hay eventos registrados para este paciente.</p>
        )}
      </Modal>
    </div>
  );
};

export default ProfessionalPatients;
