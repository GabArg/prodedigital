'use client';

import { useState, useEffect, use } from 'react';
import {
    getSlipsAction,
    createSlipAction,
    getAvailableMatchesAction,
    assignMatchesAction
} from '../../actions';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Plus, Calendar, Save, Trash2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function SlipsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: competitionId } = use(params);
    const [slips, setSlips] = useState<any[]>([]);
    const [availableMatches, setAvailableMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    // Create Slip Form
    const [newSlip, setNewSlip] = useState({
        tournament_name: 'Prode Oficial',
        round_name: '',
        close_date: '',
        entry_cost: 0
    });

    // Selection State
    const [selectedSlipId, setSelectedSlipId] = useState<string | null>(null);
    const [selectedMatchIds, setSelectedMatchIds] = useState<string[]>([]);

    useEffect(() => {
        loadData();
    }, [competitionId]);

    async function loadData() {
        setLoading(true);
        const [sData, mData] = await Promise.all([
            getSlipsAction(competitionId),
            getAvailableMatchesAction(competitionId)
        ]);
        setSlips(sData || []);
        setAvailableMatches(mData || []);
        setLoading(false);
    }

    async function handleCreateSlip() {
        if (!newSlip.round_name || !newSlip.close_date) return alert('Round name and Close date required');
        const res = await createSlipAction(competitionId, newSlip);
        if (res.success) {
            setShowCreate(false);
            setNewSlip({ tournament_name: 'Prode Oficial', round_name: '', close_date: '', entry_cost: 0 });
            loadData();
        } else {
            alert('Error: ' + res.error);
        }
    }

    function selectSlip(slip: any) {
        setSelectedSlipId(slip.id);
        setSelectedMatchIds(slip.matches.map((m: any) => m.id));
    }

    async function handleSaveMatches() {
        if (!selectedSlipId) return;
        const res = await assignMatchesAction(selectedSlipId, competitionId, selectedMatchIds);
        if (res.success) {
            alert('Matches assigned successfully!');
            loadData();
        } else {
            alert('Error: ' + res.error);
        }
    }

    const toggleMatch = (matchId: string) => {
        setSelectedMatchIds(prev =>
            prev.includes(matchId)
                ? prev.filter(id => id !== matchId)
                : [...prev, matchId]
        );
    };

    if (loading) return <div className="p-8 text-center text-white">Cargando jornadas...</div>;

    const selectedSlip = slips.find(s => s.id === selectedSlipId);

    return (
        <div className="container py-8 max-w-6xl">
            <Link href={`/admin/competitions/${competitionId}`} className="flex items-center gap-2 text-slate-500 mb-6 hover:text-primary transition-colors">
                <ArrowLeft size={16} /> Volver a la Competición
            </Link>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                        <Calendar className="text-primary" /> Gestión de Jornadas (Slips)
                    </h1>
                    <p className="text-slate-400">Crea jornadas y asigna partidos para esta competición.</p>
                </div>
                <Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
                    <Plus size={18} /> Nueva Jornada
                </Button>
            </div>

            {showCreate && (
                <Card className="p-6 mb-8 border-primary/20 bg-slate-900 shadow-xl">
                    <h3 className="font-bold mb-4 text-white">Configurar Nueva Jornada</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Nombre del Torneo</label>
                            <Input
                                value={newSlip.tournament_name}
                                onChange={e => setNewSlip({ ...newSlip, tournament_name: e.target.value })}
                                className="bg-slate-800 border-slate-700 text-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Nombre de la Ronda (ej: Fecha 1)</label>
                            <Input
                                placeholder="Fecha 1"
                                value={newSlip.round_name}
                                onChange={e => setNewSlip({ ...newSlip, round_name: e.target.value })}
                                className="bg-slate-800 border-slate-700 text-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Fecha de Cierre (Límite apuestas)</label>
                            <Input
                                type="datetime-local"
                                value={newSlip.close_date}
                                onChange={e => setNewSlip({ ...newSlip, close_date: e.target.value })}
                                className="bg-slate-800 border-slate-700 text-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Costo de Entrada (Créditos)</label>
                            <Input
                                type="number"
                                value={newSlip.entry_cost}
                                onChange={e => setNewSlip({ ...newSlip, entry_cost: +e.target.value })}
                                className="bg-slate-800 border-slate-700 text-white"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2 justify-end">
                        <Button variant="ghost" onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-white">Cancelar</Button>
                        <Button onClick={handleCreateSlip}>Crear Jornada</Button>
                    </div>
                </Card>
            )}

            <div className="grid md:grid-cols-4 gap-8">
                {/* Slips List */}
                <div className="col-span-1 space-y-3">
                    <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-2">Jornadas</h3>
                    {slips.map(slip => (
                        <button
                            key={slip.id}
                            onClick={() => selectSlip(slip)}
                            className={`w-full text-left p-4 rounded-xl transition-all border ${selectedSlipId === slip.id ? 'bg-primary text-black border-primary' : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                        >
                            <div className="font-bold">{slip.round_name}</div>
                            <div className="text-xs opacity-70 mt-1">{new Date(slip.close_date).toLocaleDateString()}</div>
                            <div className="mt-2 text-xs flex items-center gap-1 font-medium">
                                <CheckCircle2 size={12} /> {slip.matches.length} partidos
                            </div>
                        </button>
                    ))}
                    {slips.length === 0 && <p className="text-slate-500 text-sm">No hay jornadas creadas.</p>}
                </div>

                {/* Match Picker */}
                <div className="col-span-3">
                    {selectedSlipId ? (
                        <Card className="p-6 bg-slate-900 border-slate-800">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-white">{selectedSlip?.round_name}</h2>
                                    <p className="text-sm text-slate-400">Selecciona los partidos que integran esta jornada.</p>
                                </div>
                                <Button onClick={handleSaveMatches} className="gap-2">
                                    <Save size={18} /> Guardar Selección
                                    <span className="bg-black/20 px-2 py-0.5 rounded text-xs ml-1">{selectedMatchIds.length}</span>
                                </Button>
                            </div>

                            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {availableMatches.map(match => {
                                    const isSelected = selectedMatchIds.includes(match.id);
                                    return (
                                        <div
                                            key={match.id}
                                            onClick={() => toggleMatch(match.id)}
                                            className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${isSelected ? 'border-primary bg-primary/10' : 'border-slate-800 bg-slate-800/30 hover:bg-slate-800/50'}`}
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-slate-600'}`}>
                                                    {isSelected && <CheckCircle2 size={14} className="text-black" />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between text-white font-medium">
                                                        <span>{match.home_team} vs {match.away_team}</span>
                                                        <span className="text-xs text-slate-500">{new Date(match.match_date).toLocaleString()}</span>
                                                    </div>
                                                    <div className="text-xs text-slate-500">{match.round_name} • {match.stage}</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-800 text-slate-500">
                            <Calendar size={48} className="mb-4 opacity-20" />
                            <p>Selecciona una jornada para gestionar sus partidos</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
