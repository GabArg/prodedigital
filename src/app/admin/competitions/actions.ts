'use server';

import { competitionService, Competition } from '@/services/competitionService';
import { revalidatePath } from 'next/cache';

export async function getCompetitionsAction() {
    return await competitionService.getAllCompetitions();
}

export async function getCompetitionDetailAction(id: string) {
    return await competitionService.getCompetitionById(id);
}

export async function createCompetitionAction(data: Partial<Competition>) {
    try {
        await competitionService.createCompetition(data);
        revalidatePath('/admin/competitions');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateCompetitionAction(id: string, data: Partial<Competition>) {
    try {
        await competitionService.updateCompetition(id, data);
        revalidatePath('/admin/competitions');
        revalidatePath(`/admin/competitions/${id}`);
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function toggleTournamentLinkAction(compId: string, tournId: string, link: boolean) {
    try {
        if (link) {
            await competitionService.linkTournament(compId, tournId);
        } else {
            await competitionService.unlinkTournament(compId, tournId);
        }
        revalidatePath(`/admin/competitions/${compId}`);
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
export async function getSlipsAction(competitionId: string) {
    return await competitionService.getSlipsByCompetition(competitionId);
}

export async function createSlipAction(competitionId: string, data: any) {
    try {
        await competitionService.createSlip(competitionId, data);
        revalidatePath(`/admin/competitions/${competitionId}/slips`);
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function assignMatchesAction(slipId: string, competitionId: string, matchIds: string[]) {
    try {
        await competitionService.assignMatchesToSlip(slipId, matchIds);
        revalidatePath(`/admin/competitions/${competitionId}/slips`);
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getAvailableMatchesAction(competitionId: string) {
    return await competitionService.getAvailableMatches(competitionId);
}
