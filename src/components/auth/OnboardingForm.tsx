"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AlertCircle, CheckCircle, Shield, User, Loader2 } from 'lucide-react';
import { differenceInYears } from 'date-fns';
import { trackEventAction } from '@/app/actions/analytics';

// Validation Schema
const onboardingSchema = z.object({
    alias: z.string()
        .min(3, "El alias debe tener al menos 3 caracteres")
        .max(20, "El alias no puede tener más de 20 caracteres")
        .regex(/^[a-zA-Z0-9]+$/, "El alias solo puede contener letras y números"),
    whatsapp: z.string()
        .min(10, "Número de WhatsApp inválido")
        .regex(/^\+?[0-9\s-]+$/, "Formato inválido (ej. +54911...)"),
    birthDate: z.string()
        .refine((date) => {
            const age = differenceInYears(new Date(), new Date(date));
            return age >= 18;
        }, "Debes ser mayor de 18 años para registrarte."),
    nationality: z.string().optional(),
    favoriteTeam: z.string().optional(),
    whatsappConsent: z.boolean().refine(val => val === true, "Debes aceptar recibir notificaciones por WhatsApp."),
    termsAccepted: z.boolean().refine(val => val === true, "Debes aceptar los Términos y confirmar ser mayor de 18."),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export const OnboardingForm = ({ userId, email }: { userId: string, email: string }) => {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [dbError, setDbError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<OnboardingFormData>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            whatsappConsent: false
        }
    });

    const onSubmit = async (data: OnboardingFormData) => {
        setSubmitting(true);
        setDbError(null);

        try {
            // 1. Check Alias Uniqueness
            const { data: existingAlias } = await supabase
                .from('profiles')
                .select('id')
                .eq('alias', data.alias)
                .neq('id', userId) // Ignore self if updating (though this is create flow)
                .maybeSingle();

            if (existingAlias) {
                setDbError("Este alias ya está en uso. Por favor elige otro.");
                setSubmitting(false);
                return;
            }

            // 2. Upsert Profile (Creates if missing, updates if exists)
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    alias: data.alias,
                    whatsapp: data.whatsapp,
                    birth_date: data.birthDate,
                    nationality: data.nationality || null,
                    favorite_team: data.favoriteTeam || null,
                    email: email,
                    role: 'user'
                }, { onConflict: 'id' });

            if (error) throw error;

            if (error) throw error;

            // Analytics
            await trackEventAction('terms_accepted', { version: 'v1' }, userId);
            await trackEventAction('user_completed_onboarding', {
                has_whatsapp: !!data.whatsapp,
                has_favorite_team: !!data.favoriteTeam
            }, userId);

            // 3. Redirect
            // Force reload to update context
            window.location.href = '/dashboard';

        } catch (err: any) {
            console.error(err);
            setDbError(err.message || "Error al guardar el perfil.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card className="max-w-xl mx-auto p-8 border-primary/20 shadow-2xl">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    <User size={32} />
                </div>
                <h1 className="text-3xl font-bold font-display uppercase tracking-wide">Completa tu Perfil</h1>
                <p className="text-slate-400 mt-2">
                    Para asegurar una comunidad segura y confiable, necesitamos que completes tu identidad.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* PUBLIC INFO */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                    <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                        <Shield size={14} /> Información Pública
                    </h3>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-300">Alias (Usuario) *</label>
                        <input
                            {...register('alias')}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-amber-500 outline-none transition-colors placeholder:text-slate-500"
                            placeholder="Ej. ProdeKing24"
                        />
                        <div className="flex justify-between text-xs mt-1">
                            <span className="text-slate-500">Visible en Rankings y Torneos.</span>
                            <span className="text-slate-500">3-20 caracteres alfanuméricos.</span>
                        </div>
                        {errors.alias && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><AlertCircle size={14} /> {errors.alias.message}</p>}
                    </div>
                </div>

                {/* PRIVATE INFO */}
                <div className="space-y-4 pt-6 border-t border-white/5">
                    <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                        <Shield size={14} /> Información Privada
                    </h3>
                    <p className="text-xs text-slate-500 mb-4 bg-slate-800/50 p-3 rounded">
                        Estos datos son solo para validación y contacto. <strong>Nunca serán compartidos públicamente.</strong>
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-slate-300">Fecha de Nacimiento *</label>
                            <input
                                type="date"
                                {...register('birthDate')}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                            />
                            {errors.birthDate && <p className="text-red-400 text-sm mt-1">{errors.birthDate.message}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-slate-300">WhatsApp *</label>
                            <input
                                {...register('whatsapp')}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none placeholder:text-slate-500"
                                placeholder="+54 9 11 1234 5678"
                            />
                            {errors.whatsapp && <p className="text-red-400 text-sm mt-1">{errors.whatsapp.message}</p>}
                        </div>
                    </div>
                </div>

                {/* OPTIONAL INFO */}
                <div className="space-y-4 pt-6 border-t border-white/5">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-slate-400">Nacionalidad (Opcional)</label>
                            <input
                                {...register('nationality')}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:border-slate-500 outline-none placeholder:text-slate-500"
                                placeholder="Ej. Argentina"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-slate-400">Equipo Favorito (Opcional)</label>
                            <input
                                {...register('favoriteTeam')}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:border-slate-500 outline-none placeholder:text-slate-500"
                                placeholder="Ej. Boca Juniors"
                            />
                        </div>
                    </div>
                </div>

                {/* CONSENT */}
                <div className="pt-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            {...register('whatsappConsent')}
                            className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-900 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                            Acepto recibir notificaciones de confirmación de jugadas y alertas de torneos en mi WhatsApp. Entiendo que puedo darme de baja en cualquier momento.
                        </span>
                    </label>
                    {errors.whatsappConsent && <p className="text-red-400 text-sm mt-2 ml-7 block">{errors.whatsappConsent.message}</p>}
                </div>

                <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            {...register('termsAccepted')}
                            className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-900 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                            Acepto los <a href="/terminos" target="_blank" className="text-amber-500 hover:underline">Términos y Condiciones</a> y la <a href="/privacidad" target="_blank" className="text-amber-500 hover:underline">Política de Privacidad</a>. Declaro ser mayor de 18 años.
                        </span>
                    </label>
                    {errors.termsAccepted && <p className="text-red-400 text-sm mt-2 ml-7 block">{errors.termsAccepted.message}</p>}
                </div>

                {dbError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2">
                        <AlertCircle size={18} />
                        {dbError}
                    </div>
                )}

                <Button
                    className="w-full py-6 text-lg font-bold shadow-glow mt-4"
                    disabled={submitting}
                >
                    {submitting ? (
                        <>
                            <Loader2 className="animate-spin mr-2" /> Guardando...
                        </>
                    ) : (
                        "CONFIRMAR Y CONTINUAR"
                    )}
                </Button>
            </form>
        </Card>
    );
};
