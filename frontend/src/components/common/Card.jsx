import React from 'react';

export const Card = ({ children, className = '', title, subtitle, action }) => {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            {title && <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-base">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export const StatCard = ({ title, value, icon: Icon, color = 'primary', description }) => {
  const colorMap = {
    primary: 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400',
    blue: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
    purple: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-start justify-between transition-colors">
      <div>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{title}</p>
        <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{value}</h4>
        {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
      </div>
      {Icon && (
        <div className={`p-3 rounded-xl ${colorMap[color] || colorMap.primary}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};

export default Card;
