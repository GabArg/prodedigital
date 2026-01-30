"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { updatePassword, isLoading } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        const res = await updatePassword(password);
        if (res.error) {
            setError(res.error.message || "Error al actualizar contraseña");
        } else {
            setMessage("Contraseña actualizada correctamente.");
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        }
    };

    return (
        <div className="flex-center min-h-[calc(100vh-200px)] py-10">
            <Card className="w-full max-w-md p-8 border-t-4 border-t-primary">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2">Restablecer Contraseña</h1>
                    <p className="text-slate-400">Ingresa tu nueva contraseña</p>
                </div>

                {!message ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Nueva Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Confirmar Contraseña</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={isLoading}
                        >
                            ACTUALIZAR CONTRASEÑA
                        </Button>
                    </form>
                ) : (
                    <div className="text-center space-y-4">
                        <div className="p-4 bg-green-500/10 text-green-500 rounded-lg border border-green-500/20">
                            {message}
                        </div>
                        <p className="text-sm text-slate-400">Redirigiendo al dashboard...</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
