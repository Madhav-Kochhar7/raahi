import React from 'react';

export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`raahi-card ${className}`}>
        {children}
    </div>
);
