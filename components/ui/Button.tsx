import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon,
  ...props 
}) => {
  const baseStyles = "font-mono font-bold uppercase tracking-wider flex items-center justify-center transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-1 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed sharp-edges";
  
  const variants = {
    primary: "bg-accent text-carbon hover:bg-accent-hover hover:shadow-glow",
    secondary: "bg-surface border border-border text-offwhite hover:border-accent hover:text-accent",
    danger: "bg-danger/10 border border-danger/50 text-danger hover:bg-danger hover:text-white",
    ghost: "bg-transparent text-silver hover:text-offwhite hover:bg-surface/50"
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-6 text-sm",
    lg: "h-12 px-8 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
