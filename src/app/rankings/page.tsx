"use client";
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Trophy, Crown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getRankingCompetitionsAction, getCompetitionLeaderboardAction } from './actions';

export default function RankingsPage() {
    const { user } = useAuth();
    const [competitions, setCompetitions] = useState<any[]>([]);
    const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
    const [ranking, setRanking] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial Load: Competitions
    useEffect(() => {
        const load = async () => {
            try {
                const data = await getRankingCompetitionsAction();
                setCompetitions(data);
                if (data.length > 0) setSelectedCompId(data[0].id);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Load Ranking when Competition Changes
    useEffect(() => {
        const loadRanking = async () => {
            if (!selectedCompId) return;
            try {
                const data = await getCompetitionLeaderboardAction(selectedCompId);
                setRanking(data);
            } catch (e) {
                console.error(e);
            }
        };
        loadRanking();
    }, [selectedCompId]);

    const selectedComp = competitions.find(c => c.id === selectedCompId);

    // Map RPC alias fields to UI expected names if needed
    // RPC returns: user_id, alias, avatar_url, points, matches_predicted
    // UI used: userName, points, avatarUrl, userId

    const getMedalColor = (index: number) => {
        switch (index) {
            case 0: return 'text-yellow-400'; // Gold
            case 1: return 'text-slate-300';  // Silver
            case 2: return 'text-amber-700';  // Bronze
            default: return 'text-slate-600';
        }
    };

    return (
        <div className="container py-8 max-w-5xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 font-display tracking-wide flex items-center justify-center gap-3">
                    <Trophy className="text-primary" size={40} />
                    RANKINGS
                </h1>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    Consulta los mejores pronosticadores por torneo. ¡Suma puntos en cada partido para alcanzar la cima!
                </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
                {/* Competition Selector */}
                <div className="col-span-1">
                    <div className="sticky top-24">
                        <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-3">Torneos Activos</h3>
                        <div className="flex flex-col gap-2">
                            {loading ? (
                                <div className="text-slate-500 text-sm">Cargando...</div>
                            ) : competitions.length === 0 ? (
                                <div className="text-slate-500 text-sm">No hay torneos activos.</div>
                            ) : (
                                competitions.map(comp => (
                                    <button
                                        key={comp.id}
                                        onClick={() => setSelectedCompId(comp.id)}
                                        className={`text-left p-4 rounded-xl transition-all border ${selectedCompId === comp.id ? 'bg-slate-800 border-primary shadow-glow' : 'bg-slate-900 border-transparent hover:bg-slate-800'}`}
                                    >
                                        <div className={`font-bold ${selectedCompId === comp.id ? 'text-white' : 'text-slate-400'}`}>{comp.name}</div>
                                        <div className="text-xs text-slate-500 mt-1 capitalize">{comp.type}</div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Ranking Table */}
                <div className="col-span-3">
                    <Card className="min-h-[500px]">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                            <h2 className="text-2xl font-bold">{selectedComp?.name || 'Selecciona un Torneo'}</h2>
                            <Badge className="bg-green-600 text-white hover:bg-green-600">Tabla Actualizada</Badge>
                        </div>

                        {!selectedComp ? (
                            <div className="text-center py-20 text-slate-500">
                                Selecciona un torneo para ver el ranking.
                            </div>
                        ) : ranking.length === 0 ? (
                            <div className="text-center py-20 text-slate-500">
                                Aún no hay pronósticos o resultados registrados.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {/* Header */}
                                <div className="grid grid-cols-[60px_1fr_100px] px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <div className="text-center">Pos</div>
                                    <div>Jugador</div>
                                    <div className="text-center">Puntos</div>
                                </div>

                                {/* Rows */}
                                {ranking.map((entry, index) => {
                                    const isMe = user && entry.user_id === user.id;
                                    return (
                                        <div
                                            key={entry.user_id}
                                            className={`grid grid-cols-[60px_1fr_100px] items-center px-4 py-3 rounded-lg border ${isMe ? 'bg-primary/10 border-primary' : 'bg-slate-800/30 border-white/5'}`}
                                        >
                                            <div className="flex justify-center">
                                                {index < 3 ? <Crown className={getMedalColor(index)} size={24} fill="currentColor" fillOpacity={0.2} /> : <span className="text-slate-500 font-bold font-mono">#{index + 1}</span>}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs overflow-hidden ${isMe ? 'bg-primary text-black' : 'bg-slate-700 text-slate-300'}`}>
                                                    {entry.avatar_url ? (
                                                        <img src={entry.avatar_url} alt={entry.alias} className="w-full h-full object-cover" />
                                                    ) : (
                                                        (entry.alias || '??').substring(0, 2).toUpperCase()
                                                    )}
                                                </div>
                                                <span className={`font-medium ${isMe ? 'text-primary' : 'text-white'}`}>
                                                    {entry.alias || 'Usuario'} {isMe && '(Tú)'}
                                                </span>
                                            </div>
                                            <div className="text-center font-mono font-bold text-lg">
                                                {entry.points}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
