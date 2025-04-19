import { Box, Button, TextField, Typography } from '@mui/material';
import { ReactNode, useState, FormEvent } from 'react';
import { useNotification } from './Notification';

interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'date';
  required?: boolean;
  validation?: (value: string) => string | undefined;
  defaultValue?: string;
}

interface FormProps {
  fields: FormField[];
  onSubmit: (values: Record<string, string>) => Promise<void>;
  submitButtonText?: string;
  children?: ReactNode;
}

export function Form({ fields, onSubmit, submitButtonText = 'Submit', children }: FormProps) {
  const { showNotification } = useNotification();
  const [values, setValues] = useState<Record<string, string>>(
    fields.reduce(
      (acc, field) => {
        acc[field.name] = field.defaultValue || '';
        return acc;
      },
      {} as Record<string, string>
    )
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (field: FormField, value: string): string | undefined => {
    if (field.required && !value) {
      return `${field.label} is required`;
    }
    if (field.validation) {
      return field.validation(value);
    }
    return undefined;
  };

  const handleChange = (field: FormField) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setValues(prev => ({ ...prev, [field.name]: value }));

    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field.name]: error || '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach(field => {
      const error = validateField(field, values[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      showNotification('Please fix the errors in the form', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(values);
      showNotification('Form submitted successfully', 'success');
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'An error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      {fields.map(field => (
        <TextField
          key={field.name}
          fullWidth
          margin="normal"
          name={field.name}
          label={field.label}
          type={field.type || 'text'}
          value={values[field.name]}
          onChange={handleChange(field)}
          error={!!errors[field.name]}
          helperText={errors[field.name]}
          required={field.required}
          disabled={isSubmitting}
        />
      ))}

      {children}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : submitButtonText}
      </Button>
    </Box>
  );
}
