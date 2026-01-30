'use client';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// HARDCODED ALLOWLIST FOR MVP
const SUPER_ADMINS = [
    'guidobroccoli@hotmail.com',
    'guidobroccoli@email.com', // Keeping just in case
    'admin@prodedigital.com',
    'master@demo.com' // Simulation User
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading, isSimulation } = useAuth();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        if (isLoading) return;

        if (isSimulation) {
            setIsAuthorized(true);
            return;
        }

        if (user?.email && SUPER_ADMINS.includes(user.email)) {
            setIsAuthorized(true);
        } else {
            setIsAuthorized(false);
        }
    }, [user, isLoading, isSimulation]);

    if (isLoading || isAuthorized === null) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                    <p className="text-slate-400 text-sm">Verificando permisos...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4 text-center">
                <h1 className="text-3xl font-bold text-red-500 mb-4">Acceso Denegado</h1>
                <p className="mb-4 text-slate-400">Tu usuario no tiene permisos de Super Admin.</p>

                <div className="bg-slate-900 p-6 rounded-xl mb-8 text-left font-mono text-sm border border-slate-800 shadow-xl max-w-md w-full">
                    <div className="flex justify-between border-b border-slate-800 pb-2 mb-2">
                        <span className="text-slate-500">Estado</span>
                        <span className="text-red-400 font-bold">No Autorizado</span>
                    </div>
                    <div className="space-y-2">
                        <p className="flex justify-between"><span className="text-slate-500">Email:</span> <span className="text-white">{user ? user.email : 'No logueado'}</span></p>
                        <p className="flex justify-between"><span className="text-slate-500">ID:</span> <span className="text-xs text-slate-400">{user ? user.id : '-'}</span></p>
                        <p className="flex justify-between"><span className="text-slate-500">Simulación:</span> <span className="text-amber-500">{isSimulation ? 'ON' : 'OFF'}</span></p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Link href="/dashboard" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold transition-colors">
                        Volver al Dashboard
                    </Link>
                    <Link href="/" className="px-6 py-3 border border-slate-800 hover:bg-slate-900 rounded-lg text-slate-400 transition-colors">
                        Ir al Inicio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <header className="border-b border-white/10 bg-slate-900 p-4">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-amber-500 uppercase tracking-widest">Super Admin</h1>
                        <span className="text-xs bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20">BETA</span>
                    </div>
                    <nav className="flex gap-4 text-sm font-medium">
                        <Link href="/admin/overview" className="hover:text-amber-400 transition-colors">Resumen</Link>
                        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">Volver al App</Link>
                    </nav>
                </div>
            </header>
            <main className="container mx-auto p-6">
                {children}
            </main>
        </div>
    );
}
