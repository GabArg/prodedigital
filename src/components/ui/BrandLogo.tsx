
import React from 'react';

export const BrandLogo = ({ className = "w-10 h-7" }: { className?: string }) => (
    <div className={`${className} border-[2.5px] border-amber-500 bg-white flex items-center justify-center rounded-[1px]`}>
        <div className="w-[60%] h-[50%] bg-[#0B1C2D]" />
    </div>
);
