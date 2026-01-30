
import * as fs from 'fs';
import * as path from 'path';

// Manual Env Load
function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) return;
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
            process.env[key] = value;
        }
    });
}
loadEnv();

async function list() {
    const { DataService } = await import('./src/services/dataService');
    const groups = await DataService.getUpcomingMatchesGrouped();

    console.log("--- START LIST ---");
    groups.forEach(g => {
        console.log("GROUP_ID: \"" + g.id + "\"");
    });
    console.log("--- END LIST ---");
}

list().catch(console.error);
