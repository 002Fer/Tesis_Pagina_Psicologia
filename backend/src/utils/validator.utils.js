/**
 * Utilidades de validación en el Backend:
 * - Estructura estricta de correo electrónico
 * - Cálculo de edad y verificación de minoría de edad
 */

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 150) return false;
  if (/\s/.test(trimmed)) return false;
  if (trimmed.includes('..')) return false;

  // Regex estándar: usuario@dominio.tld (mínimo 2 caracteres para la extensión TLD)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(trimmed);
}

function calculateAge(birthDate) {
  if (!birthDate) return null;
  const d = typeof birthDate === 'string' ? birthDate.split('T')[0] : birthDate.toISOString().split('T')[0];
  const parts = d.split('-');
  if (parts.length !== 3) return null;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  const today = new Date();
  let age = today.getFullYear() - year;
  const m = today.getMonth() + 1 - month;
  if (m < 0 || (m === 0 && today.getDate() < day)) {
    age--;
  }
  return age >= 0 ? age : null;
}

function isMinor(birthDate) {
  const age = calculateAge(birthDate);
  return age !== null && age < 18;
}

module.exports = {
  isValidEmail,
  calculateAge,
  isMinor,
};
