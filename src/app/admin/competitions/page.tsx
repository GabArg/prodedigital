'use client';

import { useState, useEffect } from 'react';
import { getCompetitionsAction, createCompetitionAction } from './actions';
import { Competition } from '@/services/competitionService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Trophy, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminCompetitionsPage() {
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    // Create Form
    const [newComp, setNewComp] = useState<Partial<Competition>>({ type: 'public', status: 'active' });
    const router = useRouter();

    useEffect(() => {
        load();
    }, []);

    async function load() {
        setLoading(true);
        const data = await getCompetitionsAction();
        setCompetitions(data || []);
        setLoading(false);
    }

    async function handleCreate() {
        if (!newComp.name || !newComp.slug) return alert('Name and Slug required');
        const res = await createCompetitionAction(newComp);
        if (res.success) {
            setShowCreate(false);
            setNewComp({ type: 'public', status: 'active' });
            load();
        } else {
            alert('Error: ' + res.error);
        }
    }

    return (
        <div className="container py-8 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Trophy className="text-primary" /> Competitions
                </h1>
                <Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
                    <Plus size={18} /> New Competition
                </Button>
            </div>

            {showCreate && (
                <Card className="p-6 mb-8 border-primary/20 bg-slate-50">
                    <h3 className="font-bold mb-4">Create New Competition</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input
                            placeholder="Name (e.g. Prode Qatar 2022)"
                            value={newComp.name || ''}
                            onChange={e => setNewComp({ ...newComp, name: e.target.value })}
                        />
                        <Input
                            placeholder="Slug (e.g. prode-qatar)"
                            value={newComp.slug || ''}
                            onChange={e => setNewComp({ ...newComp, slug: e.target.value })}
                        />
                        <select
                            className="p-2 border rounded"
                            value={newComp.type}
                            onChange={e => setNewComp({ ...newComp, type: e.target.value as any })}
                        >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                        <select
                            className="p-2 border rounded"
                            value={newComp.status}
                            onChange={e => setNewComp({ ...newComp, status: e.target.value as any })}
                        >
                            <option value="active">Active</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                    <div className="mt-4 flex gap-2 justify-end">
                        <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
                        <Button onClick={handleCreate}>Create</Button>
                    </div>
                </Card>
            )}

            <div className="grid gap-3">
                {competitions.map(c => (
                    <Card key={c.id} className="p-4 flex items-center justify-between hover:border-primary/50 transition-colors">
                        <div>
                            <h3 className="font-bold text-lg">{c.name}</h3>
                            <div className="flex gap-2 text-xs text-slate-500 mt-1">
                                <span className="bg-slate-100 px-2 py-0.5 rounded capitalize">{c.type}</span>
                                <span className={`px-2 py-0.5 rounded capitalize ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100'}`}>
                                    {c.status}
                                </span>
                                <span className="font-mono">/{c.slug}</span>
                            </div>
                        </div>
                        <Link href={`/admin/competitions/${c.id}`}>
                            <Button variant="outline" size="sm" className="gap-2">
                                Manage <ChevronRight size={16} />
                            </Button>
                        </Link>
                    </Card>
                ))}

                {!loading && competitions.length === 0 && (
                    <div className="text-center p-8 text-slate-500">No competitions found.</div>
                )}
            </div>
        </div>
    );
}
