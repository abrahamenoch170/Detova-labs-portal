import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Pipeline } from './pages/Pipeline';
import { Resources } from './pages/Resources';
import { Button } from './components/ui/Button';
import { ToastContainer } from './components/ui/Toast';
import { View, User, Project, Task, Notification } from './types';
import { signInWithGithub, signOut, getCurrentSession, mapSupabaseUserToAppUser } from './services/auth';
import { supabase } from './lib/supabase';
import { INITIAL_PROJECTS, INITIAL_TASKS } from './constants';
import { ShieldAlert, Terminal, Github, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  // Persistence Helpers
  const loadState = <T,>(key: string, fallback: T): T => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  };

  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // App State with Persistence
  const [projects, setProjects] = useState<Project[]>(() => loadState('detova_projects', INITIAL_PROJECTS));
  const [tasks, setTasks] = useState<Task[]>(() => loadState('detova_tasks', INITIAL_TASKS));

  // Persistence Effects
  useEffect(() => localStorage.setItem('detova_projects', JSON.stringify(projects)), [projects]);
  useEffect(() => localStorage.setItem('detova_tasks', JSON.stringify(tasks)), [tasks]);

  // Auth Session Check
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const { session } = await getCurrentSession();
        if (session) {
          const { user: appUser, error } = mapSupabaseUserToAppUser(session.user);
          if (appUser) {
            setUser(appUser);
            addNotification(`SESSION RESTORED: ${appUser.github_username.toUpperCase()}`, 'info');
          } else if (error) {
            setLoginError(error);
            await signOut();
          }
        }
      } catch (err) {
        console.error('Auth Init Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
         const { user: appUser, error } = mapSupabaseUserToAppUser(session.user);
         if (appUser) {
           setUser(appUser);
           addNotification('AUTHENTICATION SUCCESSFUL');
         } else {
           setLoginError(error || 'ACCESS DENIED');
           await signOut();
         }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);

    const { error } = await signInWithGithub();
    if (error) {
      setLoginError(error.message);
      setIsLoading(false);
      addNotification('CONNECTION FAILED', 'error');
    }
    // No need to set loading false here if successful, as redirect happens
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setCurrentView('dashboard');
    addNotification('SESSION TERMINATED', 'info');
  };

  // Project Handlers
  const handleAddProject = (newProjectData: Omit<Project, 'id' | 'created_at' | 'owner_id' | 'score_market' | 'score_tech' | 'status'>) => {
    if (!user) return;
    const newProject: Project = {
      id: `p${Date.now()}`,
      ...newProjectData,
      status: 'Idea',
      owner_id: user.id,
      score_market: Math.floor(Math.random() * 100),
      score_tech: Math.floor(Math.random() * 100),
      created_at: new Date().toISOString()
    };
    setProjects(prev => [...prev, newProject]);
    addNotification('PROJECT INITIALIZED');
  };

  const handleUpdateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('CONFIRM DELETION? This action is irreversible.')) {
      setProjects(prev => prev.filter(p => p.id !== id));
      addNotification('PROJECT TERMINATED', 'info');
    }
  };

  // Task Handlers
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
    addNotification(newTask.is_blocker ? 'CRITICAL ALERT REPORTED' : 'PROTOCOL ESTABLISHED');
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    if (updates.status === 'Done') {
      addNotification('PROTOCOL COMPLETED');
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    addNotification('PROTOCOL PURGED', 'info');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-carbon flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', 
               backgroundSize: '40px 40px' 
             }}>
        </div>

        <div className="w-full max-w-md z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent mb-4 animate-pulse">
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

            <div className="space-y-6">
              <div className="text-center">
                <p className="text-[10px] font-mono text-silver mb-2 uppercase">Identity Verification Required</p>
                <div className="h-px bg-border w-1/2 mx-auto mb-6"></div>
              </div>
              
              <Button 
                onClick={handleLogin} 
                className="w-full h-12" 
                disabled={isLoading}
                icon={isLoading ? <Loader2 className="animate-spin" size={20} /> : <Github size={20} />}
              >
                {isLoading ? 'ESTABLISHING UPLINK...' : 'CONNECT_GITHUB'}
              </Button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-[10px] text-silver/30 font-mono">
                SECURE HANDSHAKE PROTOCOL v2.1
                <br/>
                UNAUTHORIZED ACCESS IS A FEDERAL OFFENSE.
              </p>
            </div>
          </div>
        </div>
        <ToastContainer notifications={notifications} onDismiss={dismissNotification} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-carbon text-body font-sans flex">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        user={user}
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen bg-carbon relative">
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
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onChangeView={setCurrentView} 
            />
          )}
          {currentView === 'pipeline' && (
            <Pipeline 
              projects={projects} 
              onAddProject={handleAddProject} 
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
            />
          )}
          {currentView === 'resources' && <Resources />}
        </div>
      </main>

      <ToastContainer notifications={notifications} onDismiss={dismissNotification} />
    </div>
  );
};

export default App;