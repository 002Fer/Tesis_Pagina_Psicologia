import React from 'react';

export const Select = ({
  label,
  id,
  options = [],
  error,
  helperText,
  className = '',
  required = false,
  placeholder = 'Seleccione una opción',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        id={id}
        required={required}
        className={`block w-full rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 ${
          error
            ? 'border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/30 dark:bg-rose-950/20'
            : 'border-slate-300 dark:border-slate-700 focus:border-primary-500'
        } ${className}`}
        {...props}
      >
        {placeholder && <option value="" className="dark:bg-slate-900">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="dark:bg-slate-900">
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Select;
