'use client';

import { useState } from 'react';
import { submitPredictionAction } from '@/app/actions/betting-actions';
import { Loader2 } from 'lucide-react';

interface BettingCardProps {
    matchId: string;
    existingPrediction?: '1' | 'X' | '2' | null;
    locked: boolean;
}

export function BettingCard({ matchId, existingPrediction, locked }: BettingCardProps) {
    const [prediction, setPrediction] = useState<'1' | 'X' | '2' | null>(existingPrediction || null);
    const [loading, setLoading] = useState(false);

    const handlePredict = async (value: '1' | 'X' | '2') => {
        if (locked || loading || prediction === value) return; // Prevent re-click or locked

        // Optimistic update
        const prev = prediction;
        setPrediction(value);
        setLoading(true);

        const res = await submitPredictionAction(matchId, value);

        if (!res.success) {
            alert(res.error);
            setPrediction(prev); // Rollback
        }
        setLoading(false);
    };

    const getBtnClass = (val: '1' | 'X' | '2') => {
        const isSelected = prediction === val;
        const base = "w-10 h-8 rounded flex items-center justify-center font-bold text-sm transition-all ";

        if (locked) {
            return base + (isSelected ? "bg-slate-700 text-white" : "bg-slate-800 text-slate-600 opacity-50 cursor-not-allowed");
        }

        if (isSelected) {
            return base + "bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]";
        }

        return base + "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white";
    };

    return (
        <div className="flex bg-slate-900/50 p-1 rounded-lg gap-1 border border-white/5">
            <button onClick={() => handlePredict('1')} disabled={locked} className={getBtnClass('1')}>1</button>
            <button onClick={() => handlePredict('X')} disabled={locked} className={getBtnClass('X')}>X</button>
            <button onClick={() => handlePredict('2')} disabled={locked} className={getBtnClass('2')}>2</button>
            {loading && <div className="absolute right-2 top-2"><Loader2 className="animate-spin text-amber-500" size={12} /></div>}
        </div>
    );
}
