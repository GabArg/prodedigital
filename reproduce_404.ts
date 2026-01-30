
import * as fs from 'fs';
import * as path from 'path';

// Manual Env Load
function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env.local');
    console.log('Loading env from:', envPath);
    if (!fs.existsSync(envPath)) {
        console.error('Env file not found');
        return;
    }
    const content = fs.readFileSync(envPath, 'utf-8');
    let count = 0;
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
            process.env[key] = value;
            count++;
        }
    });
    console.log(`Loaded ${count} env vars.`);
}
loadEnv();

async function test() {
    // Dynamic import
    const { DataService } = await import('./src/services/dataService');

    const id = "723f3b79-1f0d-44a0-b01d-da44596bba02_::_VIRTUAL_::_Regular Season - 2";

    console.log(`Testing getSlipById with ID: "${id}"`);

    const result = await DataService.getSlipById(id);

    if (result) {
        console.log("SUCCESS: Found slip.");
        console.log("Slip ID:", result.id);
        console.log("Matches:", result.matches?.length);
    } else {
        console.log("FAILURE: Slip not found (returned null).");
    }

    // Also check what `getUpcomingMatchesGrouped` returns to compare
    console.log("\n--- Checking available groups ---");
    const groups = await DataService.getUpcomingMatchesGrouped();

    if (groups.length === 0) {
        console.log("No groups found.");
    } else {
        console.log(`Found ${groups.length} groups:`);
        groups.forEach(g => console.log(`[AVAILABLE_ID] "${g.id}"`));
    }
}

test().catch(console.error);
