import { competitionService } from './src/services/competitionService';

async function check() {
    try {
        const comps = await competitionService.getAllCompetitions();
        console.log('Competitions in DB:', comps.length);
        console.log(JSON.stringify(comps, null, 2));
    } catch (e) {
        console.error('Error fetching competitions:', e);
    }
}

check();
