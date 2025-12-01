import React, { useEffect } from 'react';
import { Notification } from '../../types';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

interface ToastContainerProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {notifications.map((n) => (
        <ToastItem key={n.id} notification={n} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ notification: Notification; onDismiss: (id: string) => void }> = ({ notification, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  const icons = {
    success: <CheckCircle size={18} className="text-carbon" />,
    error: <AlertCircle size={18} className="text-white" />,
    info: <Info size={18} className="text-accent" />
  };

  const styles = {
    success: "bg-accent text-carbon border-accent",
    error: "bg-red-500 text-white border-red-500",
    info: "bg-surface text-offwhite border-accent"
  };

  return (
    <div className={`
      pointer-events-auto min-w-[300px] p-4 border-l-4 shadow-[0_5px_20px_rgba(0,0,0,0.5)] 
      flex items-center justify-between gap-3 animate-slideInRight
      ${styles[notification.type]}
    `}>
      <div className="flex items-center gap-3">
        {icons[notification.type]}
        <span className="font-mono text-xs font-bold uppercase tracking-wider">{notification.message}</span>
      </div>
      <button onClick={() => onDismiss(notification.id)} className="opacity-50 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
};