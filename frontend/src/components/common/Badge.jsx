import React from 'react';

export const Badge = ({ children, status = 'default', className = '' }) => {
  const statusStyles = {
    // Estados de Cita
    PROGRAMADA: 'bg-blue-50 text-blue-700 border-blue-200',
    REALIZADA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELADA: 'bg-rose-50 text-rose-700 border-rose-200',
    REPROGRAMADA: 'bg-amber-50 text-amber-700 border-amber-200',
    INASISTENCIA: 'bg-purple-50 text-purple-700 border-purple-200',

    // Estados de Paciente / General
    ACTIVO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    INACTIVO: 'bg-slate-100 text-slate-700 border-slate-200',
    SOLICITANTE: 'bg-sky-50 text-sky-700 border-sky-200',
    EN_ESPERA: 'bg-amber-50 text-amber-700 border-amber-200',
    BAJA: 'bg-rose-50 text-rose-700 border-rose-200',
    FINALIZADO: 'bg-slate-100 text-slate-800 border-slate-300',

    // Estados de Asistencia
    ASISTIO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    NO_ASISTIO: 'bg-rose-50 text-rose-700 border-rose-200',

    // Espacio
    DISPONIBLE: 'bg-teal-50 text-teal-700 border-teal-200',
    NO_DISPONIBLE: 'bg-rose-50 text-rose-700 border-rose-200',

    default: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  const currentStyle = statusStyles[status] || statusStyles.default;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {children || status}
    </span>
  );
};

export default Badge;
