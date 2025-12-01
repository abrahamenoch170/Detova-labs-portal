import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noHover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', noHover = false }) => {
  return (
    <div className={`bg-surface border border-border p-6 transition-all duration-300 ${!noHover ? 'hover:border-accent/50 hover:shadow-[0_0_15px_rgba(0,0,0,0.5)]' : ''} ${className}`}>
      {children}
    </div>
  );
};
