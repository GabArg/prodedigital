
import React from 'react';

export const HandwrittenX = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={{ overflow: 'visible' }}
    >
        {/* Stroke 1: Top-left to Bottom-right */}
        <path d="M 20 20 Q 50 50 80 80" className="animate-[draw_0.3s_ease-out_forwards]" />

        {/* Stroke 2: Top-right to Bottom-left */}
        <path d="M 80 20 Q 50 50 20 80" className="animate-[draw_0.3s_ease-out_0.1s_forwards]" />
    </svg>
);
