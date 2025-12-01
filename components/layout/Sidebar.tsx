import React from 'react';
import { View, User } from '../../types';
import { LayoutDashboard, Trello, Package, LogOut, Terminal, User as UserIcon } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
  user: User | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, user, onLogout }) => {
  const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'pipeline', label: 'Pipeline', icon: <Trello size={20} /> },
    { id: 'resources', label: 'Resources', icon: <Package size={20} /> },
  ];

  return (
    <aside className="w-64 bg-carbon border-r border-border h-screen flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 text-accent mb-1">
          <Terminal size={24} />
          <h1 className="font-mono font-bold text-lg tracking-tighter">DETOVA_LABS</h1>
        </div>
        <div className="text-[10px] text-silver/50 font-mono tracking-widest pl-9">INTERNAL OS v2.0</div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 border-l-2 ${
              currentView === item.id
                ? 'bg-surface text-accent border-accent'
                : 'text-silver border-transparent hover:text-offwhite hover:bg-surface/50'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-border bg-surface/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-carbon border border-border flex items-center justify-center overflow-hidden">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="text-silver" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-offwhite truncate font-mono">{user?.full_name}</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              <p className="text-xs text-silver truncate">ONLINE</p>
            </div>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-mono text-red-400 hover:bg-red-900/20 hover:text-red-300 border border-transparent hover:border-red-900/50 transition-colors"
        >
          <LogOut size={14} />
          TERMINATE_SESSION
        </button>
      </div>
    </aside>
  );
};
