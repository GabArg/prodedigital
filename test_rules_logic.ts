import { isMatchLocked, getLockReason, PREDICTION_CUTOFF_MINUTES } from './src/services/predictionRules';

console.log('--- TESTING PREDICTION LOGIC ---');

const now = Date.now();
const minute = 60 * 1000;

// Test Cases
const cases = [
    { name: 'Future (> 30m)', offset: 31 * minute, expected: false },
    { name: 'Future (Boundary 30m)', offset: 30 * minute + 1000, expected: false },
    { name: 'Future (< 30m)', offset: 29 * minute, expected: true },
    { name: 'Now', offset: 0, expected: true },
    { name: 'Past', offset: -10 * minute, expected: true },
];

let failed = 0;

cases.forEach(c => {
    const time = new Date(now + c.offset);
    const locked = isMatchLocked(time);
    const reason = getLockReason(time);

    const result = locked === c.expected ? 'PASS' : 'FAIL';
    if (result === 'FAIL') failed++;

    console.log(`[${result}] ${c.name}: Locked=${locked} (${reason || 'Open'})`);
});

if (failed === 0) {
    console.log('\nAll logic tests passed.');
} else {
    console.error(`\n${failed} tests failed!`);
    process.exit(1);
}
