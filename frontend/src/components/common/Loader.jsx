import React from 'react';

export const Loader = ({ message = 'Cargando información...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
};

export default Loader;
