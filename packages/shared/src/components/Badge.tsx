import React from 'react';

export const Badge: React.FC<{ children: React.ReactNode, className?: string, variant?: 'primary' | 'secondary' }> = ({ children, className = '', variant = 'primary' }) => {
    const variantClasses = variant === 'primary' 
        ? 'bg-primary/10 text-primary border-primary/20' 
        : 'bg-secondary/10 text-secondary border-secondary/20';

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${variantClasses} ${className}`}>
            {children}
        </span>
    );
};
