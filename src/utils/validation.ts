const USERNAME_REGEX = /^[a-z0-9_.]+$/;
const RESERVED_USERNAMES = [
  'admin',
  'administrator',
  'moderator',
  'official',
  'root',
  'support',
  'system',
];

const USERNAME_MIN = 3;
const USERNAME_MAX = 20;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUsername(username: string): ValidationResult {
  if (!username) return { valid: false, error: 'Username is required' };
  if (username.length < USERNAME_MIN) return { valid: false, error: `At least ${USERNAME_MIN} characters` };
  if (username.length > USERNAME_MAX) return { valid: false, error: `At most ${USERNAME_MAX} characters` };
  if (!/^[a-z0-9_.]/.test(username)) return { valid: false, error: 'Must start with a letter or number' };
  if (!USERNAME_REGEX.test(username)) {
    return { valid: false, error: 'Only lowercase letters, numbers, underscores and dots allowed' };
  }
  if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
    return { valid: false, error: 'This username is reserved' };
  }
  return { valid: true };
}

export function validateUrl(url: string): ValidationResult {
  if (!url) return { valid: false, error: 'URL is required' };
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    if (!['http:', 'https:'].includes(u.protocol)) return { valid: false, error: 'Must be http(s)' };
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL' };
  }
}

export function validateEmail(email: string): ValidationResult {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) ? { valid: true } : { valid: false, error: 'Invalid email' };
}

export function validatePassword(password: string): ValidationResult {
  if (password.length < 8) return { valid: false, error: 'At least 8 characters' };
  if (!/[A-Z]/.test(password)) return { valid: false, error: 'Needs an uppercase letter' };
  if (!/[a-z]/.test(password)) return { valid: false, error: 'Needs a lowercase letter' };
  if (!/[0-9]/.test(password)) return { valid: false, error: 'Needs a number' };
  return { valid: true };
}

export function fileValidation(file: File, types: string[], maxSize: number): ValidationResult {
  if (!types.includes(file.type)) {
    return { valid: false, error: `Invalid type. Allowed: ${types.join(', ')}` };
  }
  if (file.size > maxSize) {
    return { valid: false, error: `File too large. Max ${(maxSize / 1024 / 1024).toFixed(1)} MB` };
  }
  return { valid: true };
}