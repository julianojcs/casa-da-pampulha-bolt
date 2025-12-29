'use client';

import React from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  helpText?: string;
  error?: string;
}

/**
 * Componente de campo de formulário com suporte a asterisco para campos obrigatórios
 */
export function FormField({
  label,
  required = false,
  children,
  className = '',
  helpText,
  error,
}: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {helpText && !error && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
}

/**
 * Componente de input de formulário com label e asterisco
 */
export function FormInput({
  label,
  required = false,
  helpText,
  error,
  icon,
  containerClassName = '',
  className = '',
  ...inputProps
}: FormInputProps) {
  const inputClass = `w-full ${icon ? 'pl-10' : 'px-4'} pr-4 py-2 border ${
    error ? 'border-red-300' : 'border-gray-300'
  } rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${className}`;

  return (
    <FormField
      label={label}
      required={required}
      helpText={helpText}
      error={error}
      className={containerClassName}
    >
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input {...inputProps} required={required} className={inputClass} />
      </div>
    </FormField>
  );
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  containerClassName?: string;
}

/**
 * Componente de select de formulário com label e asterisco
 */
export function FormSelect({
  label,
  required = false,
  helpText,
  error,
  options,
  placeholder = 'Selecione...',
  containerClassName = '',
  className = '',
  ...selectProps
}: FormSelectProps) {
  const selectClass = `w-full px-4 py-2 border ${
    error ? 'border-red-300' : 'border-gray-300'
  } rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${className}`;

  return (
    <FormField
      label={label}
      required={required}
      helpText={helpText}
      error={error}
      className={containerClassName}
    >
      <select {...selectProps} required={required} className={selectClass}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  containerClassName?: string;
}

/**
 * Componente de textarea de formulário com label e asterisco
 */
export function FormTextarea({
  label,
  required = false,
  helpText,
  error,
  containerClassName = '',
  className = '',
  ...textareaProps
}: FormTextareaProps) {
  const textareaClass = `w-full px-4 py-2 border ${
    error ? 'border-red-300' : 'border-gray-300'
  } rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${className}`;

  return (
    <FormField
      label={label}
      required={required}
      helpText={helpText}
      error={error}
      className={containerClassName}
    >
      <textarea {...textareaProps} required={required} className={textareaClass} />
    </FormField>
  );
}
