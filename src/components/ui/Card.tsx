import React from 'react';

export interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const Card = ({ children, className = '', onClick }: CardProps) => {
    return (
        <div
            onClick={onClick}
            className={`bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl ${onClick ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''} ${className}`}
        >
            {children}
        </div>
    );
};
