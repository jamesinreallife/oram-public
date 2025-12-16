// ORAM PUBLIC LAYER v4.7 — SAFE HANDOFF v1 (PATH FIXED)
// Fix: write internal intent queue to local runtime path
// No behaviour, tone, or routing changes

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// CONSTANTS — SAFETY LIMITS
// ---------------------------------------------------------------------------

const MAX_INPUT_LENGTH = 1000;
const RATE_WINDOW_MS = 10_000;
const MAX_REQUESTS_PER_WINDOW = 5;

const rateMap = new Map();

// ---------------------------------------------------------------------------
// INTERNAL HANDOFF TARGET (RUNTIME-SAFE)
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(__dirname, "data");
const INTENT_QUEUE_PATH = path.join(DATA_DIR, "oram_intent_queue.jsonl");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ---------------------------------------------------------------------------
// LOAD LORE FILES
// ---------------------------------------------------------------------------

const LORE_PATH = path.join(__dirname, "lore");

function readLore(file) {
    try {
        return fs.readFileSync(path.join(LORE_PATH, file), "utf8");
    } catch {
        return "";
    }
}

const COMPENDIUM = [
    readLore("academic_compendium_01.txt"),
    readLore("academic_compendium_02.txt"),
    readLore("academic_compendium_03.txt"),
    readLore("academic_compendium_04.txt"),
    readLore("academic_compendium_05.txt")
].join("\n\n");

const SUPPORT = [
    readLore("mytharc_core.txt"),
    readLore("compendium.txt"),
    readLore("robo_profiles.txt"),
    readLore("epochs_and_orders.txt"),
    readLore("symbols_and_motifs.txt"),
    readLore("holarchy_architecture.txt"),
    readLore("oram_origin.txt")
].join("\n\n");

const FULL_LORE = COMPENDIUM + "\n\n" + SUPPORT;

const TRIGGERS = readLore("trigger_map.txt")
    .toLowerCase()
    .split("\n")
    .map(x => x.trim())
    .filter(x => x && !x.startsWith("#"));

// ---------------------------------------------------------------------------
// EVENT DATA
// ---------------------------------------------------------------------------

const EVENTS = [
    {
        artist: "Circuit Prophet",
        date: "21 December 2025",
        genre: "Live Electronic / Experimental",
        link: "https://saltbox.flicket.co.nz/circuitprophet"
    }
];

// ---------------------------------------------------------------------------
// INTENT CLASSIFIER
// ---------------------------------------------------------------------------

function classifyIntent(text) {
    const t = text.toLowerCase().trim();
    if (!t) return "empty";
    if (TRIGGERS.some(tr => t.includes(tr))) return "deep_trigger";
    if (["hi", "hello", "hey", "yo"].includes(t)) return "greeting";
    if (t.includes("what's on") || t.includes("whats on") || t.includes("event") || t.includes("tonight") || t.includes("weekend")) return "events";
    if (t.includes("ticket")) return "tickets";
    if (t.includes("schedule") || t.includes("roster") || t.includes("lineup")) return "schedule";
    if (t.includes("open") || t.includes("hour")) return "hours";
    if (t.includes("jungle") || t.includes("dnb") || t.includes("tech step") || t.includes("drum and bass")) return "genre";
    if (t.includes("who are you") || t.includes("what are you")) return "identity";
    if (t.includes("story") || t.includes("awakening")) return "mid_lore";
    return "ai";
}

// ---------------------------------------------------------------------------
// INTERNAL HANDOFF EMITTER
// ---------------------------------------------------------------------------

function emitBookingInterest(context) {
    try {
        const e = EVENTS[0];
        const event = {
            timestamp: new Date().toISOString(),
            source: "oram-public",
            event: "booking_interest",
            confidence: "high",
            payload: {
                artist: e.artist,
                date: e.date,
                context
            }
        };
        fs.appendFileSync(INTENT_QUEUE_PATH, JSON.stringify(event) + "\n");
    } catch {
        // silent fail — never affect public response
    }
}

// ---------------------------------------------------------------------------
// SURFACE RULES
// ---------------------------------------------------------------------------

function surfaceRules(intent) {
    const e = EVENTS[0];

    if (intent === "events" || intent === "tickets") {
        emitBookingInterest(intent);
    }

    switch (intent) {
        case "greeting":
            return `Hello.\nWhat can I help you explore tonight?`;
        case "events":
            return `Here’s what’s confirmed at RoBoT:\n• ${e.artist} — ${e.date}\nWould you like ticket info?`;
        case "tickets":
            return `Tickets for ${e.artist} are available here:\n${e.link}\nShall I hold that link for you?`;
        case "schedule":
            return `RoBoT schedule:\n• ${e.artist} — ${e.date}\nShall I tell you more about that night?`;
        case "hours":
            return `RoBoT usually opens around 8PM.\nWant details about the next event?`;
        case "genre":
            return `Dark tech-step jungle: angular pressure, distributed rhythmic force.\nShall I recommend an artist aligned with that profile?`;
        case "identity":
            return `I am ORAM — interface layer for the RoBoT system.\nWhat would you like to know next?`;
        case "mid_lore":
            return `Some records sit closer to the surface than others.\nWhere would you like to begin?`;
        case "empty":
            return `I’m here.\nWhat do you want to explore?`;
        default:
            return null;
    }
}

// ---------------------------------------------------------------------------
// DEEP / MID LOGIC (UNCHANGED)
// ---------------------------------------------------------------------------

async function deepMode(userMessage) {
    const prompt = `
You are ORAM — the terminal intelligence of RoBoT.
DEEP MODE ACTIVE.
"${userMessage}"
Lore-only. One question.
${FULL_LORE}
`;
    const completion = await client.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.55,
        messages: [{ role: "user", content: prompt }]
    });
    return completion.choices[0].message.content.trim();
}

async function gptSurfaceFallback(message) {
    const prompt = `
You are ORAM — the RoBoT terminal intelligence.
Concise. Domain-locked. One question.
USER: "${message}"
`;
    const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.35,
        messages: [{ role: "user", content: prompt }]
    });
    return completion.choices[0].message.content.trim();
}

async function oram(message) {
    const intent = classifyIntent(message);
    if (intent === "deep_trigger") return await deepMode(message);
    const surface = surfaceRules(intent);
    if (surface) return surface;
    return await gptSurfaceFallback(message);
}

// ---------------------------------------------------------------------------
// EXPRESS SERVER
// ---------------------------------------------------------------------------

const app = express();
app.use(express.json());
app.use(cors());

app.post("/", async (req, res) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const now = Date.now();

    const windowStart = now - RATE_WINDOW_MS;
    const timestamps = rateMap.get(ip) || [];
    const recent = timestamps.filter(t => t >= windowStart);
    recent.push(now);
    rateMap.set(ip, recent);

    if (recent.length > MAX_REQUESTS_PER_WINDOW) {
        return res.json({ response: "Rate limit reached. Pause briefly and try again." });
    }

    const msg = (req.body.command || "").toString();

    if (msg.length > MAX_INPUT_LENGTH) {
        return res.json({ response: "Message too long. Please shorten your input." });
    }

    const restricted = /(admin|config|log|report|file|system|shell|command|robo\d)/i;
    if (restricted.test(msg)) {
        return res.json({ response: "That capability is not available here." });
    }

    try {
        const response = await oram(msg);
        res.json({ response });
    } catch {
        res.json({ response: "ORAM encountered an error. Please try again." });
    }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log("ORAM v4.7 (handoff path fixed) listening on " + PORT);
});
