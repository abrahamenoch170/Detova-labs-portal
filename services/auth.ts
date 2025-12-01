import { supabase } from '../lib/supabase';
import { User } from '../types';
import { ALLOWED_USERS } from '../constants';

export const signInWithGithub = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: window.location.origin
    }
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

// Syncs Supabase Auth user with our public.users table
// Enforces Allowlist
export const syncUserProfile = async (sessionUser: any): Promise<{ user: User | null; error?: string }> => {
  if (!sessionUser) return { user: null };

  const username = sessionUser.user_metadata?.user_name || sessionUser.email?.split('@')[0];
  
  if (!username) {
    return { user: null, error: 'IDENTITY_UNKNOWN' };
  }

  // 1. ALLOWLIST CHECK
  if (!ALLOWED_USERS.includes(username)) {
    return { user: null, error: `ACCESS DENIED: USER '${username}' NOT AUTHORIZED` };
  }

  // 2. CHECK DATABASE FOR PROFILE
  const { data: existingProfile, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', sessionUser.id)
    .single();

  if (existingProfile) {
    return { user: existingProfile as User };
  }

  // 3. CREATE PROFILE IF MISSING (First Time Login)
  const newProfile: User = {
    id: sessionUser.id,
    github_username: username,
    full_name: sessionUser.user_metadata?.full_name || username,
    role: 'Contributor', // Default role
    avatar_url: sessionUser.user_metadata?.avatar_url || ''
  };

  const { data: createdProfile, error: insertError } = await supabase
    .from('users')
    .insert([newProfile])
    .select()
    .single();

  if (insertError) {
    console.error('Profile creation failed:', insertError);
    return { user: null, error: 'DATABASE_WRITE_ERROR' };
  }

  return { user: createdProfile as User };
};
