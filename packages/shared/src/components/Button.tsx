import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', fullWidth, className = '', children, ...props }) => {
    const baseClass = variant === 'secondary' ? 'raahi-btn raahi-btn-secondary' : 'raahi-btn';
    const widthClass = fullWidth ? ' w-full' : ''; // Fallback for utility usage in apps
    
    return (
        <button className={`${baseClass}${widthClass} ${className}`} {...props}>
            {children}
        </button>
    );
};
