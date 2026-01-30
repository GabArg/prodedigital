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
    const { id } = await params;
    const slip = await DataService.getSlipById(id);

    const title = slip?.tournament_name || 'Torneo';
    const desc = slip?.round_name ? `Juega la fecha: ${slip.round_name}` : `Juega al prode en ${title}`;

    return {
        title: `Jugar ${title} - ${slip?.round_name || ''}`,
        description: desc,
    }
}

export default async function PlaySlipPage({ params }: Props) {
    const { id } = await params;
    console.log('[PlaySlipPage] Incoming ID:', id);
    const slip = await DataService.getSlipById(id);

    if (!slip) {
        console.error(`[PlaySlipPage] Match NOT found for ID: "${id}". Normalized or fuzzy ID search also failed.`);
        notFound();
    }

    return (
        <PlayClient id={id} initialData={slip} />
    );
}
