"use client";
import React, { useState, useEffect } from 'react';
import {
    getAllSlipsAction,
    getSlipMatchesAction,
    updateMatchResultAction,
    settleSlipPointsAction
} from './actions';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { Lock, Save, RefreshCw, Calculator, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminResultsPage() {
    const { user, profile, isLoading: authLoading } = useAuth();
    const [slips, setSlips] = useState<any[]>([]);
    const [selectedSlipId, setSelectedSlipId] = useState<string | null>(null);
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [settling, setSettling] = useState(false);

    useEffect(() => {
        loadSlips();
    }, []);

    useEffect(() => {
        if (selectedSlipId) {
            loadMatches(selectedSlipId);
        }
    }, [selectedSlipId]);

    async function loadSlips() {
        setLoading(true);
        const data = await getAllSlipsAction();
        setSlips(data || []);
        if (data && data.length > 0 && !selectedSlipId) {
            setSelectedSlipId(data[0].id);
        }
        setLoading(false);
    }

    async function loadMatches(id: string) {
        setMatches([]);
        const data = await getSlipMatchesAction(id);
        setMatches(data || []);
    }

    // Hardened Admin Check
    if (authLoading) return <div className="p-20 text-center text-white">Cargando...</div>;

    if (!user || profile?.role !== 'admin') {
        return (
            <div className="container py-20 text-center">
                <div className="inline-flex p-4 rounded-full bg-red-500/20 text-red-500 mb-4">
                    <Lock size={48} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Acceso Denegado</h2>
                <p className="text-slate-400">No tienes permisos de administrador para ver esta sección.</p>
                <Link href="/dashboard"><Button variant="secondary" className="mt-6">Volver al Dashboard</Button></Link>
            </div>
        );
    }

    async function handleSetResult(matchId: string, result: '1' | 'X' | '2') {
        setUpdatingId(matchId);
        const res = await updateMatchResultAction(matchId, result);
        if (res.success) {
            if (selectedSlipId) loadMatches(selectedSlipId);
        } else {
            alert('Error: ' + res.error);
        }
        setUpdatingId(null);
    }

    async function handleSettle() {
        if (!selectedSlipId) return;
        setSettling(true);
        const res = await settleSlipPointsAction(selectedSlipId);
        if (res.success) {
            alert(`Puntos calculados con éxito para ${res.count} predicciones.`);
        } else {
            alert('Error al liquidar puntos');
        }
        setSettling(false);
    }

    const selectedSlip = slips.find(s => s.id === selectedSlipId);

    return (
        <div className="container py-8 max-w-5xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                        <Lock className="text-amber-500" size={32} />
                        Gestión de Resultados
                    </h1>
                    <p className="text-slate-400">Panel de Administrador para cargar resultados finales y liquidar puntos.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
                {/* Sidebar: Slips */}
                <div className="col-span-1 space-y-2">
                    <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-2">Boletas/Jornadas</h3>
                    {slips.map(slip => (
                        <button
                            key={slip.id}
                            onClick={() => setSelectedSlipId(slip.id)}
                            className={`w-full text-left p-3 rounded-lg text-sm transition-colors border ${selectedSlipId === slip.id ? 'bg-primary text-black font-bold border-primary' : 'bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-700'}`}
                        >
                            {slip.round_name}
                            <div className="opacity-70 text-xs font-normal">{slip.tournament_name}</div>
                        </button>
                    ))}
                    {loading && <div className="text-slate-500 text-sm italic">Cargando...</div>}
                </div>

                {/* Main: Match List */}
                <div className="col-span-3">
                    <Card className="bg-slate-900 border-slate-800 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-white">{selectedSlip?.round_name}</h2>
                                <p className="text-xs text-slate-500">{selectedSlip?.tournament_name}</p>
                            </div>
                            <Button
                                onClick={handleSettle}
                                disabled={settling || matches.length === 0}
                                className="gap-2 bg-green-600 hover:bg-green-700"
                            >
                                {settling ? <Loader2 className="animate-spin" size={18} /> : <Calculator size={18} />}
                                Liquidar Puntos
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {matches.map(match => (
                                <div key={match.id} className="bg-slate-800/30 p-4 rounded-xl flex items-center justify-between border border-white/5">
                                    <div className="w-1/3 text-right font-medium text-white">{match.home_team}</div>

                                    <div className="flex gap-2 mx-4 relative">
                                        {updatingId === match.id && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-transparent z-10">
                                                <Loader2 className="animate-spin text-primary" size={20} />
                                            </div>
                                        )}
                                        {['1', 'X', '2'].map((opt) => {
                                            const val = opt as '1' | 'X' | '2';
                                            const isSelected = match.final_result === val;

                                            return (
                                                <button
                                                    key={opt}
                                                    disabled={updatingId === match.id}
                                                    onClick={() => handleSetResult(match.id, val)}
                                                    className={`w-10 h-10 rounded-lg font-bold transition-all border 
                                                ${isSelected
                                                            ? 'bg-amber-500 text-black border-amber-500 shadow-md transform scale-105'
                                                            : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                                                >
                                                    {opt}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="w-1/3 text-left font-medium text-white">{match.away_team}</div>
                                </div>
                            ))}

                            {matches.length === 0 && !loading && (
                                <div className="text-center py-10 text-slate-500 italic">
                                    No hay partidos asignados a esta jornada.
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
