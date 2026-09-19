import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface ListRowProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onClick?: () => void;
}

export const ListRow: React.FC<ListRowProps> = ({ icon, title, subtitle, onClick }) => {
    return (
        <button 
            onClick={onClick}
            className="w-full flex items-center gap-4 p-4 bg-surface-elevated rounded-2xl border border-border-subtle hover:border-primary/30 transition-all text-left"
        >
            <div className="text-text-muted flex-shrink-0">
                {icon}
            </div>
            <div className="flex-1 overflow-hidden">
                <div className="font-bold text-text-primary truncate">{title}</div>
                {subtitle && <div className="text-sm text-text-muted truncate">{subtitle}</div>}
            </div>
            <div className="text-text-muted">
                <ChevronRight size={20} />
            </div>
        </button>
    );
};
