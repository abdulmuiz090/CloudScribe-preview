
import { useState, useCallback } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface FormErrors {
  [key: string]: string;
}

export function useFormValidation(rules: ValidationRules) {
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  const validateField = useCallback((name: string, value: string): string | null => {
    const rule = rules[name];
    if (!rule) return null;

    if (rule.required && (!value || value.trim() === '')) {
      return 'This field is required';
    }

    if (rule.minLength && value.length < rule.minLength) {
      return `Minimum ${rule.minLength} characters required`;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return `Maximum ${rule.maxLength} characters allowed`;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return 'Invalid format';
    }

    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }, [rules]);

  const validate = useCallback((formData: {[key: string]: string}) => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName] || '');
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validateField, rules]);

  const validateSingle = useCallback((name: string, value: string) => {
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error || ''
    }));
    return !error;
  }, [validateField]);

  const touch = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return {
    errors,
    touched,
    validate,
    validateSingle,
    touch,
    clearErrors,
    hasErrors: Object.values(errors).some(error => error !== '')
  };
}
