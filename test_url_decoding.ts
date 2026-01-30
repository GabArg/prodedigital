
const originalId = "723f3b79-1f0d-44a0-b01d-da44596bba02_::_VIRTUAL_::_Regular Season -                                                                             - 2";
// Note: I copied the spaces from the output I saw earlier, assuming it's roughly that many.

const encoded = encodeURIComponent(originalId);
console.log("Encoded:", encoded);

// Simulate what Next.js might do or browser
// Browser URL: .../play/723f3b79..._::_Regular%20Season%20-%20%20...%202
// Next.js params.id usually comes decoded.

const decoded = decodeURIComponent(encoded);
console.log("Decoded:", decoded);
console.log("Match Original:", decoded === originalId);

// Test DataService logic
const [tournamentId, , rawRoundName] = decoded.split('_::_');
const roundName = decodeURIComponent(rawRoundName).trim(); // This is what the code does
console.log("Extracted Round Name:", `"${roundName}"`);

// If rawRoundName is already decoded (from split), decodeURIComponent might be redundant or harmful if it has % characters.
// But here it likely doesn't.
