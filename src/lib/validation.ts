
interface BaseValidationRule {
  message: string;
}

interface PatternRule extends BaseValidationRule {
  pattern: RegExp;
}

interface MinLengthRule extends BaseValidationRule {
  minLength: number;
  pattern: RegExp;
}

type ValidationRule = PatternRule | MinLengthRule;

export const validationRules: Record<string, ValidationRule> = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, and number'
  },
  phone: {
    pattern: /^\+?[\d\s-()]+$/,
    message: 'Please enter a valid phone number'
  },
  url: {
    pattern: /^https?:\/\/.+/,
    message: 'Please enter a valid URL starting with http:// or https://'
  },
  price: {
    pattern: /^\d+(\.\d{1,2})?$/,
    message: 'Please enter a valid price (e.g., 10.99)'
  },
  bankAccount: {
    pattern: /^\d{10}$/,
    message: 'Bank account number must be exactly 10 digits'
  }
};

function hasMinLength(rule: ValidationRule): rule is MinLengthRule {
  return 'minLength' in rule;
}

export function validateInput(value: string, rule: keyof typeof validationRules): {
  isValid: boolean;
  message?: string;
} {
  const validation = validationRules[rule];
  
  if (!validation) {
    return { isValid: true };
  }

  if (hasMinLength(validation) && value.length < validation.minLength) {
    return { isValid: false, message: validation.message };
  }

  if (validation.pattern && !validation.pattern.test(value)) {
    return { isValid: false, message: validation.message };
  }

  return { isValid: true };
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function validateRequired(value: string, fieldName: string): {
  isValid: boolean;
  message?: string;
} {
  if (!value || value.trim() === '') {
    return { isValid: false, message: `${fieldName} is required` };
  }
  return { isValid: true };
}
