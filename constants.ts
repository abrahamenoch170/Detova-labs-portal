import { User, Project, Task, Resource } from './types';

export const ALLOWED_USERS = ['demi_dev', 'ayomide_code', 'admin_root', 'user'];

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    github_username: 'demi_dev',
    full_name: 'Demi Architect',
    role: 'Admin',
    avatar_url: 'https://picsum.photos/100/100?random=1'
  },
  {
    id: 'u2',
    github_username: 'ayomide_code',
    full_name: 'Ayomide Engineer',
    role: 'Member',
    avatar_url: 'https://picsum.photos/100/100?random=2'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'Project Nexus',
    description: 'Unified API gateway for all internal tools.',
    status: 'In Progress',
    owner_id: 'u1',
    score_market: 85,
    score_tech: 90,
    created_at: new Date().toISOString()
  },
  {
    id: 'p2',
    title: 'Quantum UI Kit',
    description: 'A React component library for the new design system.',
    status: 'Approved',
    owner_id: 'u2',
    score_market: 60,
    score_tech: 95,
    created_at: new Date().toISOString()
  },
  {
    id: 'p3',
    title: 'Zero-Latency Chat',
    description: 'Real-time communication module using WebSocket.',
    status: 'Idea',
    owner_id: 'u1',
    score_market: 70,
    score_tech: 80,
    created_at: new Date().toISOString()
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    description: 'Design the schema for the Nexus API.',
    assigned_to: 'u1',
    project_id: 'p1',
    status: 'Todo',
    is_blocker: false,
    created_at: '2023-10-26T10:00:00Z'
  },
  {
    id: 't2',
    description: 'Fix the CORS issue on the legacy gateway.',
    assigned_to: 'u1',
    project_id: 'p1',
    status: 'Blocked',
    is_blocker: true,
    created_at: '2023-10-27T14:30:00Z'
  },
  {
    id: 't3',
    description: 'Implement the Button component.',
    assigned_to: 'u2',
    project_id: 'p2',
    status: 'Done',
    is_blocker: false,
    created_at: '2023-10-25T09:15:00Z'
  }
];

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