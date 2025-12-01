import React from 'react';
import { RESOURCES } from '../constants';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ExternalLink } from 'lucide-react';

export const Resources: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <header>
        <h2 className="text-2xl font-mono font-bold text-offwhite mb-2">RESOURCE_HUB</h2>
        <p className="text-silver text-sm">External toolchain access points.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {RESOURCES.map(resource => (
          <Card key={resource.id} className="group">
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 bg-carbon border border-border flex items-center justify-center text-2xl group-hover:border-accent group-hover:text-accent transition-colors">
                {resource.icon}
              </div>
              <span className="text-[10px] font-mono border border-border px-2 py-1 text-silver uppercase">{resource.category}</span>
            </div>
            
            <h3 className="text-xl font-bold text-offwhite mb-2">{resource.name}</h3>
            <p className="text-sm text-silver mb-6 font-mono truncate">{resource.url}</p>
            
            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="block">
              <Button variant="secondary" className="w-full" icon={<ExternalLink size={16} />}>
                LAUNCH_NODE
              </Button>
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
};
