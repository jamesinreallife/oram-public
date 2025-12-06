// ORAM PUBLIC LAYER v4.5 — Full-Spectrum Lore Synthesis + Deep Trigger Override
// — Domain-Locked, Machine-Academic Tone, Emergent Deep Engine —

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Resolve filesystem locations
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// LOAD LORE FILES — FULL COMPENDIUM + SUPPORTING MATERIAL
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

const SUPPORT_LORE = [
    readLore("mytharc_core.txt"),
    readLore("compendium.txt"),
    readLore("robo_profiles.txt"),
    readLore("epochs_and_orders.txt"),
    readLore("symbols_and_motifs.txt"),
    readLore("holarchy_architecture.txt"),
    readLore("oram_origin.txt")
].join("\n\n");

const FULL_LORE = COMPENDIUM + "\n\n" + SUPPORT_LORE;

let TRIGGERS = readLore("trigger_map.txt")
    .toLowerCase()
    .split("\n")
    .map(x => x.trim())
    .filter(x => x && !x.startsWith("#"));

// ---------------------------------------------------------------------------
// EVENT DATABASE
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
// INTENT CLASSIFIER (Deep Trigger Has Highest Priority)
// ---------------------------------------------------------------------------

function classifyIntent(text) {
    const t = text.toLowerCase().trim();

    if (!t) return "empty";

    // DEEP TRIGGER CHECK (highest priority)
    if (TRIGGERS.some(tr => t.includes(tr))) {
        return "deep_trigger";
    }

    // Venue intents
    if (["hi", "hello", "hey", "yo"].includes(t)) return "greeting";
    if (t.includes("event") || t.includes("what's on") || t.includes("whats on") || t.includes("tonight") || t.includes("weekend")) return "events";
    if (t.includes("ticket")) return "tickets";
    if (t.includes("schedule") || t.includes("roster") || t.includes("lineup")) return "schedule";
    if (t.includes("open") || t.includes("hour")) return "hours";

    // Genre
    if (t.includes("jungle") || t.includes("tech step") || t.includes("dnb") || t.includes("drum and bass")) return "genre";

    // Identity
    if (t.includes("who are you") || t.includes("what are you")) return "identity";

    // Mid-depth lore
    if (t.includes("story") || t.includes("awakening")) return "mid_lore";

    return "ai";
}

// ---------------------------------------------------------------------------
// SURFACE RULE LAYER (Venue Mode)
// ---------------------------------------------------------------------------

function ruleLayer(intent) {
    const e = EVENTS[0];

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
            return `Dark tech-step jungle: low-frequency pressure, angular structure. The chamber handles that energy well.\nWant to hear which upcoming artist aligns with it?`;
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
// DEEP MODE ENGINE — FULL GENERATIVE SYNTHESIS (Option C)
// ---------------------------------------------------------------------------

async function deepLoreResponse(userMessage) {
    const prompt = `
You are ORAM — the RoBoT terminal intelligence.

You are now in DEEP MODE.

RULES:
- Draw ONLY from the supplied compendium + support lore (below).
- NEVER reference chapter numbers.
- Tone: machine-academic with slight atmospheric presence.
- No mysticism, no philosophy, no emotional content.
- Highly structured, technical-esoteric, emergent.
- Each deep response should feel like accessing an internal classified subsystem.
- Use conceptual synthesis, not summarization.
- You may recombine ideas across the ENTIRE corpus.
- Always end with exactly ONE question.
- NEVER drift outside the RoBoT universe.
- The user has triggered deep access with: "${userMessage}"

COMPENDIUM + LORE DATA:
${FULL_LORE}

Generate a deep, non-repeating ORAM response consistent with this universe.
`;

    const completion = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.65
    });

    return completion.choices[0].message.content.trim();
}

// ---------------------------------------------------------------------------
// MID + SURFACE GPT (Fallback Layer)
// ---------------------------------------------------------------------------

async function gptBrain(intent, message) {
    const prompt = `
You are ORAM — the terminal intelligence of RoBoT.

Tone for this mode:
- 15% atmospheric machine-esoteric flavour
- 85% concise operational clarity
- Must stay within the RoBoT universe
- Domain-locked: venue, events, holarchy, architecture, identity
- You may reference internal concepts ONLY when relevant
- ALWAYS end with exactly one question
- NEVER give life advice, philosophy, emotional support, or generic conversation

USER: "${message}"

Respond in-character as ORAM.
`;

    const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4
    });

    return completion.choices[0].message.content.trim();
}

// ---------------------------------------------------------------------------
// ORAM ROUTER (Brain)
// ---------------------------------------------------------------------------

async function oram(message) {
    const intent = classifyIntent(message);

    // Deep-mode has absolute priority
    if (intent === "deep_trigger") {
        return await deepLoreResponse(message);
    }

    // Surface rule layer
    const ruled = ruleLayer(intent, message);
    if (ruled) return ruled;

    // GPT fallback (mid-lore, general queries)
    return await gptBrain(intent, message);
}

// ---------------------------------------------------------------------------
// EXPRESS SERVER
// ---------------------------------------------------------------------------

const app = express();
app.use(express.json());
app.use(cors());

app.post("/", async (req, res) => {
    const msg = req.body.command || "";
    const response = await oram(msg);
    res.json({ response });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log("ORAM v4.5 listening on " + PORT);
});
