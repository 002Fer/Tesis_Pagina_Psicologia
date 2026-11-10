import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export const Alert = ({
  type = 'info',
  title,
  children,
  onClose,
  autoClose = null,
  className = '',
}) => {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const configs = {
    info: {
      bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300',
      icon: Info,
      iconColor: 'text-sky-500 dark:text-sky-400',
    },
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500 dark:text-emerald-400',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300',
      icon: AlertTriangle,
      iconColor: 'text-amber-500 dark:text-amber-400',
    },
    error: {
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300',
      icon: AlertCircle,
      iconColor: 'text-rose-500 dark:text-rose-400',
    },
  };

  const current = configs[type] || configs.info;
  const Icon = current.icon;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${current.bg} ${className}`}>
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${current.iconColor}`} />
      <div className="flex-1 text-sm">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        <div className="text-opacity-90">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-0.5 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
