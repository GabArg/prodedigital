"use client";
import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

import { Calendar, Ticket, ChevronRight, Clock, Trophy } from 'lucide-react';

export default function PlayLobbyPage() {
    const [slips, setSlips] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const loadSlips = async () => {
            try {
                const { getUpcomingMatchesAction } = await import('./actions');
                const data = await getUpcomingMatchesAction();
                setSlips(data);
            } catch (e) {
                console.error('Error loading matches:', e);
            } finally {
                setLoading(false);
            }
        };
        loadSlips();
    }, []);

    return (
        <div className="container py-12 max-w-6xl">
            <div className="mb-12 border-b border-white/5 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight text-white flex items-center gap-4">
                        <span className="p-3 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/20">
                            <Ticket className="text-slate-900" size={32} />
                        </span>
                        ZONA DE JUEGO
                    </h1>
                    <p className="text-slate-400 text-lg mt-3">Selecciona una boleta disponible y demuestra tus conocimientos.</p>
                </div>
                <div className="flex items-center gap-4 bg-white/[0.03] border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-sm">
                    <Trophy className="text-amber-500" size={24} />
                    <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Premios en Juego</div>
                        <div className="text-white font-bold">+10.000 CR</div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
                {loading ? (
                    <div className="col-span-2 text-center py-20">
                        <div className="inline-block w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4" />
                        <div className="text-slate-500 font-medium">Cargando torneos disponibles...</div>
                    </div>
                ) : slips.length === 0 ? (
                    <div className="col-span-2 text-center text-slate-500 py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                        No hay boletas disponibles por el momento.
                    </div>
                ) : (
                    slips.map((slip) => (
                        <Card key={slip.id} className="group relative overflow-hidden bg-white/[0.03] border-white/5 hover:border-amber-500/30 transition-all hover:bg-white/[0.05] p-0 rounded-3xl">
                            {/* Card Content */}
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20 px-3 py-1 font-bold">EN JUEGO</Badge>
                                        <h3 className="text-3xl font-black mt-3 font-display text-white group-hover:text-amber-500 transition-colors tracking-tight uppercase">{slip.tournament_name}</h3>
                                        <div className="text-primary font-bold tracking-wide mt-1">{slip.round_name}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Entrada</div>
                                        <div className="font-mono text-2xl font-black text-white bg-slate-900/80 px-4 py-2 rounded-xl border border-white/5 shadow-inner">
                                            {slip.entry_cost} <span className="text-xs font-sans text-slate-500">CR</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Match Preview List */}
                                <div className="space-y-3 mb-8 bg-black/20 p-5 rounded-2xl border border-white/5">
                                    {slip.matches?.slice(0, 3).map((m: any, i: number) => {
                                        const now = Date.now();
                                        const startTime = new Date(m.start_time).getTime();
                                        const isLocked = now >= (startTime - 30 * 60 * 1000);
                                        const isLive = now >= startTime;

                                        return (
                                            <div key={i} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                                <div className="flex items-center gap-3">
                                                    <span className={`font-medium ${isLocked ? 'text-slate-400' : 'text-white'}`}>
                                                        {m.home_team} <span className="text-slate-600 mx-1">vs</span> {m.away_team}
                                                    </span>
                                                    {isLocked && (
                                                        <span className="text-amber-500/50 text-[10px] uppercase font-bold border border-amber-500/20 px-1 rounded">
                                                            {isLive ? 'LIVE' : 'Cerrado'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <span className="text-slate-500 font-mono text-xs">
                                                        {new Date(m.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="text-slate-600 text-[10px]">
                                                        {new Date(m.start_time).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {(slip.matches?.length || 0) > 3 && (
                                        <div className="text-[10px] pt-1 text-slate-500 font-bold uppercase tracking-widest text-center">
                                            + {slip.matches.length - 3} partidos más en esta boleta
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-amber-500/80 text-xs font-bold uppercase tracking-wider">
                                        <Clock size={16} />
                                        <span>Cierra: {new Date(slip.close_date).toLocaleDateString()}</span>
                                    </div>

                                    <Link href={`/play/${slip.id}`}>
                                        <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-black px-8 py-6 rounded-2xl shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-all">
                                            JUGAR <ChevronRight size={20} className="ml-1" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
