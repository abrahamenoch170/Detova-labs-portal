import React, { useState, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { User, Task, Project } from '../types';
import { PlusCircle, AlertOctagon, ExternalLink, CheckCircle, ArrowUp, ArrowDown, ListFilter, ArrowUpDown, Terminal, Zap, Trash2, Square } from 'lucide-react';

interface DashboardProps {
  user: User;
  tasks: Task[];
  projects: Project[];
  onAddTask: (task: Partial<Task>) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onChangeView: (view: any) => void;
}

type SortKey = 'created_at' | 'status';
type SortDirection = 'asc' | 'desc';

export const Dashboard: React.FC<DashboardProps> = ({ user, tasks, projects, onAddTask, onUpdateTask, onDeleteTask, onChangeView }) => {
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'created_at',
    direction: 'desc'
  });

  // Task Creation State
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [isBlocker, setIsBlocker] = useState(false);
  
  const taskInputRef = useRef<HTMLInputElement>(null);

  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskDesc.trim()) return;

    onAddTask({
      description: newTaskDesc,
      project_id: selectedProjectId,
      is_blocker: isBlocker
    });

    setNewTaskDesc('');
    setIsBlocker(false);
  };

  const handleReportBlocker = () => {
    setIsBlocker(true);
    if (taskInputRef.current) {
      taskInputRef.current.focus();
      taskInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const getSortedTasks = () => {
    const myTasks = tasks.filter(t => t.assigned_to === user.id && t.status !== 'Done');
    
    return [...myTasks].sort((a, b) => {
      let comparison = 0;
      
      if (sortConfig.key === 'status') {
        const priority = { 'Blocked': 3, 'Todo': 2, 'Done': 1 };
        comparison = priority[a.status] - priority[b.status];
      } else {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  };

  const sortedTasks = getSortedTasks();

  const SortButton = ({ label, sortKey }: { label: string, sortKey: SortKey }) => {
    const isActive = sortConfig.key === sortKey;
    return (
      <button 
        onClick={() => handleSort(sortKey)}
        className={`group flex items-center gap-2 px-3 py-1.5 border text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-200 ${
          isActive 
            ? 'text-accent border-accent bg-accent/10 shadow-[0_0_10px_rgba(190,242,100,0.2)]' 
            : 'text-silver/50 border-transparent hover:text-silver hover:border-silver/30 hover:bg-white/5'
        }`}
      >
        <span>{label}</span>
        {isActive ? (
          sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
        ) : (
          <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
        )}
      </button>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <header>
        <h2 className="text-2xl font-mono font-bold text-offwhite mb-2">COMMAND_CENTER</h2>
        <p className="text-silver text-sm">Welcome back, {user.role} {user.full_name}. Systems operational.</p>
      </header>

      {/* Quick Actions */}
      <section>
        <h3 className="text-xs font-mono font-bold text-accent mb-4 tracking-widest uppercase">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="group cursor-pointer" onClick={() => onChangeView('pipeline')}>
            <div className="flex items-start justify-between mb-4">
              <PlusCircle className="text-silver group-hover:text-accent transition-colors duration-200" size={24} />
              <span className="text-[10px] font-mono text-silver/50">PN-01</span>
            </div>
            <h4 className="text-lg font-bold text-offwhite mb-2">Submit Idea</h4>
            <p className="text-sm text-silver">Initialize new project protocol.</p>
          </Card>

          <Card className="group cursor-pointer" onClick={handleReportBlocker}>
            <div className="flex items-start justify-between mb-4">
              <AlertOctagon className="text-silver group-hover:text-red-500 transition-colors duration-200" size={24} />
              <span className="text-[10px] font-mono text-silver/50">ER-99</span>
            </div>
            <h4 className="text-lg font-bold text-offwhite mb-2">Report Blocker</h4>
            <p className="text-sm text-silver">Signal critical impediment.</p>
          </Card>

          <Card className="group cursor-pointer" onClick={() => onChangeView('resources')}>
            <div className="flex items-start justify-between mb-4">
              <ExternalLink className="text-silver group-hover:text-blue-400 transition-colors duration-200" size={24} />
              <span className="text-[10px] font-mono text-silver/50">DB-00</span>
            </div>
            <h4 className="text-lg font-bold text-offwhite mb-2">Open Library</h4>
            <p className="text-sm text-silver">Access external resource nodes.</p>
          </Card>
        </div>
      </section>

      {/* Protocol Initialization Form */}
      <section>
        <Card className={`border-t-4 p-0 overflow-hidden transition-colors duration-300 ${isBlocker ? 'border-t-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-t-accent'}`}>
          <div className="bg-surface/50 p-4 border-b border-border flex items-center gap-2">
             <Terminal size={16} className={isBlocker ? "text-red-500" : "text-accent"} />
             <h3 className={`text-xs font-mono font-bold tracking-widest uppercase ${isBlocker ? "text-red-500" : "text-accent"}`}>
               {isBlocker ? 'CRITICAL_PROTOCOL_INIT // BLOCKER_REPORT' : 'PROTOCOL_INIT // NEW_TASK'}
             </h3>
          </div>
          <form onSubmit={handleCreateTask} className="p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-6">
              <label className="block text-[10px] font-mono text-silver mb-2 uppercase">Protocol Description</label>
              <input 
                ref={taskInputRef}
                type="text" 
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                className={`w-full bg-carbon border p-3 text-offwhite focus:outline-none font-mono text-sm placeholder-silver/30 transition-colors ${
                  isBlocker ? 'border-red-900 focus:border-red-500' : 'border-border focus:border-accent'
                }`}
                placeholder={isBlocker ? "Describe the critical failure..." : "Enter directive details..."}
              />
            </div>
            
            <div className="md:col-span-3">
              <label className="block text-[10px] font-mono text-silver mb-2 uppercase">Linked Project</label>
              <select 
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-carbon border border-border p-3 text-offwhite focus:border-accent focus:outline-none font-mono text-sm appearance-none"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 flex gap-2">
              <button
                type="button"
                onClick={() => setIsBlocker(!isBlocker)}
                className={`flex-1 flex items-center justify-center border p-3 transition-colors ${isBlocker ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-border bg-carbon text-silver hover:border-silver'}`}
                title="Toggle Critical Status"
              >
                <AlertOctagon size={18} />
              </button>
              <Button type="submit" disabled={!newTaskDesc} className={`flex-[3] ${isBlocker ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}>
                <Zap size={16} className="mr-2" />
                {isBlocker ? 'REPORT' : 'INITIALIZE'}
              </Button>
            </div>
          </form>
        </Card>
      </section>

      {/* My Mission */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-mono font-bold text-accent tracking-widest uppercase">My Mission Protocols</h3>
            <Badge variant="neutral">{sortedTasks.length} PENDING</Badge>
          </div>
          
          <div className="flex items-center gap-2 bg-surface/50 p-1 rounded-sm border border-border/50">
            <div className="flex items-center px-2 text-silver/50">
              <ListFilter size={14} />
              <span className="ml-2 text-[10px] font-mono font-bold hidden sm:inline">SORT:</span>
            </div>
            <SortButton label="STATUS" sortKey="status" />
            <div className="w-px h-4 bg-border/50 mx-1"></div>
            <SortButton label="DATE" sortKey="created_at" />
          </div>
        </div>
        
        {sortedTasks.length === 0 ? (
           <Card className="border-dashed border-silver/20 flex flex-col items-center justify-center py-12 bg-transparent hover:shadow-none hover:border-accent/30">
             <CheckCircle className="text-accent/50 mb-4" size={48} />
             <p className="text-offwhite font-mono text-lg mb-1">ALL SYSTEMS NOMINAL</p>
             <p className="text-silver text-sm">Awaiting directives.</p>
           </Card>
        ) : (
          <div className="space-y-3">
            {sortedTasks.map(task => (
              <div 
                key={task.id} 
                className={`
                  bg-surface border border-border p-4 flex items-center justify-between 
                  transition-all duration-300 group relative overflow-hidden
                  hover:shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:-translate-y-0.5
                  ${task.is_blocker 
                    ? 'border-l-4 border-l-danger hover:border-danger/50' 
                    : 'border-l-4 border-l-accent hover:border-accent/50'
                  }
                `}
              >
                {/* Background scanline effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

                <div className="flex items-center gap-4 relative z-10 flex-1">
                   {/* Complete Button */}
                  <button 
                    onClick={() => onUpdateTask(task.id, { status: 'Done' })}
                    className={`
                      w-6 h-6 flex items-center justify-center border transition-all duration-200
                      ${task.is_blocker 
                        ? 'border-red-500/50 hover:bg-red-500 hover:text-white text-transparent' 
                        : 'border-accent/50 hover:bg-accent hover:text-carbon text-transparent'
                      }
                    `}
                    title="Mark Complete"
                  >
                    <CheckCircle size={14} />
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`
                      font-medium text-sm transition-colors duration-200 truncate pr-4
                      ${task.is_blocker ? 'text-danger group-hover:text-red-400' : 'text-offwhite group-hover:text-accent'}
                    `}>
                      {task.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-[10px] text-silver/60 font-mono tracking-wider">
                        ID: <span className="text-silver">{task.id.slice(-4).toUpperCase()}</span>
                      </p>
                      <span className="text-[10px] text-silver/30 font-mono">|</span>
                      <p className="text-[10px] text-silver/60 font-mono tracking-wider">
                        REQ: <span className="text-silver">{new Date(task.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex items-center gap-3">
                  {task.is_blocker ? (
                    <Badge variant="error" className="shadow-[0_0_15px_rgba(239,68,68,0.4)] border-danger text-danger bg-danger/10 animate-pulse">
                      ⚠ BLOCKER
                    </Badge>
                  ) : (
                    <Badge variant="neutral" className="group-hover:border-accent/50 group-hover:text-accent transition-colors">
                      {task.status}
                    </Badge>
                  )}
                  
                  <button 
                    onClick={() => onDeleteTask(task.id)}
                    className="text-silver/20 hover:text-red-500 transition-colors p-1"
                    title="Delete Protocol"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};