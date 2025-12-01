import { User } from '../types';
import { ALLOWED_USERS, MOCK_USERS } from '../constants';

export const login = async (username: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  if (!ALLOWED_USERS.includes(username)) {
    return { success: false, error: 'ACCESS DENIED: RESTRICTED TERMINAL' };
  }

  const existingUser = MOCK_USERS.find(u => u.github_username === username);
  if (existingUser) {
    return { success: true, user: existingUser };
  }

  // If user is allowed but not in mock data, create a temporary session user
  const newUser: User = {
    id: `temp-${Date.now()}`,
    github_username: username,
    full_name: username.toUpperCase(),
    role: 'Contributor',
    avatar_url: `https://ui-avatars.com/api/?name=${username}&background=BEF264&color=111`
  };

  return { success: true, user: newUser };
};
