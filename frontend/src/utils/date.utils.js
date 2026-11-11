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

/**
 * Calcula la edad en años a partir de una fecha de nacimiento (YYYY-MM-DD)
 */
export const calculateAge = (birthDateStr) => {
  if (!birthDateStr) return null;
  const raw = birthDateStr.split('T')[0];
  const parts = raw.split('-');
  if (parts.length !== 3) return null;

  const birthYear = parseInt(parts[0], 10);
  const birthMonth = parseInt(parts[1], 10) - 1; // 0-indexed
  const birthDay = parseInt(parts[2], 10);

  if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) return null;

  const today = new Date();
  let age = today.getFullYear() - birthYear;
  const monthDiff = today.getMonth() - birthMonth;

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDay)) {
    age--;
  }

  return age >= 0 ? age : null;
};

/**
 * Determina si una persona es menor de 18 años a partir de su fecha de nacimiento
 */
export const isMinor = (birthDateStr) => {
  const age = calculateAge(birthDateStr);
  return age !== null && age < 18;
};

