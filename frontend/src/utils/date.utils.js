/**
 * Utilidades para formateo consistente de fechas y horas de citas.
 * Dado que los slots y citas se almacenan con referencia horaria UTC (ej. 09:00:00.000Z),
 * se debe renderizar siempre usando timeZone: 'UTC' para evitar desfasajes locales (ej. UTC-6).
 */

export const formatTimeUTC = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('es-ES', {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateUTC = (dateStr, options = {}) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', {
    timeZone: 'UTC',
    ...options,
  });
};

export const formatFullDateTimeUTC = (dateStr) => {
  if (!dateStr) return '';
  const fecha = formatDateUTC(dateStr, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const hora = formatTimeUTC(dateStr);
  return `${fecha} a las ${hora}`;
};

/**
 * Obtiene la fecha local en formato YYYY-MM-DD sin desviaciones de zona horaria por toISOString()
 */
export const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Obtiene la fecha de mañana en formato YYYY-MM-DD
 */
export const getTomorrowLocalDateString = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return getLocalDateString(d);
};
