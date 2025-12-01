export type Role = 'Admin' | 'Member' | 'Contributor';

export interface User {
  id: string;
  github_username: string;
  full_name: string;
  role: Role;
  avatar_url: string;
}

export type ProjectStatus = 'Idea' | 'Approved' | 'In Progress' | 'Shipped';

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  owner_id: string;
  score_market: number;
  score_tech: number;
  created_at: string;
}

export type TaskStatus = 'Todo' | 'Done' | 'Blocked';

export interface Task {
  id: string;
  description: string;
  assigned_to: string;
  project_id: string;
  status: TaskStatus;
  is_blocker: boolean;
  created_at: string;
}

export interface Resource {
  id: string;
  name: string;
  url: string;
  category: string;
  icon: string;
}

export type View = 'dashboard' | 'pipeline' | 'resources';