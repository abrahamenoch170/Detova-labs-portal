import { createClient } from '@supabase/supabase-js';

// Robust environment variable handling for different build environments
const getEnv = (key: string) => {
  // Check Vite/ImportMeta
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
    return (import.meta as any).env[key];
  }
  // Check Standard Process Env
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

const envUrl = getEnv('VITE_SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL');
const envKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

// Prevent crash by using placeholders if missing, but flag it
export const isConfigured = !!envUrl && !!envKey;

const supabaseUrl = isConfigured ? envUrl : 'https://placeholder.supabase.co';
const supabaseKey = isConfigured ? envKey : 'placeholder-key';

if (!isConfigured) {
  console.warn('DETOVA_OS_WARNING: Supabase credentials missing. Database Uplink Failed.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);