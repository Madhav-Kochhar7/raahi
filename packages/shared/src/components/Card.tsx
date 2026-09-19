import React from 'react';

export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-surface-elevated rounded-2xl p-5 border border-border-subtle ${className}`}>
        {children}
    </div>
);
