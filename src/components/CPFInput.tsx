'use client';

import { useState, useEffect } from 'react';
import { maskCPF, validateCPF, cleanCPF } from '@/lib/cpf';

interface CPFInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidChange?: (isValid: boolean) => void;
  showValidation?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
  placeholder?: string;
}

export function CPFInput({
  value,
  onChange,
  onValidChange,
  showValidation = true,
  required = false,
  disabled = false,
  className = '',
  label,
  placeholder = '000.000.000-00',
}: CPFInputProps) {
  const [isTouched, setIsTouched] = useState(false);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    const cleaned = cleanCPF(value);
    if (cleaned.length === 11) {
      const valid = validateCPF(value);
      setIsValid(valid);
      onValidChange?.(valid);
    } else if (cleaned.length === 0 && !required) {
      setIsValid(true);
      onValidChange?.(true);
    } else {
      setIsValid(cleaned.length < 11);
      onValidChange?.(cleaned.length < 11);
    }
  }, [value, required, onValidChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCPF(e.target.value);
    onChange(masked);
  };

  const handleBlur = () => {
    setIsTouched(true);
  };

  const showError = showValidation && isTouched && !isValid && cleanCPF(value).length === 11;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={14}
        inputMode="numeric"
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
          showError
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
      />
      {showError && (
        <p className="mt-1 text-sm text-red-600">CPF inválido</p>
      )}
    </div>
  );
}
