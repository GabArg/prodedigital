import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'success' | 'warning' | 'secondary' | 'outline' | 'danger' | 'info';
}

export const Badge = ({ children, className = '', variant = 'default' }: BadgeProps) => {
    const variants = {
        default: 'bg-primary/10 text-primary border-primary/20',
        success: 'bg-green-500/10 text-green-500 border-green-500/20',
        warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        secondary: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
        outline: 'bg-transparent border-slate-700 text-slate-400',
        danger: 'bg-red-500/10 text-red-500 border-red-500/20',
        info: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};
