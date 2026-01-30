'use client';

import { useState, useEffect, use } from 'react';
import { getCompetitionDetailAction, toggleTournamentLinkAction } from '../actions';
import { getTournamentsAction } from '../../tournaments/actions';
import { Competition } from '@/services/competitionService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CompetitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [comp, setComp] = useState<Competition | null>(null);
    const [allTournaments, setAllTournaments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        load();
    }, [id]);

    async function load() {
        setLoading(true);
        const [cData, tData] = await Promise.all([
            getCompetitionDetailAction(id),
            getTournamentsAction()
        ]);
        setComp(cData);
        setAllTournaments(tData || []);
        setLoading(false);
    }

    async function handleToggle(tournId: string, isLinked: boolean) {
        // Optimistic update locally? (Skipping for simplicity, re-fetching or waiting)
        const link = !isLinked; // Toggle
        await toggleTournamentLinkAction(id, tournId, link);
        load(); // Refresh to ensure backend state
    }

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    if (!comp) return <div className="p-8">Competition not found</div>;

    const linkedIds = new Set(comp.tournaments?.map(t => t.id));

    return (
        <div className="container py-8 max-w-4xl">
            <Link href="/admin/competitions" className="flex items-center gap-2 text-slate-500 mb-6 hover:text-primary">
                <ArrowLeft size={16} /> Back to List
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold">{comp.name}</h1>
                <p className="text-slate-500">/{comp.slug} • <span className="capitalize">{comp.type}</span></p>
            </div>

            <div className="grid gap-6">
                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Linked Tournaments (Fixtures)</h2>
                    <p className="text-sm text-slate-500 mb-6">
                        Select which API Tournaments feed into this Competition. Matches from selected tournaments will be available for this Prode.
                    </p>

                    <div className="space-y-4">
                        {allTournaments.map(t => {
                            const isLinked = linkedIds.has(t.id);
                            return (
                                <div key={t.id} className={`flex items-center justify-between p-3 rounded border ${isLinked ? 'border-primary/40 bg-primary/5' : 'border-slate-100'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col">
                                            <span className="font-bold">{t.name}</span>
                                            <span className="text-xs text-slate-400">Season: {t.current_season}</span>
                                        </div>
                                    </div>

                                    <Button
                                        variant={isLinked ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleToggle(t.id, isLinked)}
                                        className={isLinked ? "bg-green-600 hover:bg-green-700" : ""}
                                    >
                                        {isLinked ? 'Linked' : 'Link'}
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                </Card>
            </div>
        </div>
    );
}
