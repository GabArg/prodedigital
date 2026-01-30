
const receivedId = "723f3b79-1f0d-44a0-b01d-da44596bba02_%3A%3A_VIRTUAL_%3A%3A_Regular%20Season%20-%20202";
// Note: The "202" at the end is suspicious. Let's list potential variations based on reading the screenshot.
// Variation 1: Literal from OCR
const v1 = "723f3b79-1f0d-44a0-b01d-da44596bba02_%3A%3A_VIRTUAL_%3A%3A_Regular%20Season%20-%20202";
// Variation 2: Assuming "202" is actually "2" and some visual artifact or user typo in the ID generation?
// Or maybe it is `%20` + `2`. 
const v2 = "723f3b79-1f0d-44a0-b01d-da44596bba02_%3A%3A_VIRTUAL_%3A%3A_Regular%20Season%20-%202";

const targetId = "723f3b79-1f0d-44a0-b01d-da44596bba02_::_VIRTUAL_::_Regular Season - 2";

console.log("Target:", targetId);

function tryDecode(input: string) {
    console.log("\nInput:", input);
    try {
        const decoded = decodeURIComponent(input);
        console.log("Decoded:", decoded);
        console.log("Matches Target?", decoded === targetId);
    } catch (e) {
        console.log("Decode error:", e);
    }
}

tryDecode(v1);
tryDecode(v2);

// Check if we need recursive decode
const v3 = "723f3b79-1f0d-44a0-b01d-da44596bba02_%253A%253A_VIRTUAL_%253A%253A_Regular%2520Season%2520-%25202";
tryDecode(v3);
