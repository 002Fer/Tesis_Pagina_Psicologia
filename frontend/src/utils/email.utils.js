/**
 * Utilidades de validación estricta de correo electrónico en Frontend.
 * Verifica formato estándar (usuario@dominio.tld), ausencia de espacios,
 * dominios no vacíos y extensiones válidas de al menos 2 caracteres.
 */

export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      errorMessage: 'El correo electrónico es obligatorio.',
    };
  }

  const trimmed = email.trim();

  if (trimmed.length < 5 || trimmed.length > 150) {
    return {
      isValid: false,
      errorMessage: 'El correo debe tener entre 5 y 150 caracteres.',
    };
  }

  if (/\s/.test(trimmed)) {
    return {
      isValid: false,
      errorMessage: 'El correo electrónico no puede contener espacios.',
    };
  }

  if (trimmed.includes('..')) {
    return {
      isValid: false,
      errorMessage: 'El correo electrónico no puede contener puntos consecutivos.',
    };
  }

  // Regex estándar que requiere: local @ dominio . extensión(>=2 letras)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    if (!trimmed.includes('@')) {
      return {
        isValid: false,
        errorMessage: 'El correo debe incluir "@" (ejemplo: usuario@correo.com).',
      };
    }

    const parts = trimmed.split('@');
    if (parts.length > 2) {
      return {
        isValid: false,
        errorMessage: 'El correo no puede tener más de un símbolo "@".',
      };
    }

    const domain = parts[1];
    if (!domain || !domain.includes('.')) {
      return {
        isValid: false,
        errorMessage: 'El correo debe incluir un dominio válido con extensión (ejemplo: .com, .org, .edu, .gt).',
      };
    }

    return {
      isValid: false,
      errorMessage: 'Estructura de correo no válida. Verifique que no tenga caracteres prohibidos.',
    };
  }

  return {
    isValid: true,
    errorMessage: null,
  };
};

export default validateEmail;
