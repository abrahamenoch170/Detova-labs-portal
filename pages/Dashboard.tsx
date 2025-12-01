import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { User, Task, Project } from '../types';
import { PlusCircle, AlertOctagon, ExternalLink, CheckCircle, ArrowUp, ArrowDown, ListFilter, ArrowUpDown, Terminal, Zap } from 'lucide-react';

interface DashboardProps {
  user: User;
  tasks: Task[];
  projects: Project[];
  onAddTask: (task: Partial<Task>) => void;
  onChangeView: (view: any) => void;
}

type SortKey = 'created_at' | 'status';
type SortDirection = 'asc' | 'desc';

export const Dashboard: React.FC<DashboardProps> = ({ user, tasks, projects, onAddTask, onChangeView }) => {
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'created_at',
    direction: 'desc'
  });

  // Task Creation State
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [isBlocker, setIsBlocker] = useState(false);

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

          <Card className="group cursor-pointer">
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
        <Card className="border-t-4 border-t-accent p-0 overflow-hidden">
          <div className="bg-surface/50 p-4 border-b border-border flex items-center gap-2">
             <Terminal size={16} className="text-accent" />
             <h3 className="text-xs font-mono font-bold text-accent tracking-widest uppercase">PROTOCOL_INIT // NEW_TASK</h3>
          </div>
          <form onSubmit={handleCreateTask} className="p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-6">
              <label className="block text-[10px] font-mono text-silver mb-2 uppercase">Protocol Description</label>
              <input 
                type="text" 
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                className="w-full bg-carbon border border-border p-3 text-offwhite focus:border-accent focus:outline-none font-mono text-sm placeholder-silver/30"
                placeholder="Enter directive details..."
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
              <Button type="submit" disabled={!newTaskDesc} className="flex-[3]">
                <Zap size={16} className="mr-2" />
                INITIALIZE
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
             <p className="text-silver text-sm">No active protocols assigned.</p>
           </Card>
        ) : (
          <div className="space-y-3">
            {sortedTasks.map(task => (
              <div key={task.id} className="bg-surface border-l-2 border-l-accent border-y border-r border-border p-4 flex items-center justify-between hover:bg-white/5 transition-all duration-200 group hover:border-l-accent-hover hover:shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${task.is_blocker ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]'}`}></div>
                  <div>
                    <p className="text-offwhite font-medium text-sm group-hover:text-accent transition-colors">{task.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-silver/60 font-mono group-hover:text-silver/80">ID: {task.id.toUpperCase()}</p>
                      <span className="text-[10px] text-silver/40 font-mono">|</span>
                      <p className="text-xs text-silver/60 font-mono group-hover:text-silver/80">
                        CREATED: {new Date(task.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
                {task.is_blocker ? (
                  <Badge variant="error" className="shadow-[0_0_10px_rgba(239,68,68,0.2)]">BLOCKER</Badge>
                ) : (
                  <Badge variant="neutral">{task.status}</Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};