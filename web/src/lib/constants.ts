export const AUTH_CONFIG = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
};

export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REQUIRES_UPPERCASE: true,
  REQUIRES_LOWERCASE: true,
  REQUIRES_NUMBERS: true,
};

export const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_MISMATCH: 'Passwords do not match',
  WEAK_PASSWORD: 'Password does not meet security requirements',
  INVALID_FULL_NAME: 'Full name must be at least 2 characters',
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User account not found',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists',
  NETWORK_ERROR: 'Network error. Please try again',
  UNKNOWN_ERROR: 'An unexpected error occurred',
};

export const SUCCESS_MESSAGES = {
  SIGNUP_SUCCESS: 'Account created successfully! Redirecting...',
  LOGIN_SUCCESS: 'Logged in successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully',
};
