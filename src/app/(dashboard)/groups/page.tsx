"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Plus, Trophy, ChevronRight, Hash, Check, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { CompetitionDB } from "@/services/dataService";

export default function GroupsPage() {
    const { user } = useAuth();
    const router = useRouter();

    // Data State
    const [myGroups, setMyGroups] = useState<any[]>([]);
    const [competitions, setCompetitions] = useState<CompetitionDB[]>([]);

    // UI State
    const [inviteCode, setInviteCode] = useState("");
    const [newGroupName, setNewGroupName] = useState("");
    const [selectedCompIds, setSelectedCompIds] = useState<string[]>([]);
    const [isPublic, setIsPublic] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [initialLoading, setInitialLoading] = useState(true);

    // Load Groups and Competitions
    const fetchData = async () => {
        if (!user) return;
        try {
            const { DataService } = await import('@/services/dataService');
            const [groups, comps] = await Promise.all([
                DataService.getMyGroups(user.id),
                DataService.getCompetitions()
            ]);
            setMyGroups(groups);
            setCompetitions(comps);

            // Select all competitions by default for UX convenience
            if (comps.length > 0) {
                setSelectedCompIds(comps.map(c => c.id));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const toggleCompetition = (id: string) => {
        setSelectedCompIds(prev =>
            prev.includes(id)
                ? prev.filter(c => c !== id)
                : [...prev, id]
        );
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newGroupName.trim()) return;
        if (selectedCompIds.length === 0) {
            setError("Selecciona al menos una competición");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const { DataService } = await import('@/services/dataService');
            await DataService.createGroup(newGroupName, user.id, selectedCompIds, isPublic);

            // Refresh
            const groups = await DataService.getMyGroups(user.id);
            setMyGroups(groups);

            // Reset Form
            setNewGroupName("");
            setIsPublic(false);

            router.refresh();
        } catch (err) {
            console.error(err);
            setError("Error al crear el grupo");
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !inviteCode.trim()) return;

        setLoading(true);
        setError("");
        try {
            const { DataService } = await import('@/services/dataService');
            await DataService.joinGroup(inviteCode.toUpperCase(), user.id);

            const groups = await DataService.getMyGroups(user.id);
            setMyGroups(groups);

            setInviteCode("");
            alert("¡Te has unido exitosamente!");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Error al unirse");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="p-8 text-center text-slate-400">Inicia sesión para ver tus torneos de amigos.</div>;

    return (
        <div className="container py-8 max-w-5xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-primary">
                        <Users className="text-primary" size={32} />
                        Torneos de Amigos
                    </h1>
                    <p className="text-muted">Crea torneos privados o públicos y compite en tus ligas favoritas.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Left Column: Actions */}
                <div className="space-y-6">
                    {/* Create Card */}
                    <Card className="p-6 bg-white border-slate-200 shadow-sm">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-primary">
                            <Plus size={20} className="text-action" /> Crear Nuevo
                        </h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Nombre del Torneo"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-primary placeholder:text-slate-400 focus:border-action outline-none transition-colors"
                                />
                            </div>

                            {/* Public Toggle */}
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setIsPublic(!isPublic)}
                                    className={`w-10 h-6 rounded-full p-1 transition-colors ${isPublic ? 'bg-action' : 'bg-slate-300'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isPublic ? 'translate-x-4' : 'translate-x-0'} shadow-sm`} />
                                </button>
                                <span className="text-sm text-slate-600 flex items-center gap-2 font-medium">
                                    {isPublic ? <Globe size={14} /> : <Lock size={14} />}
                                    {isPublic ? 'Torneo Público' : 'Torneo Privado'}
                                </span>
                            </div>

                            {/* Competitions Selector */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Competiciones</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {competitions.map(comp => {
                                        const isSelected = selectedCompIds.includes(comp.id);
                                        return (
                                            <button
                                                key={comp.id}
                                                type="button"
                                                onClick={() => toggleCompetition(comp.id)}
                                                className={`
                                            text-left text-xs p-2 rounded border transition-all flex items-center justify-between font-medium
                                            ${isSelected
                                                        ? 'bg-primary/5 border-primary text-primary'
                                                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                                    }
                                        `}
                                            >
                                                <span>{comp.name}</span>
                                                {isSelected && <Check size={12} className="text-primary" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-xs">{error}</p>}

                            <Button
                                className="w-full shadow-lg shadow-green-500/10"
                                disabled={!newGroupName.trim() || loading || selectedCompIds.length === 0}
                                isLoading={loading}
                            >
                                Crear Torneo
                            </Button>
                        </form>
                    </Card>

                    {/* Join Card */}
                    <Card className="p-6 border-slate-200 bg-white shadow-sm">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-primary">
                            <Hash size={20} className="text-secondary" /> Unirse con Código
                        </h3>
                        <form onSubmit={handleJoin} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Código (ej. AB1234)"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                    maxLength={6}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-primary text-center font-mono tracking-widest uppercase focus:border-secondary outline-none placeholder:text-slate-400"
                                />
                            </div>
                            {error && <p className="text-danger text-sm">{error}</p>}
                            <Button
                                variant="secondary"
                                className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200"
                                disabled={!inviteCode.trim() || loading}
                                isLoading={loading}
                            >
                                Unirse
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* Right Column: My Groups */}
                <div className="md:col-span-2">
                    <h2 className="text-xl font-bold mb-4 text-primary">Mis Torneos</h2>
                    {initialLoading ? (
                        <div className="text-slate-500">Cargando grupos...</div>
                    ) : myGroups.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users size={32} className="text-slate-400" />
                            </div>
                            <p className="text-primary font-medium">No perteneces a ningún torneo todavía.</p>
                            <p className="text-slate-500 text-sm">¡Crea uno o únete para empezar!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myGroups.map(group => (
                                <Link key={group.id} href={`/groups/${group.id}`}>
                                    <Card className="group p-5 bg-white border-slate-200 hover:border-primary/50 hover:shadow-md transition-all flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 group-hover:bg-blue-100 transition-colors">
                                                <Trophy size={20} className="text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-primary">{group.name}</h3>
                                                <p className="text-sm text-slate-500 flex items-center gap-2">
                                                    <span className="font-mono bg-slate-100 px-1.5 rounded text-xs border border-slate-200">#{group.inviteCode}</span>
                                                    {group.ownerUserId === user.id && <span className="text-xs text-amber-600 bg-amber-50 px-1.5 rounded border border-amber-200 font-bold">ADMIN</span>}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-blue-50 transition-colors">
                                            <ChevronRight size={18} />
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
