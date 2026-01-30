"use client";
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Wallet, Trophy, Calendar, ChevronRight, TrendingUp, ArrowUpRight } from 'lucide-react';

export default function Dashboard() {
    const { user, profile, transactions } = useAuth();
    const [activeTournaments, setActiveTournaments] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const loadData = async () => {
            try {
                const { DataService } = await import('@/services/dataService');
                const slips = await DataService.getSlips();
                setActiveTournaments(slips);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        if (user) loadData();
    }, [user]);

    if (!user) {
        return (
            <div className="container py-20 text-center">
                <h2 className="text-2xl font-bold mb-4 text-white">Acceso Restringido</h2>
                <p className="text-slate-400 mb-8">Debes iniciar sesión para ver tu panel.</p>
                <Link href="/login">
                    <Button variant="primary">Ir al Login</Button>
                </Link>
            </div>
        );
    }

    const displayName = profile?.nickname || profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0];

    return (
        <div className="container py-10 space-y-10">
            {/* Header / Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight text-white flex items-center gap-4">
                        HOLA, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 uppercase">{displayName}</span>
                    </h1>
                    <p className="text-slate-400 text-lg mt-2">Aquí tienes el resumen de tu actividad y torneos.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/wallet">
                        <Button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white gap-2 backdrop-blur-sm px-6">
                            <Wallet size={18} /> Mi Billetera
                        </Button>
                    </Link>
                    <Link href="/play">
                        <Button variant="primary" className="shadow-lg shadow-green-500/20 px-8">
                            JUGAR AHORA
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Premium KPI Cards (Glassmorphism) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Balance Card */}
                <div className="relative group overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 p-6 backdrop-blur-md transition-all hover:bg-white/[0.05] hover:border-white/20">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wallet size={80} className="text-white" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Saldo Disponible</span>
                        <div className="text-3xl font-mono font-black text-white mt-1">{profile?.credits ?? 0} <span className="text-sm text-primary font-sans uppercase">CR</span></div>
                        <div className="mt-4 flex items-center gap-1.5 text-xs text-green-400 font-medium bg-green-400/10 w-fit px-2 py-1 rounded-full border border-green-400/20">
                            <ArrowUpRight size={12} /> Listo para jugar
                        </div>
                    </div>
                </div>

                {/* Ranking Card */}
                <div className="relative group overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 p-6 backdrop-blur-md transition-all hover:bg-white/[0.05] hover:border-white/20">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Trophy size={80} className="text-amber-500" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ranking Global</span>
                        <div className="text-3xl font-mono font-black text-amber-500 mt-1">--</div>
                        <div className="mt-4 text-xs text-slate-500 italic">Sube de nivel para entrar al top</div>
                    </div>
                </div>

                {/* Points Card */}
                <div className="relative group overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 p-6 backdrop-blur-md transition-all hover:bg-white/[0.05] hover:border-white/20">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={80} className="text-blue-500" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Puntos Totales</span>
                        <div className="text-3xl font-mono font-black text-blue-500 mt-1">0 <span className="text-sm font-sans uppercase">PTS</span></div>
                        <div className="mt-4 text-xs text-slate-500 uppercase tracking-tighter">Temporada 2026</div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Main Content: Active Tournaments */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center gap-3 text-white uppercase tracking-wider">
                            <span className="w-1 h-8 bg-amber-500 rounded-full" />
                            Torneos Activos
                        </h2>
                        <Link href="/play" className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Ver todos</Link>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-slate-500 animate-pulse">Cargando torneos disponibles...</div>
                        ) : activeTournaments.length === 0 ? (
                            <div className="p-8 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-2xl text-slate-500">
                                No hay torneos activos en este momento.
                            </div>
                        ) : (
                            activeTournaments.map((t) => (
                                <Link key={t.id} href={`/play/${t.id}`}>
                                    <div className="group relative bg-white/[0.02] border border-white/5 p-5 rounded-2xl transition-all hover:bg-white/[0.05] hover:border-white/20 flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-xl bg-[#0F243A] flex items-center justify-center text-primary border border-white/5 group-hover:bg-primary group-hover:text-white transition-all">
                                                <Calendar size={22} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-xl text-white group-hover:text-amber-500 transition-colors uppercase tracking-tight">{t.tournament_name}</h3>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <span className="text-primary font-medium">{t.round_name}</span>
                                                    <span className="text-slate-600">|</span>
                                                    <span className="text-slate-400">Cierra: {new Date(t.close_date).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 px-3 py-1 font-bold">DISPONIBLE</Badge>
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
                                                <ChevronRight size={20} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar: Recent Activity */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Actividad</h2>
                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                        <div className="space-y-5">
                            {transactions.length === 0 ? (
                                <div className="text-slate-500 text-sm py-4 italic border-b border-white/5">Sin movimientos recientes.</div>
                            ) : transactions.slice(0, 5).map((activity) => (
                                <div key={activity.id} className="flex justify-between items-center pb-4 border-b border-white/5 last:border-0 last:pb-0 group">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-slate-300 group-hover:text-white transition-colors">{activity.description}</span>
                                        <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
                                            {new Date(activity.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <span className={`font-mono font-black ${activity.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {activity.amount > 0 ? '+' : ''}{activity.amount}
                                    </span>
                                </div>
                            ))}
                            <Link href="/wallet" className="block text-center text-xs font-bold text-slate-500 hover:text-white mt-6 pt-3 border-t border-white/5 uppercase tracking-widest transition-colors">
                                Ver historial completo
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
