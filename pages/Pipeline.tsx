import React, { useState } from 'react';
import { Project, ProjectStatus } from '../types';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

interface PipelineProps {
  projects: Project[];
  onAddProject: (p: Omit<Project, 'id' | 'created_at' | 'owner_id' | 'score_market' | 'score_tech' | 'status'>) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
}

const STATUS_COLS: ProjectStatus[] = ['Idea', 'Approved', 'In Progress', 'Shipped'];

export const Pipeline: React.FC<PipelineProps> = ({ projects, onAddProject, onUpdateProject, onDeleteProject }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProject({ title: newTitle, description: newDesc });
    setIsModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  const handleMove = (project: Project, direction: 'next' | 'prev') => {
    const currentIndex = STATUS_COLS.indexOf(project.status);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < STATUS_COLS.length) {
      onUpdateProject(project.id, { status: STATUS_COLS[newIndex] });
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'Idea': return 'border-l-blue-400';
      case 'Approved': return 'border-l-accent';
      case 'In Progress': return 'border-l-yellow-400';
      case 'Shipped': return 'border-l-purple-400';
      default: return 'border-l-silver';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-mono font-bold text-offwhite mb-2">PROJECT_PIPELINE</h2>
          <p className="text-silver text-sm">Visualizing development workflow.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={16} />}>INITIALIZE_PROJECT</Button>
      </header>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-6 min-w-max pb-4 h-full">
          {STATUS_COLS.map((status, colIndex) => (
            <div key={status} className="w-80 flex flex-col">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-mono text-xs font-bold text-silver tracking-widest uppercase">{status}</h3>
                <span className="bg-surface border border-border text-silver text-[10px] px-2 py-0.5 rounded-none font-mono">
                  {projects.filter(p => p.status === status).length}
                </span>
              </div>
              
              <div className="space-y-4 flex-1">
                {projects.filter(p => p.status === status).map(project => (
                  <Card key={project.id} className={`p-4 border-l-4 ${getStatusColor(project.status)} group relative`}>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                        className="text-silver/20 hover:text-red-500 p-1"
                      >
                         <Trash2 size={12} />
                      </button>
                    </div>

                    <h4 className="font-bold text-offwhite mb-2 group-hover:text-accent transition-colors pr-6">{project.title}</h4>
                    <p className="text-xs text-silver line-clamp-3 mb-4">{project.description}</p>
                    
                    <div className="flex justify-between items-center border-t border-border pt-3 mb-3">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-silver uppercase font-mono">MKT_SCORE</span>
                        <div className="w-16 h-1 bg-carbon mt-1">
                          <div className="h-full bg-accent" style={{ width: `${project.score_market}%`}}></div>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-silver uppercase font-mono">TECH_SCORE</span>
                         <div className="w-16 h-1 bg-carbon mt-1">
                          <div className="h-full bg-blue-400" style={{ width: `${project.score_tech}%`}}></div>
                        </div>
                      </div>
                    </div>

                    {/* Movement Controls */}
                    <div className="flex items-center justify-between gap-2 opacity-10 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleMove(project, 'prev')}
                        disabled={colIndex === 0}
                        className="p-1 hover:bg-white/10 disabled:opacity-0 text-silver hover:text-white transition-all"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-[10px] font-mono text-silver/30">STAGE_{colIndex + 1}</span>
                      <button 
                         onClick={() => handleMove(project, 'next')}
                         disabled={colIndex === STATUS_COLS.length - 1}
                         className="p-1 hover:bg-white/10 disabled:opacity-0 text-silver hover:text-white transition-all"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </Card>
                ))}
                {projects.filter(p => p.status === status).length === 0 && (
                   <div className="h-24 border border-dashed border-border flex items-center justify-center text-[10px] text-silver/30 font-mono">
                     NO_DATA
                   </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-carbon border border-accent p-8 w-full max-w-md shadow-[0_0_30px_rgba(190,242,100,0.1)] relative animate-fadeIn">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-silver hover:text-accent">
              <X size={20} />
            </button>
            <h3 className="text-xl font-mono font-bold text-accent mb-6">INITIALIZE NEW PROTOCOL</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-mono text-silver mb-2 uppercase">Protocol Title</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-surface border border-border p-3 text-offwhite focus:border-accent focus:outline-none font-mono text-sm"
                  placeholder="e.g. PROJECT_OMEGA"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-silver mb-2 uppercase">Directive Description</label>
                <textarea 
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full bg-surface border border-border p-3 text-offwhite focus:border-accent focus:outline-none text-sm h-32 resize-none"
                  placeholder="Describe the objectives..."
                  required
                />
              </div>
              <div className="pt-4 flex justify-end gap-4">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>ABORT</Button>
                <Button type="submit">INITIALIZE</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};