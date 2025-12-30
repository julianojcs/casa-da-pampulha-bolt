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

// Formatar telefone com suporte a DDI internacional
// Permite apagar todo o conteúdo e digitar telefones de outros países
// Formato sem espaços: +55(27)9XXXX-XXXX
export const formatPhone = (value: string): string => {
  // Se estiver vazio ou apenas espaços, retorna vazio
  if (!value || value.trim() === '') {
    return '';
  }

  // Extrai apenas dígitos
  const digits = value.replace(/\D/g, '');

  // Se não há dígitos, retorna vazio
  if (!digits) {
    return '';
  }

  // Se começa com 55 (Brasil), formata como brasileiro
  if (digits.startsWith('55')) {
    const br = digits.slice(2); // remove 55
    if (!br) return '+55';

    const dd = br.slice(0, 2);
    const rest = br.slice(2, 11);

    let formatted = '+55';
    if (dd.length === 1) {
      formatted += `(${dd}`;
    } else if (dd.length === 2) {
      formatted += `(${dd})`;
    }

    if (rest.length > 0 && rest.length <= 5) {
      formatted += rest;
    } else if (rest.length > 5) {
      formatted += `${rest.slice(0, 5)}-${rest.slice(5)}`;
    }

    return formatted;
  }

  // Outros países ou número sem código de país
  // Se tem 10-11 dígitos, assume brasileiro
  if (digits.length >= 10 && digits.length <= 11) {
    const dd = digits.slice(0, 2);
    const rest = digits.slice(2);

    let formatted = '+55';
    formatted += `(${dd})`;

    if (rest.length <= 5) {
      formatted += rest;
    } else {
      formatted += `${rest.slice(0, 5)}-${rest.slice(5, 9)}`;
    }

    return formatted;
  }

  // Para outros formatos, apenas agrupa os dígitos sem espaços
  if (digits.length <= 2) {
    return `+${digits}`;
  }

  const chunks = digits.match(/.{1,4}/g) || [];
  return '+' + chunks.join('');
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
