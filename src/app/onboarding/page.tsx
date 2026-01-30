"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { OnboardingForm } from '@/components/auth/OnboardingForm';

export default function OnboardingPage() {
    const { user, profile, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user && profile?.nickname) {
            router.replace('/dashboard');
        }
    }, [user, profile, isLoading, router]);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center text-slate-500">Cargando...</div>;
    }

    if (!user) {
        // If not logged in, redirect to login
        if (typeof window !== 'undefined') router.replace('/login');
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-lg">
                <OnboardingForm userId={user.id} email={user.email} />
            </div>
        </div>
    );
}
