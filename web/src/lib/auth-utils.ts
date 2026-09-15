import { createClient } from './supabase';

export const getCurrentUser = async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

export const signUp = async (email: string, password: string, fullName: string) => {
  const supabase = createClient();
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
};

export const signIn = async (email: string, password: string) => {
  const supabase = createClient();
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const signInWithGoogle = async () => {
  const supabase = createClient();
  const redirectTo = `${window.location.origin}/auth/callback`;
  
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });
};

export const signOut = async () => {
  const supabase = createClient();
  return await supabase.auth.signOut();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateFullName = (name: string): boolean => {
  return name.trim().length >= 2;
};
