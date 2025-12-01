import { Resource } from './types';

// SECURITY: Only these GitHub usernames are allowed access
export const ALLOWED_USERS = ['demi_dev', 'ayomide_code', 'admin_root', 'user'];

// Resources could eventually move to DB, but kept here for speed/config
export const RESOURCES: Resource[] = [
  {
    id: 'r1',
    name: 'Bolt.new',
    url: 'https://bolt.new',
    category: 'Development',
    icon: '⚡'
  },
  {
    id: 'r2',
    name: 'Replit',
    url: 'https://replit.com',
    category: 'IDE',
    icon: '💻'
  },
  {
    id: 'r3',
    name: 'Supabase',
    url: 'https://supabase.com',
    category: 'Database',
    icon: '🗄️'
  },
  {
    id: 'r4',
    name: 'Tailwind CSS',
    url: 'https://tailwindcss.com',
    category: 'Design',
    icon: '🎨'
  }
];
