import { supabase } from '../lib/supabase';
import { User } from '../types';
import { ALLOWED_USERS, MOCK_USERS } from '../constants';

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

export const mapSupabaseUserToAppUser = (supabaseUser: any): { user: User | null; error?: string } => {
  if (!supabaseUser) return { user: null };
  
  // Extract GitHub username from metadata (standard Supabase mapping)
  const username = supabaseUser.user_metadata?.user_name || supabaseUser.email?.split('@')[0];
  
  if (!username) {
    return { user: null, error: 'IDENTITY_UNKNOWN' };
  }

  // CRITICAL: Allowlist Check
  // In a real app, this might be a DB query, but we are enforcing strict access via code/constants
  if (!ALLOWED_USERS.includes(username)) {
    return { user: null, error: `ACCESS DENIED: USER '${username}' NOT AUTHORIZED` };
  }

  // Map to our App's User structure
  // We check MOCK_USERS to see if they have a predefined role, otherwise default to Contributor
  const existingUser = MOCK_USERS.find(u => u.github_username === username);
  
  const appUser: User = {
    id: supabaseUser.id,
    github_username: username,
    full_name: supabaseUser.user_metadata?.full_name || username,
    role: existingUser ? existingUser.role : 'Contributor',
    avatar_url: supabaseUser.user_metadata?.avatar_url || ''
  };

  return { user: appUser };
};