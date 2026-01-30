"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { signup, isLoading } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!email || !password || !username) return;

        const res = await signup(email, password, username);
        if (res.error) {
            setError(res.error.message || "Error al registrarse");
        } else {
            alert("Cuenta creada. Por favor confirma tu email antes de ingresar.");
            router.push('/login');
        }
    };

    return (
        <div className="flex-center min-h-[calc(100vh-200px)] py-10">
            <Card className="w-full max-w-md p-8 border-t-4 border-t-secondary">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Crear Cuenta</h1>
                    <p className="text-slate-400">Únete a la comunidad de pronosticadores</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Nombre de Usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-secondary focus:outline-none transition-all"
                            placeholder="Usuario123"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-secondary focus:outline-none transition-all"
                            placeholder="tu@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-secondary focus:outline-none transition-all"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="pt-2">
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full bg-secondary hover:bg-blue-600 text-white"
                            isLoading={isLoading}
                        >
                            REGISTRARSE
                        </Button>
                    </div>
                </form>

                <div className="mt-8 text-center text-sm text-slate-500">
                    ¿Ya tienes cuenta?{' '}
                    <Link href="/login" className="text-secondary hover:underline">
                        Ingresa aquí
                    </Link>
                </div>
            </Card>
        </div>
    );
}
