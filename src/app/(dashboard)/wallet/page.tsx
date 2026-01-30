"use client";
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Wallet, History, ArrowUpRight, ArrowDownRight, PlusCircle, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function WalletPage() {
    const { user, profile, loadCredits, transactions } = useAuth();
    const [loading, setLoading] = useState(false);

    if (!user) {
        return (
            <div className="container py-20 text-center">
                <h2 className="text-3xl font-black mb-4 text-white uppercase tracking-tighter">Acceso Restringido</h2>
                <p className="text-slate-400 mb-8 font-medium">Debes iniciar sesión para gestionar tus finanzas.</p>
                <Link href="/login">
                    <Button variant="primary" className="px-8 h-12 rounded-xl">Ir al Login</Button>
                </Link>
            </div>
        );
    }

    const handleLoad = (amount: number) => {
        setLoading(true);
        // Simulate API delay
        setTimeout(() => {
            loadCredits(amount);
            setLoading(false);
        }, 800);
    };

    return (
        <div className="container py-12 max-w-5xl space-y-12 bg-[#0B1C2D]">
            <div className="border-b border-white/5 pb-8">
                <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight text-white flex items-center gap-4">
                    <span className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                        <Wallet className="text-blue-500" size={32} />
                    </span>
                    MI BILLETERA
                </h1>
                <p className="text-slate-400 text-lg mt-3 font-medium text-slate-400">Gestiona tus créditos para participar en torneos premium.</p>
            </div>

            <div className="grid md:grid-cols-5 gap-10">
                {/* Balance Card */}
                <div className="md:col-span-2 space-y-8">
                    <Card className="relative overflow-hidden bg-gradient-to-br from-[#0F243A] to-[#1A2633] border-white/10 p-10 rounded-[32px] shadow-2xl">
                        <div className="relative z-10">
                            <div className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mb-4">Saldo Disponible</div>
                            <div className="text-6xl font-mono font-black text-white mb-2 flex items-baseline gap-2">
                                {profile?.credits ?? 0} <span className="text-sm font-sans text-primary-glow font-black uppercase tracking-widest">CR</span>
                            </div>
                            <div className="mt-8 pt-8 border-t border-white/5">
                                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 px-4 py-1.5 font-bold rounded-full">ESTADO ACTIVO</Badge>
                            </div>
                        </div>
                        {/* Decorative Background Icon */}
                        <div className="absolute -bottom-10 -right-10 opacity-5">
                            <CreditCard size={200} className="text-white" />
                        </div>
                    </Card>

                    <div className="space-y-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                            <PlusCircle size={18} className="text-amber-500" /> Cargar Créditos <span className="text-[10px] text-slate-500">(Beta)</span>
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            <Button
                                onClick={() => handleLoad(100)}
                                className="h-16 bg-white/[0.03] border-white/10 hover:bg-white/10 text-white font-black text-lg rounded-2xl transition-all"
                                disabled={loading}
                            >
                                +100
                            </Button>
                            <Button
                                onClick={() => handleLoad(500)}
                                className="h-16 bg-white/[0.03] border-white/10 hover:bg-white/10 text-white font-black text-lg rounded-2xl transition-all"
                                disabled={loading}
                            >
                                +500
                            </Button>
                            <Button
                                onClick={() => handleLoad(1000)}
                                className="h-16 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-lg rounded-2xl shadow-lg shadow-amber-500/10 transition-all"
                                disabled={loading}
                            >
                                +1K
                            </Button>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center mt-2">
                            Simulación de recarga activada para pruebas
                        </p>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="md:col-span-3 space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-3 text-white uppercase tracking-wider">
                        <span className="w-1 h-8 bg-blue-500 rounded-full" />
                        Historial de Movimientos
                    </h3>

                    <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 min-h-[400px]">
                        <div className="space-y-4">
                            {transactions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                                    <History size={48} className="opacity-10 mb-4" />
                                    <span className="font-bold uppercase tracking-widest text-sm italic">Sin movimientos registrados</span>
                                </div>
                            ) : (
                                transactions.map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all group">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${tx.type === 'load' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                                {tx.type === 'load' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                                            </div>
                                            <div>
                                                <div className="font-black text-white group-hover:text-primary-glow transition-colors uppercase tracking-tight">{tx.description}</div>
                                                <div className="text-xs text-slate-500 font-bold mt-1">
                                                    {new Date(tx.date).toLocaleDateString()} — {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`font-mono text-xl font-black ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Internal Badge for consistency since local usage needs it
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold leading-none ${className}`}>
            {children}
        </span>
    );
}
