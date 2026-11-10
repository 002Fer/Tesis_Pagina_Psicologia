/**
 * Validador de seguridad de contraseñas
 * Reglas:
 * - Mínimo 8 caracteres
 * - Al menos una letra mayúscula
 * - Al menos una letra minúscula
 * - Al menos un número
 * - Al menos un símbolo / carácter especial
 */

export const validatePassword = (password) => {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);

  const isValid = minLength && hasUpper && hasLower && hasNumber && hasSymbol;

  let errorMessage = null;
  if (!isValid) {
    const missing = [];
    if (!minLength) missing.push('mínimo 8 caracteres');
    if (!hasUpper) missing.push('al menos una mayúscula');
    if (!hasLower) missing.push('al menos una minúscula');
    if (!hasNumber) missing.push('al menos un número');
    if (!hasSymbol) missing.push('al menos un símbolo especial (!@#$%...)');
    errorMessage = `La contraseña debe contener: ${missing.join(', ')}.`;
  }

  return {
    isValid,
    errorMessage,
    criteria: {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSymbol,
    },
  };
};
