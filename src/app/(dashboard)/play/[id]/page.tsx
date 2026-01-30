import { Metadata, ResolvingMetadata } from 'next';
import { DataService } from '@/services/dataService';

export const dynamic = 'force-dynamic';

import PlayClient from './PlayClient';
import { notFound } from 'next/navigation';

type Props = {
    params: Promise<{ id: string }>
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    try {
        const { id } = await params;
        const slip = await DataService.getSlipById(id);

        const title = slip?.tournament_name || 'Torneo';
        const desc = slip?.round_name ? `Juega la fecha: ${slip.round_name}` : `Juega al prode en ${title}`;

        return {
            title: `Jugar ${title} - ${slip?.round_name || ''}`,
            description: desc,
        };
    } catch (error) {
        console.warn('[generateMetadata] Failed:', error);
        return {
            title: 'Jugar Prode',
            description: 'Participa en el torneo de pronósticos.',
        };
    }
}

export default async function PlaySlipPage({ params }: Props) {
    const { id } = await params;
    console.log('[PlaySlipPage] Incoming ID:', id);

    let slip;
    try {
        slip = await DataService.getSlipById(id);
    } catch (error) {
        console.error('[PlaySlipPage] Error fetching slip:', error);
        // Fallback or error UI could go here, but for now allow notFound or return null
    }

    if (!slip) {
        console.error(`[PlaySlipPage] Match NOT found for ID: "${id}".`);
        notFound();
    }

    return (
        <PlayClient id={id} initialData={slip} />
    );
}
