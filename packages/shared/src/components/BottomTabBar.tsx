import React from 'react';

export interface TabItem {
    id: string;
    label: string;
    icon: React.ReactNode;
}

export interface BottomTabBarProps {
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (id: string) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm bg-surface-elevated/95 backdrop-blur-md rounded-[32px] p-2 flex justify-between items-center border border-border-subtle shadow-2xl z-50">
            {tabs.map(tab => {
                const isActive = tab.id === activeTab;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-200 ${isActive ? 'text-primary' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        <div className={`mb-1 transition-transform ${isActive ? 'scale-110' : ''}`}>
                            {tab.icon}
                        </div>
                        <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};
