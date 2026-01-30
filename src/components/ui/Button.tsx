import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'default';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

export const Button = ({
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    ...props
}: ButtonProps) => {
    const variants = {
        primary: 'bg-amber-500 text-black hover:bg-amber-400 shadow-md', // Matching yellow brand
        default: 'bg-primary text-black hover:bg-primary/90',
        secondary: 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700',
        ghost: 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5',
        danger: 'bg-red-600 text-white hover:bg-red-500',
        outline: 'bg-transparent border border-white/10 text-slate-300 hover:border-primary hover:text-white'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base font-bold',
        icon: 'p-2'
    };

    return (
        <button
            className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <>
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {children}
                </>
            ) : children}
        </button>
    );
};
