import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'neutral' | 'info';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const variants = {
    success: "text-accent border-accent",
    warning: "text-yellow-400 border-yellow-400",
    error: "text-red-500 border-red-500",
    neutral: "text-silver border-border",
    info: "text-blue-400 border-blue-400"
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 border text-[10px] font-mono font-bold uppercase tracking-wider bg-black/20 ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
