import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Pipeline } from './pages/Pipeline';
import { Resources } from './pages/Resources';
import { Button } from './components/ui/Button';
import { ToastContainer } from './components/ui/Toast';
import { View, User, Project, Task, Notification } from './types';
import { signInWithGithub, signOut, getCurrentSession, syncUserProfile } from './services/auth';
import { supabase, isConfigured } from './lib/supabase';
import { api } from './services/api';
import { ShieldAlert, Terminal, Github, Loader2, Database } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // App State
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // 1. Data Fetching
  const refreshData = async () => {
    setIsDataLoading(true);
    try {
      const [fetchedProjects, fetchedTasks] = await Promise.all([
        api.getProjects(),
        api.getTasks()
      ]);
      setProjects(fetchedProjects);
      setTasks(fetchedTasks);
    } catch (err) {
      console.error('Data Load Error:', err);
      addNotification('DATA SYNC FAILED', 'error');
    } finally {
      setIsDataLoading(false);
    }
  };

  // 2. Auth & Session Management
  useEffect(() => {
    if (!isConfigured) {
      setIsAuthLoading(false);
      return;
    }

    const initAuth = async () => {
      setIsAuthLoading(true);
      try {
        const { session } = await getCurrentSession();
        if (session) {
          const { user: appUser, error } = await syncUserProfile(session.user);
          if (appUser) {
            setUser(appUser);
            addNotification(`SESSION RESTORED: ${appUser.github_username.toUpperCase()}`, 'info');
            refreshData(); // Fetch data after auth
          } else if (error) {
            setLoginError(error);
            await signOut();
          }
        }
      } catch (err) {
        console.error('Auth Init Error:', err);
      } finally {
        setIsAuthLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
         // Prevent double loading if already handled by initAuth
         if (!user) {
            setIsAuthLoading(true);
            const { user: appUser, error } = await syncUserProfile(session.user);
            setIsAuthLoading(false);
            
            if (appUser) {
              setUser(appUser);
              addNotification('AUTHENTICATION SUCCESSFUL');
              refreshData();
            } else {
              setLoginError(error || 'ACCESS DENIED');
              await signOut();
            }
         }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProjects([]);
        setTasks([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [user]); 

  // 3. Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setLoginError(null);
    const { error } = await signInWithGithub();
    if (error) {
      setLoginError(error.message);
      setIsAuthLoading(false);
      addNotification('CONNECTION FAILED', 'error');
    }
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setCurrentView('dashboard');
    addNotification('SESSION TERMINATED', 'info');
  };

  // Project Handlers
  const handleAddProject = async (newProjectData: Omit<Project, 'id' | 'created_at' | 'owner_id' | 'score_market' | 'score_tech' | 'status'>) => {
    if (!user) return;
    try {
      const newProject = await api.createProject({
        ...newProjectData,
        owner_id: user.id,
        status: 'Idea',
        score_market: Math.floor(Math.random() * 100), // AI placeholder logic
        score_tech: Math.floor(Math.random() * 100)
      });
      setProjects(prev => [newProject, ...prev]);
      addNotification('PROJECT INITIALIZED');
    } catch (err) {
      addNotification('FAILED TO CREATE PROJECT', 'error');
    }
  };

  const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
    // Optimistic Update
    const oldProjects = [...projects];
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    
    try {
      await api.updateProject(id, updates);
    } catch (err) {
      setProjects(oldProjects); // Revert
      addNotification('UPDATE FAILED', 'error');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('CONFIRM DELETION? This action is irreversible.')) {
      try {
        await api.deleteProject(id);
        setProjects(prev => prev.filter(p => p.id !== id));
        addNotification('PROJECT TERMINATED', 'info');
      } catch (err) {
        addNotification('DELETION FAILED', 'error');
      }
    }
  };

  // Task Handlers
  const handleAddTask = async (taskData: Partial<Task>) => {
    if (!user) return;
    try {
      const newTask = await api.createTask({
        description: taskData.description || 'New Task',
        project_id: taskData.project_id,
        assigned_to: user.id,
        status: 'Todo',
        is_blocker: taskData.is_blocker || false,
      });
      setTasks(prev => [newTask, ...prev]);
      addNotification(newTask.is_blocker ? 'CRITICAL ALERT REPORTED' : 'PROTOCOL ESTABLISHED');
    } catch (err) {
      addNotification('FAILED TO ASSIGN TASK', 'error');
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    // Optimistic Update
    const oldTasks = [...tasks];
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    
    try {
      await api.updateTask(taskId, updates);
      if (updates.status === 'Done') {
        addNotification('PROTOCOL COMPLETED');
      }
    } catch (err) {
      setTasks(oldTasks); // Revert
      addNotification('UPDATE FAILED', 'error');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      addNotification('PROTOCOL PURGED', 'info');
    } catch (err) {
      addNotification('DELETION FAILED', 'error');
    }
  };

  // CONFIGURATION ERROR STATE
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-carbon flex flex-col items-center justify-center p-4">
         <div className="max-w-md w-full bg-surface border border-red-500/50 p-8 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <div className="flex items-center gap-3 mb-6 text-red-500">
              <ShieldAlert size={32} />
              <h1 className="text-xl font-mono font-bold tracking-wider">SYSTEM_HALTED</h1>
            </div>
            <p className="text-offwhite font-mono text-sm mb-4">
              Critical configuration missing. The application cannot establish a link to the central database.
            </p>
            <div className="bg-carbon p-4 border border-border mb-6">
              <p className="text-[10px] text-silver font-mono mb-2 uppercase">Required Environment Variables</p>
              <code className="block text-xs text-accent font-mono">VITE_SUPABASE_URL</code>
              <code className="block text-xs text-accent font-mono">VITE_SUPABASE_ANON_KEY</code>
            </div>
            <p className="text-xs text-silver">
              Please check your deployment settings or .env file and reboot the system.
            </p>
         </div>
      </div>
    )
  }

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
                disabled={isAuthLoading}
                icon={isAuthLoading ? <Loader2 className="animate-spin" size={20} /> : <Github size={20} />}
              >
                {isAuthLoading ? 'ESTABLISHING UPLINK...' : 'CONNECT_GITHUB'}
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