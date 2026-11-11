import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import patientService from '../../services/patientService';
import { ClipboardList, Send, Clock, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';
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
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
            <ClipboardList className="w-3.5 h-3.5" /> Expediente y Apertura
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Solicitud de Atención Psicológica
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
          Describe de manera general tu motivo de consulta para coordinar la mejor alternativa de atención y apertura de expediente.
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

      <Card
        title="Nueva Solicitud de Atención"
        subtitle="Información inicial para apertura de expediente administrativo"
        className="dark:bg-[#111827] dark:border-slate-800 shadow-md dark:shadow-black/40"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="motivo"
              className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
            >
              Motivo de Consulta o Necesidad de Apoyo <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="motivo"
              rows={5}
              required
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Describe brevemente tus expectativas o motivos para recibir apoyo psicológico (ej. manejo de estrés, técnicas de estudio, orientación vocacional, apoyo emocional)..."
              className="w-full rounded-2xl border border-slate-300 dark:border-slate-700/80 p-4 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-[#0b0f19] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-inner"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              Esta información es confidencial y será revisada por el equipo de coordinación para facilitar la vinculación adecuada.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || !motivo.trim()}
              className="inline-flex items-center justify-center gap-2 font-bold text-sm px-6 py-2.5 rounded-xl text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-md shadow-teal-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Enviar Solicitud</span>
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PatientRequest;
