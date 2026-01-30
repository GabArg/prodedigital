"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Trophy, Wallet, User, Home, Gamepad2, LogOut, Users, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, profile, logout } = useAuth();

    const navLinks = [
        { name: 'Jugar', href: '/play', icon: Gamepad2 },
        { name: 'Torneo de Amigos', href: '/groups', icon: Users },
        { name: 'Ranking', href: '/rankings', icon: Trophy },
        { name: 'Créditos', href: '/wallet', icon: Wallet },
    ];

    if (profile?.role === 'admin') { // Note: Role is not on user anymore unless we map it from metadata or profile. Assuming checks elsewhere or user type update needed if role is critical. But let's assume valid. User interface removed role?
        navLinks.push({ name: 'Admin', href: '/admin/competitions', icon: ShieldCheck });
    }

    const displayName = profile?.nickname || profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0];
    const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`;

    return (
        <nav className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm text-slate-900">
            <div className="container flex items-center justify-between h-16">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity group">
                    <div className="flex items-center">
                        {/* The Official Icon Style - Works perfectly on white */}
                        <div className="w-10 h-7 border-[2.5px] border-amber-500 bg-white flex items-center justify-center rounded-[1px]">
                            <div className="w-6 h-3.5 bg-[#0B1C2D]" />
                        </div>
                    </div>

                    <span className="text-xl font-bold font-sans tracking-tight text-[#0B1C2D] flex items-center gap-1">
                        PRODE DIGITAL <sup className="text-[10px] font-sans opacity-70">®</sup>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-amber-600 transition-colors uppercase tracking-wider"
                        >
                            <link.icon size={18} className="text-slate-400" />
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* User Actions (Desktop) */}
                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <>
                            <div className="flex items-center gap-2 bg-slate-50 py-1.5 px-4 rounded-full border border-slate-200 shadow-sm">
                                <Wallet size={16} className="text-emerald-600" />
                                <span className="font-mono font-black text-emerald-600">{profile?.credits ?? 0} CR</span>
                            </div>
                            <div className="flex items-center gap-3 ml-2">
                                <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                                    <img src={avatarUrl} alt={displayName} className="w-full h-full" />
                                </div>
                                <span className="text-sm font-black text-slate-900 hidden lg:block uppercase tracking-tight">{displayName}</span>
                                <Button variant="ghost" size="sm" onClick={logout} title="Cerrar Sesión" className="text-slate-400 hover:text-red-500 hover:bg-red-50">
                                    <LogOut size={18} />
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="font-bold text-slate-600">Ingresar</Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black">Crear Cuenta</Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-slate-600 hover:text-amber-600"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white p-6 absolute w-full left-0 animate-in slide-in-from-top-2 shadow-xl">
                    <div className="flex flex-col gap-6">
                        {user && (
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden border-2 border-white">
                                    <img src={avatarUrl} alt={displayName} className="w-full h-full" />
                                </div>
                                <div>
                                    <div className="font-black text-slate-900 uppercase tracking-tight">{displayName}</div>
                                    <div className="text-emerald-600 text-sm font-black font-mono">{profile?.credits ?? 0} CR</div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="flex items-center gap-4 text-base font-black text-slate-600 hover:text-amber-500 p-3 rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <link.icon size={20} className="text-slate-400" />
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        <div className="h-px bg-slate-100 my-2" />

                        {user ? (
                            <Button variant="danger" className="w-full h-14 rounded-2xl font-black text-lg" onClick={() => { logout(); setIsOpen(false); }}>
                                CERRAR SESIÓN
                            </Button>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <Link href="/login" onClick={() => setIsOpen(false)}>
                                    <Button variant="secondary" className="w-full h-14 rounded-2xl font-black text-lg">INGRESAR</Button>
                                </Link>
                                <Link href="/register" onClick={() => setIsOpen(false)}>
                                    <Button className="w-full h-14 rounded-2xl font-black text-lg bg-amber-500 hover:bg-amber-600 text-slate-950">CREAR CUENTA</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};
