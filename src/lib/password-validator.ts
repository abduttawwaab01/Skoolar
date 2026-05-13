/**
 * Strong password validation to prevent breaches
 * Enforces OWASP password guidelines
 */

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0-5
  errors: string[];
  suggestions: string[];
}

const COMMON_PASSWORDS = new Set([
  'password', 'password123', '12345678', 'qwerty', 'abc123',
  'admin', 'letmein', 'welcome', 'monkey', 'dragon',
  'master', 'sunshine', 'princess', '123456', '654321',
]);

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  if (!password) {
    return {
      isValid: false,
      score: 0,
      errors: ['Password is required'],
      suggestions: ['Create a strong password with at least 12 characters'],
    };
  }

  // Minimum length: 12 characters (increased from 8)
  if (password.length < 12) {
    errors.push(`Password must be at least 12 characters (currently ${password.length})`);
  } else if (password.length < 16) {
    suggestions.push('Consider using more than 12 characters for better security');
  } else {
    score += 1;
  }

  // Maximum length: 128 characters (prevent DoS)
  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }

  // Must contain uppercase letters
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z)');
  } else {
    score += 1;
  }

  // Must contain lowercase letters
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z)');
  } else {
    score += 1;
  }

  // Must contain numbers
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number (0-9)');
  } else {
    score += 1;
  }

  // Must contain special characters
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?');
  } else {
    score += 1;
  }

  // Check for common patterns
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push('This password is too common and has been compromised in data breaches');
    suggestions.push('Choose a unique password that is not in common password lists');
  }

  // Check for sequential characters
  if (/012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi/.test(password.toLowerCase())) {
    suggestions.push('Avoid sequential patterns (like "123" or "abc")');
  }

  // Check for repeated characters
  if (/(.)\1{2,}/.test(password)) {
    suggestions.push('Avoid repeating the same character too many times');
  }

  // Check if password contains common words
  const commonWords = ['password', 'pass', 'admin', 'user', 'login', 'account', 'secret', 'test'];
  if (commonWords.some(word => password.toLowerCase().includes(word))) {
    suggestions.push('Avoid including common dictionary words');
  }

  return {
    isValid: errors.length === 0,
    score: Math.min(5, score),
    errors,
    suggestions,
  };
}

/**
 * Check password strength and return user-friendly message
 */
export function getPasswordStrengthMessage(password: string): { level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong'; message: string } {
  const validation = validatePassword(password);

  if (!validation.isValid) {
    return {
      level: 'weak',
      message: `Password is too weak: ${validation.errors[0]}`,
    };
  }

  switch (validation.score) {
    case 0:
    case 1:
      return { level: 'weak', message: 'Password is weak' };
    case 2:
      return { level: 'fair', message: 'Password is fair, but could be stronger' };
    case 3:
      return { level: 'good', message: 'Password is good' };
    case 4:
      return { level: 'strong', message: 'Password is strong' };
    case 5:
      return { level: 'very-strong', message: 'Password is very strong' };
    default:
      return { level: 'good', message: 'Password meets security requirements' };
  }
}
