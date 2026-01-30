'use client';

import { useState, useEffect } from 'react';
import { getTournamentsAction, syncTournamentAction, updateTournamentAction, syncTournamentResultsAction } from './actions';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RefreshCw, Save, Activity, Layers, CheckCircle2 } from 'lucide-react';

interface Tournament {
    id: string;
    name: string;
    api_league_id: number | null;
    current_season: number | null;
    is_active: boolean;
}

export default function AdminTournamentsPage() {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncingId, setSyncingId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Tournament>>({});

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const data = await getTournamentsAction();
            setTournaments(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function handleSync(id: string) {
        setSyncingId(id);
        try {
            const res = await syncTournamentAction(id);
            if (res.success) {
                alert(`Sync Successful! Imported ${res.count} matches.`);
            } else {
                alert('Sync Failed: ' + JSON.stringify(res.error));
            }
        } catch (e) {
            alert('Sync Error');
        } finally {
            setSyncingId(null);
        }
    }

    async function handleSyncResults(id: string) {
        setSyncingId(id);
        try {
            const res = await syncTournamentResultsAction(id);
            if (res.success) {
                alert(`Results Updated! Processed ${res.count} finished matches.`);
            } else {
                alert('Results Sync Failed: ' + JSON.stringify(res.error));
            }
        } catch (e) {
            alert('Results Sync Error');
        } finally {
            setSyncingId(null);
        }
    }

    function startEdit(t: any) {
        setEditingId(t.id);
        setEditForm({
            api_league_id: t.api_league_id,
            current_season: t.current_season,
            is_active: t.is_active
        });
    }

    async function saveEdit(id: string) {
        // Sanitize: convert nulls to undefined or appropriate values for action
        const updates = {
            api_league_id: editForm.api_league_id ?? undefined,
            current_season: editForm.current_season ?? undefined,
            is_active: editForm.is_active
        };
        await updateTournamentAction(id, updates);
        setEditingId(null);
        loadData();
    }

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="container py-8 max-w-6xl">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Layers size={32} className="text-primary" /> Gestión de Torneos (API)
            </h1>

            <div className="grid gap-4">
                {tournaments.map(t => (
                    <Card key={t.id} className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-white border-slate-200 shadow-sm">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-primary">{t.name}</h3>
                                {t.is_active ?
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold border border-green-200">ACTIVO</span> :
                                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold border border-slate-200">INACTIVO</span>
                                }
                            </div>

                            {editingId === t.id ? (
                                <div className="flex gap-4 items-center mt-2">
                                    <label className="text-xs text-slate-500">
                                        API ID:
                                        <input
                                            type="number"
                                            className="ml-1 w-20 border rounded p-1 text-sm text-black"
                                            value={editForm.api_league_id || ''}
                                            onChange={e => setEditForm({ ...editForm, api_league_id: +e.target.value })}
                                        />
                                    </label>
                                    <label className="text-xs text-slate-500">
                                        Season:
                                        <input
                                            type="number"
                                            className="ml-1 w-20 border rounded p-1 text-sm text-black"
                                            value={editForm.current_season || ''}
                                            onChange={e => setEditForm({ ...editForm, current_season: +e.target.value })}
                                        />
                                    </label>
                                    <label className="text-xs text-slate-500 flex items-center gap-1">
                                        <input
                                            type="checkbox"
                                            checked={editForm.is_active}
                                            onChange={e => setEditForm({ ...editForm, is_active: e.target.checked })}
                                        /> Active
                                    </label>
                                    <Button size="sm" onClick={() => saveEdit(t.id)} className="ml-2 gap-1 h-8">
                                        <Save size={14} /> Save
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8">Cancel</Button>
                                </div>
                            ) : (
                                <div className="flex gap-6 mt-1 text-sm text-slate-500">
                                    <p>API ID: <span className="font-mono text-slate-700">{t.api_league_id || '---'}</span></p>
                                    <p>Season: <span className="font-mono text-slate-700">{t.current_season || '---'}</span></p>
                                    <button onClick={() => startEdit(t)} className="text-blue-600 hover:underline text-xs">Editar Config</button>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => handleSyncResults(t.id)}
                                disabled={!t.api_league_id || syncingId === t.id}
                                className="gap-2 min-w-[140px]"
                            >
                                <CheckCircle2 size={18} />
                                Sync Results
                            </Button>
                            <Button
                                onClick={() => handleSync(t.id)}
                                disabled={!t.api_league_id || syncingId === t.id}
                                className={`gap-2 min-w-[140px] ${syncingId === t.id ? 'opacity-80' : ''}`}
                            >
                                <RefreshCw size={18} className={syncingId === t.id ? 'animate-spin' : ''} />
                                {syncingId === t.id ? 'Syncing...' : 'Sync Fixtures'}
                            </Button>
                        </div>
                    </Card>
                ))}

                {tournaments.length === 0 && (
                    <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                        No tournaments found. Run the migration seed.
                    </div>
                )}
            </div>
        </div>
    );
}
