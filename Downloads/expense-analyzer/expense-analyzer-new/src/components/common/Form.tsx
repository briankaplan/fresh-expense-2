'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  form: UseFormReturn<any>;
  options?: Array<{ value: string; label: string }>;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  form,
  options,
}) => {
  const { register, formState: { errors } } = form;
  const error = errors[name];

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      
      {type === 'select' ? (
        <select
          id={name}
          {...register(name)}
          className="input"
        >
          <option value="">Select {label}</option>
          {options?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={name}
          {...register(name)}
          placeholder={placeholder}
          className="input"
          rows={3}
        />
      ) : (
        <input
          id={name}
          type={type}
          {...register(name)}
          placeholder={placeholder}
          className="input"
        />
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error.message as string}
        </p>
      )}
    </div>
  );
}; 