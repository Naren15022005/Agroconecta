export function validatePassword(pw: string) {
  const errors: string[] = [];
  if (!pw || typeof pw !== 'string') {
    errors.push('Contraseña inválida');
    return { ok: false, errors };
  }
  if (pw.length < 12) errors.push('La contraseña debe tener al menos 12 caracteres.');
  if (!/[a-z]/.test(pw)) errors.push('La contraseña debe contener al menos una letra minúscula.');
  if (!/[A-Z]/.test(pw)) errors.push('La contraseña debe contener al menos una letra mayúscula.');
  if (!/[0-9]/.test(pw)) errors.push('La contraseña debe contener al menos un número.');
  if (!/[!@#$%^&*()_+\-=[\]{};:\"\\|,.<>/?`~]/.test(pw)) errors.push('La contraseña debe contener al menos un carácter especial.');
  if (/\s/.test(pw)) errors.push('La contraseña no debe contener espacios.');

  // small blacklist
  const blacklist = ['password', '123456', '123456789', 'qwerty', 'letmein', 'admin'];
  if (blacklist.includes(pw.toLowerCase())) errors.push('La contraseña es demasiado común. Elige otra.');

  return { ok: errors.length === 0, errors };
}

export default validatePassword;
