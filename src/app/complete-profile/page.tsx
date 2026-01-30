"use client";

import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { zodResolver } from '@hookform/resolvers/zod';
import { differenceInYears } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BrandLogo } from '@/components/ui/BrandLogo';

const schema = z.object({
    nickname: z.string().min(3, "El apodo debe tener al menos 3 caracteres"),
    birthDate: z.string().refine((val) => {
        const date = new Date(val);
        const age = differenceInYears(new Date(), date);
        return age >= 18;
    }, "Debes ser mayor de 18 años"),
    nationality: z.string().min(1, "Selecciona tu nacionalidad"),
    favoriteTeam: z.string().min(1, "Selecciona tu equipo"),
});

type FormData = z.infer<typeof schema>;

const COUNTRIES = ["Argentina", "Brasil", "Uruguay", "Chile", "Paraguay", "Bolivia", "Perú", "Ecuador", "Colombia", "Venezuela", "México", "Otro"];
const TEAMS = ["Boca Juniors", "River Plate", "Independiente", "Racing Club", "San Lorenzo", "Vélez Sarsfield", "Estudiantes LP", "Gimnasia LP", "Huracán", "Rosario Central", "Newells", "Talleres", "Belgrano", "Argentinos Jrs", "Lanús", "Banfield", "Otro"];

export default function CompleteProfilePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        if (!user) return;
        setIsLoading(true);
        setServerError(null);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    nickname: data.nickname,
                    birth_date: data.birthDate,
                    nationality: data.nationality,
                    favorite_team: data.favoriteTeam,
                    profile_completed: true,
                    // Also map nickname to alias if that's the intended legacy field, or just leave alias as is
                    alias: data.nickname,
                })
                .eq('id', user.id);

            if (error) throw error;

            // Force hard reload or redirect to allow context to refresh
            window.location.href = '/play';
        } catch (err: any) {
            console.error(err);
            setServerError(err.message || "Error al actualizar el perfil");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4">
            <div className="w-full max-w-md bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-2xl">
                <div className="flex flex-col items-center mb-6">
                    <BrandLogo className="w-32 h-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Completá tu perfil</h1>
                    <p className="text-slate-400 text-center text-sm">
                        Este paso es necesario para participar en el ranking y empezar a jugar
                    </p>
                    <div className="mt-4 px-3 py-1 bg-amber-500/10 text-amber-500 text-xs font-semibold rounded-full border border-amber-500/20">
                        Paso 2 de 2
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Apodo (para rankings)</label>
                        <Input
                            {...register("nickname")}
                            placeholder="Ej. ElDiegote"
                            className={errors.nickname ? "border-red-500 focus:ring-red-500" : ""}
                        />
                        {errors.nickname && <p className="text-red-500 text-xs mt-1">{errors.nickname.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Fecha de Nacimiento</label>
                        <Input
                            type="date"
                            {...register("birthDate")}
                            className={errors.birthDate ? "border-red-500 focus:ring-red-500" : ""}
                        />
                        {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Nacionalidad</label>
                        <select
                            {...register("nationality")}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">Seleccionar...</option>
                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {errors.nationality && <p className="text-red-500 text-xs mt-1">{errors.nationality.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Hincha de</label>
                        <select
                            {...register("favoriteTeam")}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">Seleccionar...</option>
                            {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        {errors.favoriteTeam && <p className="text-red-500 text-xs mt-1">{errors.favoriteTeam.message}</p>}
                    </div>

                    {serverError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                            {serverError}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500"
                    >
                        {isLoading ? "Guardando..." : "Guardar y empezar a jugar"}
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => { supabase.auth.signOut().then(() => window.location.href = '/login') }}
                        className="w-full text-slate-400 hover:text-white"
                    >
                        Cerrar Sesión
                    </Button>
                </form>
            </div>
        </div>
    );
}
