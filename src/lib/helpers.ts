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
// Permite apagar todo o conteúdo e digitar telefones de qualquer país
// Formato brasileiro: +55(27)99999-9999
// Outros países: +{código}({área}){número} ou formato livre
export const formatPhone = (value: string): string => {
  // Se estiver vazio ou apenas espaços, retorna vazio
  if (!value || value.trim() === '') {
    return '';
  }

  // Preserva o sinal de + no início se existir
  const hasPlus = value.startsWith('+');

  // Extrai apenas dígitos
  const digits = value.replace(/\D/g, '');

  // Se não há dígitos, retorna apenas + se havia antes, ou vazio
  if (!digits) {
    return hasPlus ? '+' : '';
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

  // Para outros países, formato mais flexível
  // Tenta identificar código de país (1-3 dígitos) e formatar adequadamente
  // Formatos comuns:
  // +1 (EUA/Canadá): +1 (XXX) XXX-XXXX
  // +44 (UK): +44 XXXX XXXXXX
  // +351 (Portugal): +351 XXX XXX XXX
  // etc.

  // Por padrão, apenas adiciona + no início e preserva os dígitos
  // Isso permite que o usuário digite qualquer formato internacional

  // Se tem apenas o código de país (1-3 dígitos)
  if (digits.length <= 3) {
    return `+${digits}`;
  }

  // Para números com mais de 3 dígitos, tenta formatar de forma legível
  // Assumindo que os primeiros 1-3 dígitos são o código do país

  // EUA/Canadá (+1)
  if (digits.startsWith('1') && digits.length <= 11) {
    const country = '1';
    const rest = digits.slice(1);
    if (rest.length === 0) return '+1';
    if (rest.length <= 3) return `+1(${rest}`;
    if (rest.length <= 6) return `+1(${rest.slice(0, 3)})${rest.slice(3)}`;
    return `+1(${rest.slice(0, 3)})${rest.slice(3, 6)}-${rest.slice(6, 10)}`;
  }

  // Portugal (+351) ou outros com 3 dígitos de código
  if (digits.length > 10) {
    // Assume código de 2-3 dígitos para países com números longos
    const countryCodeLen = digits.length > 12 ? 3 : 2;
    const country = digits.slice(0, countryCodeLen);
    const rest = digits.slice(countryCodeLen);

    // Formata em grupos de 3 dígitos
    const groups = rest.match(/.{1,3}/g) || [];
    return `+${country} ${groups.join(' ')}`;
  }

  // Para números entre 4-10 dígitos, formato simples
  // Assume código de 2 dígitos e resto é o número
  if (digits.length >= 4) {
    const country = digits.slice(0, 2);
    const rest = digits.slice(2);

    // Formata em grupos de 3-4 dígitos
    if (rest.length <= 4) {
      return `+${country} ${rest}`;
    }
    const groups = rest.match(/.{1,4}/g) || [];
    return `+${country} ${groups.join(' ')}`;
  }

  // Fallback: apenas adiciona + e retorna os dígitos
  return `+${digits}`;
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
