import { createClient } from '@supabase/supabase-js';

// Configuration: Replace these with your actual Supabase project credentials in your deployment environment
// If running locally, you would typically use .env files. 
// For this environment, we attempt to read standard Vite/Next.js env vars or fallback to a placeholder that will likely fail if not configured.

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || process.env?.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);