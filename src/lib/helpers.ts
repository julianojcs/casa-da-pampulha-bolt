// Shared formatting and validation helpers used across the app

export const onlyDigits = (v: string) => v.replace(/\D/g, '');

export const formatCPF = (cpf: string) => {
  const d = onlyDigits(cpf).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3}\.\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3}\.\d{3}\.\d{3})(\d)/, '$1-$2');
};

export const validateCPF = (cpf: string) => {
  const str = onlyDigits(cpf).padStart(11, '0');
  if (!/^[0-9]{11}$/.test(str)) return false;
  if (/^([0-9])\1+$/.test(str)) return false;
  const calc = (t: number) => {
    let sum = 0;
    for (let i = 0; i < t - 1; i++) sum += parseInt(str.charAt(i)) * (t - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(10) === parseInt(str.charAt(9)) && calc(11) === parseInt(str.charAt(10));
};

export const formatPhone = (phone: string) => {
  const d = onlyDigits(phone).replace(/^55/, ''); // remove leading country if repeated
  const dd = d.slice(0, 2);
  const rest = d.slice(2, 13); // up to 11 digits after DDD
  let formatted = '+55';
  if (dd) formatted += `(${dd})`;
  if (rest.length <= 4) formatted += rest;
  else if (rest.length <= 8) formatted += rest.replace(/^(\d{4})(\d+)/, '$1-$2');
  else formatted += rest.replace(/^(\d{5})(\d{4})/, '$1-$2');
  return formatted;
};

export const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default {
  onlyDigits,
  formatCPF,
  validateCPF,
  formatPhone,
  validateEmail,
};
