import React from 'react';

export interface LocationInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    variant: 'pickup' | 'destination';
}

export const LocationInput: React.FC<LocationInputProps> = ({ variant, className = '', ...props }) => {
    const dotColor = variant === 'pickup' ? 'bg-primary' : 'bg-secondary';
    
    return (
        <div className={`relative flex items-center bg-surface-elevated rounded-2xl border border-border-subtle focus-within:border-primary/50 transition-colors ${className}`}>
            <div className="pl-4 flex-shrink-0">
                <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
            </div>
            <input 
                className="w-full bg-transparent border-none text-text-primary placeholder:text-text-muted p-4 focus:outline-none focus:ring-0"
                {...props}
            />
        </div>
    );
};
