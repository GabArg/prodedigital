"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { resetPasswordForEmail, isLoading } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        if (!email) return;

        const res = await resetPasswordForEmail(email);
        if (res.error) {
            setError(res.error.message || "Error al solicitar recuperación");
        } else {
            setMessage("Si el email existe, recibirás un correo con las instrucciones.");
        }
    };

    return (
        <div className="flex-center min-h-[calc(100vh-200px)] py-10">
            <Card className="w-full max-w-md p-8 border-t-4 border-t-primary">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2">Recuperar Contraseña</h1>
                    <p className="text-slate-400">Ingresa tu email para restablecerla</p>
                </div>

                {!message ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                                placeholder="tu@email.com"
                                required
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={isLoading}
                        >
                            ENVIAR LINK
                        </Button>
                    </form>
                ) : (
                    <div className="text-center space-y-4">
                        <div className="p-4 bg-green-500/10 text-green-500 rounded-lg border border-green-500/20">
                            {message}
                        </div>
                        <p className="text-sm text-slate-400">Revisa tu bandeja de entrada o spam.</p>
                    </div>
                )}

                <div className="mt-8 text-center text-sm text-slate-500">
                    <Link href="/login" className="text-primary hover:underline">
                        Volver al Login
                    </Link>
                </div>
            </Card>
        </div>
    );
}
