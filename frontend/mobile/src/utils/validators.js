export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password) {
  return password && password.length >= 6;
}

export function isValidName(name) {
  return name && name.trim().length >= 2;
}

export function validateLoginForm(email, password) {
  const errors = {};
  if (!isValidEmail(email))    errors.email    = 'E-mail inválido';
  if (!isValidPassword(password)) errors.password = 'Mínimo 6 caracteres';
  return errors;
}

export function validateRegisterForm(name, email, password) {
  const errors = validateLoginForm(email, password);
  if (!isValidName(name)) errors.name = 'Nome muito curto';
  return errors;
}
