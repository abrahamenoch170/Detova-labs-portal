import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Pipeline } from './pages/Pipeline';
import { Resources } from './pages/Resources';
import { Button } from './components/ui/Button';
import { View, User, Project, Task } from './types';
import { login } from './services/auth';
import { INITIAL_PROJECTS, INITIAL_TASKS } from './constants';
import { ShieldAlert, Terminal } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [usernameInput, setUsernameInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // App State
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);

    try {
      const result = await login(usernameInput.toLowerCase().trim());
      if (result.success && result.user) {
        setUser(result.user);
      } else {
        setLoginError(result.error || 'Authentication Failed');
      }
    } catch (err) {
      setLoginError('System Malfunction');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProject = (newProjectData: Omit<Project, 'id' | 'created_at' | 'owner_id' | 'score_market' | 'score_tech' | 'status'>) => {
    if (!user) return;
    const newProject: Project = {
      id: `p${Date.now()}`,
      ...newProjectData,
      status: 'Idea',
      owner_id: user.id,
      score_market: 50,
      score_tech: 50,
      created_at: new Date().toISOString()
    };
    setProjects(prev => [...prev, newProject]);
  };

  const handleAddTask = (taskData: Partial<Task>) => {
    if (!user) return;
    const newTask: Task = {
      id: `t${Date.now()}`,
      description: taskData.description || 'New Task',
      project_id: taskData.project_id || projects[0]?.id || 'unknown',
      assigned_to: user.id,
      status: 'Todo',
      is_blocker: taskData.is_blocker || false,
      created_at: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-carbon flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background Grid Effect */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', 
               backgroundSize: '40px 40px' 
             }}>
        </div>

        <div className="w-full max-w-md z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent mb-4">
              <Terminal size={32} className="text-carbon" />
            </div>
            <h1 className="text-3xl font-mono font-bold text-offwhite tracking-tighter">DETOVA_LABS</h1>
            <p className="text-accent font-mono text-sm tracking-widest mt-2">SECURE TEAM PORTAL</p>
          </div>

          <div className="bg-surface border border-border p-8 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-2 h-full bg-accent"></div>
            
            {loginError && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 flex items-center gap-3 text-red-400 animate-pulse">
                <ShieldAlert size={20} />
                <span className="text-xs font-mono font-bold">{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-mono text-silver mb-2 uppercase">Identity Verification</label>
                <input 
                  type="text" 
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full bg-carbon border border-border p-4 text-offwhite focus:border-accent focus:outline-none font-mono text-center tracking-wider"
                  placeholder="GITHUB_USERNAME"
                  autoFocus
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'AUTHENTICATING...' : 'ACCESS_SYSTEM'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[10px] text-silver/30 font-mono">
                AUTHORIZED PERSONNEL ONLY.
                <br/>
                ALL ACTIVITY IS LOGGED.
              </p>
              <p className="text-[10px] text-silver/20 font-mono mt-2">
                Allowed: 'demi_dev', 'ayomide_code'
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-carbon text-body font-sans flex">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        user={user}
        onLogout={() => setUser(null)} 
      />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen bg-carbon relative">
        {/* Subtle grid background */}
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none h-full w-full" 
             style={{ 
               backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', 
               backgroundSize: '20px 20px' 
             }}>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {currentView === 'dashboard' && (
            <Dashboard 
              user={user} 
              tasks={tasks} 
              projects={projects}
              onAddTask={handleAddTask}
              onChangeView={setCurrentView} 
            />
          )}
          {currentView === 'pipeline' && <Pipeline projects={projects} onAddProject={handleAddProject} />}
          {currentView === 'resources' && <Resources />}
        </div>
      </main>
    </div>
  );
};

export default App;