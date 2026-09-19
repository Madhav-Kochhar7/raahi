import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', fullWidth, className = '', children, ...props }) => {
    let baseClass = 'px-4 py-3 rounded-2xl font-bold transition-all duration-200 flex items-center justify-center ';
    
    if (variant === 'primary') {
        baseClass += 'bg-primary text-bg-app hover:bg-primary-dark glow-primary';
    } else if (variant === 'secondary') {
        baseClass += 'bg-surface-elevated text-text-primary border border-border-subtle hover:border-primary/50 hover:text-primary';
    } else if (variant === 'ghost') {
        baseClass += 'bg-transparent text-text-muted hover:text-text-primary';
    }

    const widthClass = fullWidth ? ' w-full' : '';
    
    return (
        <button className={`${baseClass}${widthClass} ${className}`} {...props}>
            {children}
        </button>
    );
};
