import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import patientService from '../../services/patientService';
import { ClipboardList, Send, Clock, CheckCircle2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';

export const PatientRequest = () => {
  const { user } = useAuth();
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!motivo.trim()) return;

    try {
      setLoading(true);
      setNotification(null);
      const res = await patientService.createSolicitud({
        id_paciente: user?.perfil?.id_paciente,
        motivo_consulta: motivo,
      });

      if (res.success) {
        setNotification({
          type: 'success',
          message: 'Tu solicitud de atención psicológica ha sido enviada con éxito.',
        });
        setMotivo('');
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Error al enviar la solicitud de atención.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Solicitud de Atención Psicológica</h2>
        <p className="text-sm text-slate-500 mt-1">
          Describe de manera general tu motivo de consulta para coordinar la mejor alternativa de atención.
        </p>
      </div>

      {notification && (
        <Alert
          type={notification.type}
          onClose={() => setNotification(null)}
          title={notification.type === 'success' ? 'Solicitud Recibida' : 'Error'}
        >
          {notification.message}
        </Alert>
      )}

      <Card title="Nueva Solicitud de Atención" subtitle="Información inicial para apertura de expediente administrativo">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="motivo" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Motivo de Consulta o Necesidad de Apoyo
            </label>
            <textarea
              id="motivo"
              rows={5}
              required
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Describe brevemente tus expectativas o motivos para recibir apoyo psicológico (ej. manejo de estrés, técnicas de estudio, orientación vocacional, apoyo emocional)..."
              className="w-full rounded-xl border border-slate-300 p-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Esta información será revisada por el equipo de coordinación para facilitar la vinculación adecuada.
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={loading} icon={Send} size="md">
              Enviar Solicitud
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PatientRequest;
