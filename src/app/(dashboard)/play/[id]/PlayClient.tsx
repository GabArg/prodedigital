"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle, Lock, ArrowLeft, Clock, Calendar, Info } from 'lucide-react';
import Link from 'next/link';
import { getCompetitionMatchesAction, getUserPredictionsAction, submitBatchPredictionsAction } from '../actions';
import { MatchOutcome } from '@/services/scoringService';

import { HandwrittenX } from '@/components/ui/HandwrittenX';
import { BrandLogo } from '@/components/ui/BrandLogo';

export default function PlayClient({ id, initialData }: { id: string, initialData?: any }) {
    const router = useRouter();
    const { user } = useAuth();

    const [competition, setCompetition] = useState<any>(initialData?.competition || initialData || null);
    const [matches, setMatches] = useState<any[]>(initialData?.matches || []);
    const [picks, setPicks] = useState<Record<string, MatchOutcome>>({});
    const [savedPicks, setSavedPicks] = useState<Record<string, MatchOutcome>>({});

    const [loading, setLoading] = useState(!initialData);
    const [submitting, setSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [warningMessage, setWarningMessage] = useState<string | null>(null);

    // 30-minute lock rule
    const isMatchLockedLocal = (startTime: string | undefined) => {
        if (!startTime) return false;
        // Simple client-side check for UI feedback
        const diff = new Date(startTime).getTime() - Date.now();
        return diff < 30 * 60 * 1000;
    };

    useEffect(() => {
        if (user && !initialData) loadData();
        else if (user && initialData && initialData.matches?.length > 0) {
            loadExistingPredictions(initialData.matches);
        }
    }, [id, user]);

    async function loadExistingPredictions(currentMatches: any[]) {
        try {
            const matchIds = currentMatches.map((m: any) => m.id);
            const existing = await getUserPredictionsAction(matchIds);
            const currentPicks: Record<string, MatchOutcome> = {};
            existing.forEach((p: any) => {
                currentPicks[p.match_id] = p.prediction as MatchOutcome;
            });
            setPicks(currentPicks);
            setSavedPicks(currentPicks);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function loadData() {
        setLoading(true);
        try {
            const data = await getCompetitionMatchesAction(id);
            if (!data) {
                setLoading(false);
                return;
            }
            setCompetition(data.competition);
            setMatches(data.matches);
            if (data.matches.length > 0) {
                await loadExistingPredictions(data.matches);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const handlePick = (matchId: string, value: MatchOutcome, startTime: string | undefined) => {
        if (isMatchLockedLocal(startTime)) return;
        setPicks(prev => ({ ...prev, [matchId]: value }));
    };

    const handleSubmit = async () => {
        if (!user) return;
        setSubmitting(true);

        const predictionsToSave = Object.entries(picks).map(([mid, val]) => ({
            matchId: mid,
            prediction: val
        }));

        const result = await submitBatchPredictionsAction(predictionsToSave);

        if (result.success) {
            if (result.warning) setWarningMessage(result.warning);
            setSavedPicks({ ...picks }); // Update saved state
            setShowSuccessModal(true);
        } else {
            alert('Error: ' + result.error);
        }
        setSubmitting(false);
    };

    // Helper to render button content
    const renderButtonContent = (matchId: string, option: MatchOutcome, locked: boolean) => {
        const isSelected = picks[matchId] === option;
        const isSaved = savedPicks[matchId] === option;

        if (locked && !isSelected) return <Lock size={18} />;

        if (isSelected) {
            if (isSaved) return <BrandLogo className="w-8 h-6 border-2" />; // "Logo when sent"
            return <HandwrittenX className="w-10 h-10 text-current" />; // "X as if written"
        }

        // Empty when not selected
        return null;
    };

    if (loading) return (
        <div className="container py-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4" />
            <div className="text-slate-500 font-medium">Cargando boleta de juego...</div>
        </div>
    );

    if (!competition) return <div className="p-20 text-center text-slate-500">Boleta no encontrada.</div>;

    const hasPicks = Object.keys(picks).length > 0;

    return (
        <div className="container py-10 max-w-5xl space-y-10">
            {/* Header Navigation */}
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
                <div className="flex flex-col gap-4">
                    <Link href="/play" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
                        <ArrowLeft size={16} /> Volver a la Zona de Juego
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 px-3 py-1 font-bold">EN JUEGO</Badge>
                            <span className="text-slate-500 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-white/[0.03] border border-white/5 px-3 py-1 rounded-full">
                                <Clock size={14} className="text-amber-500" /> Cierre: 30 min antes
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight text-white uppercase italic">
                            {competition.name}
                        </h1>
                        <p className="text-amber-500 text-2xl font-black font-display uppercase tracking-widest mt-1">
                            {competition.description || 'FECHA ACTUAL'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#0F243A] border border-white/10 p-10 rounded-[32px] max-w-md w-full text-center shadow-2xl relative">
                        <div className="flex justify-center mb-8">
                            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center border-2 border-green-500 text-green-500 shadow-lg shadow-green-500/20">
                                <CheckCircle size={48} />
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">¡PRONÓSTICO GUARDADO!</h2>
                        {warningMessage && (
                            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-sm font-bold">
                                {warningMessage}
                            </div>
                        )}
                        <p className="text-slate-400 mb-10 font-medium">
                            Tus predicciones han sido registradas exitosamente. Podrás ver tus puntos una vez finalizados los partidos.
                        </p>
                        <div className="flex flex-col gap-4">
                            <Link href="/dashboard" className="w-full">
                                <Button className="w-full h-14 bg-white text-slate-950 hover:bg-slate-100 font-black text-lg rounded-2xl">
                                    IR AL DASHBOARD
                                </Button>
                            </Link>
                            <Button variant="secondary" onClick={() => setShowSuccessModal(false)} className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold h-12 rounded-xl">
                                SEGUIR EDITANDO
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table Header Wrapper */}
            <div className="space-y-4">
                {/* Table Header Wrapper (Hidden on mobile, used for alignment on desktop) */}
                <div className="hidden md:flex items-center justify-between px-6 mb-4 text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">
                    <div className="w-16 text-center">1</div>
                    <div className="flex-1 text-center">LOCAL</div>
                    <div className="w-16 text-center">EMPATE (X)</div>
                    <div className="flex-1 text-center">VISITANTE</div>
                    <div className="w-16 text-center">2</div>
                </div>

                {/* Match List */}
                <div className="space-y-4 mb-32">
                    {matches.map((match: any) => {
                        const startTime = match.start_time || match.match_date; // Fallback
                        const locked = isMatchLockedLocal(startTime);
                        const isLive = new Date().getTime() >= new Date(startTime).getTime();

                        return (
                            <div key={match.id} className={`group relative bg-white/[0.02] border transition-all p-4 md:p-6 rounded-[24px] 
                                ${locked ? 'border-white/5 opacity-80' : 'border-white/5 hover:bg-white/[0.04] hover:border-white/10'}
                            `}>
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">

                                    {/* [1] Selection */}
                                    <div className="order-2 md:order-1">
                                        <button
                                            disabled={locked}
                                            onClick={() => handlePick(match.id, '1', startTime)}
                                            className={`
                                                w-14 h-14 md:w-16 md:h-16 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 relative
                                                ${locked ? 'border-white/5 bg-white/[0.01] cursor-not-allowed text-slate-700' : 'border-amber-500/20 hover:border-amber-500 text-slate-500'}
                                                ${picks[match.id] === '1' ? (locked ? 'bg-amber-500/50 border-transparent text-slate-900' : 'border-amber-500 text-amber-500 shadow-lg shadow-amber-500/10 scale-110 z-10') : ''}
                                            `}
                                        >
                                            {renderButtonContent(match.id, '1', locked)}
                                        </button>
                                    </div>

                                    {/* Local Team */}
                                    <div className="order-1 md:order-2 flex-1 text-center w-full px-2">
                                        <div className={`text-xl md:text-2xl font-black uppercase tracking-tight truncate ${locked ? 'text-slate-500' : 'text-white group-hover:text-amber-500 transition-colors'}`}>
                                            {match.home_team}
                                        </div>
                                    </div>

                                    {/* [X] Selection */}
                                    <div className="order-4 md:order-3">
                                        <button
                                            disabled={locked}
                                            onClick={() => handlePick(match.id, 'X', startTime)}
                                            className={`
                                                w-14 h-14 md:w-16 md:h-16 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 relative
                                                ${locked ? 'border-white/5 bg-white/[0.01] cursor-not-allowed text-slate-700' : 'border-blue-500/20 hover:border-blue-500 text-slate-500'}
                                                ${picks[match.id] === 'X' ? (locked ? 'bg-blue-500/50 border-transparent text-white' : 'border-blue-500 text-blue-500 shadow-lg shadow-blue-500/10 scale-110 z-10') : ''}
                                            `}
                                        >
                                            {renderButtonContent(match.id, 'X', locked)}
                                        </button>
                                    </div>

                                    {/* Away Team */}
                                    <div className="order-3 md:order-4 flex-1 text-center w-full px-2">
                                        <div className={`text-xl md:text-2xl font-black uppercase tracking-tight truncate ${locked ? 'text-slate-500' : 'text-white group-hover:text-amber-500 transition-colors'}`}>
                                            {match.away_team}
                                        </div>
                                    </div>

                                    {/* [2] Selection */}
                                    <div className="order-5">
                                        <button
                                            disabled={locked}
                                            onClick={() => handlePick(match.id, '2', startTime)}
                                            className={`
                                                w-14 h-14 md:w-16 md:h-16 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 relative
                                                ${locked ? 'border-white/5 bg-white/[0.01] cursor-not-allowed text-slate-700' : 'border-amber-500/20 hover:border-amber-500 text-slate-500'}
                                                ${picks[match.id] === '2' ? (locked ? 'bg-amber-500/50 border-transparent text-slate-900' : 'border-amber-500 text-amber-500 shadow-lg shadow-amber-500/10 scale-110 z-10') : ''}
                                            `}
                                        >
                                            {renderButtonContent(match.id, '2', locked)}
                                        </button>
                                    </div>
                                </div>

                                {/* Match Meta Info */}
                                <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-t border-white/5 pt-4">
                                    <span className="flex items-center gap-2"><Calendar size={14} className="text-blue-500" /> {new Date(startTime).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-2"><Clock size={14} className="text-blue-500" /> {new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} HS</span>
                                    {locked && (
                                        <span className={`flex items-center gap-2 px-3 py-1 rounded-full border ${isLive ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'text-slate-400 bg-slate-500/10 border-slate-500/20'}`}>
                                            {isLive ? 'PARTIDO EN JUEGO' : 'PRONÓSTICO CERRADO'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Floating Bar */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50">
                <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-6 rounded-[32px] shadow-2xl shadow-black/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-white">
                            <span className="text-xl font-black">{Object.keys(picks).length}</span>
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tus Selecciones</div>
                            <div className="text-white font-bold">{Object.keys(picks).length === matches.length ? '¡Boleta Completa!' : 'Completa todos los partidos'}</div>
                        </div>
                    </div>
                    <Button
                        size="lg"
                        className={`
                            h-16 px-12 rounded-2xl text-xl font-black transition-all duration-300
                            ${hasPicks ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-white/5 text-slate-500 cursor-not-allowed'}
                        `}
                        disabled={!hasPicks || submitting}
                        onClick={handleSubmit}
                    >
                        {submitting ? 'GUARDANDO...' : 'ENVIAR PRONÓSTICO'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
