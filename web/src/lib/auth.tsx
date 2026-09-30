    if (digits.length < 8 || digits.length > 15) throw new Error('Enter a valid mobile number.');
    return `+${digits}`;
  }
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `+91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  throw new Error('Enter a valid mobile number.');
}

export function formatAuthError(message: string): string {
  const normalized = (message || '').toLowerCase();
  if (normalized.includes('invalid api key') || normalized.includes('api key')) return 'AgriMark authentication is temporarily unavailable. Please try again.';
  if (normalized.includes('email not confirmed')) return 'Please confirm your email address before logging in.';
  if (normalized.includes('invalid login credentials') || normalized.includes('auth/invalid-credential') || normalized.includes('invalid-credential')) return 'Incorrect email or password. If you recently registered with Google, use “Continue with Google” or reset your password.';
  if (normalized.includes('email-already-in-use') || normalized.includes('email already in use') || normalized.includes('already registered')) return 'An account with this email already exists. Please log in instead, or reset your password if you do not remember it.';
  if (normalized.includes('redirect') || normalized.includes('pkce') || normalized.includes('invalid_grant')) return 'Authentication configuration needs attention. Please try again.';
  if (normalized.includes('provider is not enabled') || normalized.includes('unsupported provider')) return 'This sign-in method is not enabled yet.';
  if (normalized.includes('rate limit') || normalized.includes('too many')) return 'Too many authentication attempts. Please wait and try again.';
  if (normalized.includes('deleted_client') || normalized.includes('client was deleted') || normalized.includes('oauth client was deleted')) {
    return 'Google OAuth Client has been deleted or invalidated in Google Cloud Console. Please restore the client or update the provider configuration.';
  }
  if (normalized.includes('popup') || normalized.includes('google')) return 'Google sign-in could not be completed. Please try again.';
  if (normalized.includes('unauthorized-domain')) return 'This AgriMark domain is not authorized in Firebase Authentication.';
  if (normalized.includes('operation-not-allowed')) return 'This Firebase sign-in method is not enabled.';
  if (normalized.includes('configuration-not-found') || normalized.includes('configuration_not_found')) {