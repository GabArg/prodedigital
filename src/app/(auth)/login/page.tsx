"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Trophy } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { loginWithPassword, isLoading } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!email || !password) return;

        const res = await loginWithPassword(email, password);
        if (res.error) {
            setError(res.error.message || "Credenciales incorrectas");
        } else {
            router.push('/dashboard');
        }
    };

    return (
        <div className="flex-center min-h-[calc(100vh-200px)] py-10">
            <Card className="w-full max-w-md p-8 border-t-4 border-t-primary">
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 rounded-full bg-slate-800 mb-4 text-primary">
                        <Trophy size={40} />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Bienvenido</h1>
                    <p className="text-slate-400">Ingresa para gestionar tus boletas</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                            placeholder="tu@email.com"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="block text-sm font-medium text-slate-300">Contraseña</label>
                            <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <Button
                        type="submit"
                        className="w-full"
                        isLoading={isLoading}
                    >
                        INGRESAR
                    </Button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-500">
                    ¿No tienes cuenta?{' '}
                    <Link href="/register" className="text-primary hover:underline">
                        Regístrate gratis
                    </Link>
                </div>
            </Card>
        </div>
    );
}
