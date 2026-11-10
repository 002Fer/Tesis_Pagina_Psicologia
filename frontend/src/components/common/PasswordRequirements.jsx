import React from 'react';
import { Check, X } from 'lucide-react';
import { validatePassword } from '../../utils/password.utils';

export const PasswordRequirements = ({ password = '' }) => {
  const { criteria } = validatePassword(password);

  const items = [
    { label: 'Mínimo 8 caracteres', met: criteria.minLength },
    { label: 'Una letra mayúscula (A-Z)', met: criteria.hasUpper },
    { label: 'Una letra minúscula (a-z)', met: criteria.hasLower },
    { label: 'Al menos un número (0-9)', met: criteria.hasNumber },
    { label: 'Un carácter especial o símbolo (!@#$%...)', met: criteria.hasSymbol },
  ];

  if (!password) return null;

  return (
    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5 mt-2 transition-all">
      <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1">Requisitos de contraseña segura:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {items.map((it, idx) => (
          <div key={idx} className={`flex items-center gap-1.5 ${it.met ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
            {it.met ? <Check className="w-3.5 h-3.5 shrink-0 text-emerald-500" /> : <X className="w-3.5 h-3.5 shrink-0 text-slate-400" />}
            <span className="text-[11px]">{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordRequirements;
