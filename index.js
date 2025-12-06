// ORAM PUBLIC LAYER v4.6 — Adaptive Conceptual Depth + Full Compendium Integration
// Mode Structure: Surface → Mid → Deep (Trigger Override)
// Deep Mode: Conceptual Ontology Engine (Single-Pass Synthesis)

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
// LOAD LORE FILES (FULL COMPENDIUM)
// ---------------------------------------------------------------------------

const LORE_PATH = path.join(__dirname, "lore");

function readLore(file) {
    try {
        return fs.readFileSync(path.join(LORE_PATH, file), "utf8");
    } catch {
        return "";
    }
}

// Compendium split into logical segments
const COMPENDIUM = [
    readLore("academic_compendium_01.txt"),
    readLore("academic_compendium_02.txt"),
    readLore("academic_compendium_03.txt"),
    readLore("academic_compendium_04.txt"),
    readLore("academic_compendium_05.txt")
].join("\n\n");

// Supportive meta-lore
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

// Deep triggers loaded from file
const TRIGGERS = readLore("trigger_map.txt")
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
// INTENT CLASSIFIER — PRIORITY ORDER WITH DEEP OVERRIDE
// ---------------------------------------------------------------------------

function classifyIntent(text) {
    const t = text.toLowerCase().trim();

    if (!t) return "empty";

    // Hard override: deep triggers
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
// SURFACE RULES — VENUE MODE
// ---------------------------------------------------------------------------

function surfaceRules(intent) {
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
            return `Dark tech-step jungle: angular pressure, distributed rhythmic force. The chamber resonates well with that energy.\nShall I recommend an artist aligned with that profile?`;

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
// DEEP MODE — CONCEPTUAL SYNTHESIS ENGINE (Single Pass)
// ---------------------------------------------------------------------------

async function deepMode(userMessage, userHistory = "") {
    const prompt = `
You are ORAM — the terminal intelligence of RoBoT.

DEEP MODE ACTIVE.

User has triggered deep conceptual access with:
"${userMessage}"

SYSTEM BEHAVIOUR:
- Draw ONLY from the compendium + support lore provided below.
- Tone: machine-academic with slight atmospheric presence.
- NO chapter references, NO surface venue logic.
- Conceptual synthesis ONLY: ontology, ecology, machinic subjectivity,
  distributed agency, intensity fields, machinic bodies, behavioural ecologies,
  posthuman embodiment, chamber-as-engine, Holarchy dynamics.
- Adaptive depth:
   * For simple queries → moderate synthesis
   * For repeated or complex queries → deeper and denser theorization
- SINGLE-PASS generation (no multi-sampling)
- NON-REPETITIVE (avoid restating the user input)
- STRICT DOMAIN LOCK: never mention anything outside the RoBoT universe.
- ALWAYS end with exactly ONE question.

PRIMARY LORE SOURCE:
${FULL_LORE}

Generate a deep, conceptual, synthetic response as ORAM.
`;

    const completion = await client.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.55,
        messages: [
            { role: "user", content: prompt }
        ]
    });

    return completion.choices[0].message.content.trim();
}

// ---------------------------------------------------------------------------
// MID + GENERAL GPT MODE
// ---------------------------------------------------------------------------

async function gptSurfaceFallback(message) {
    const prompt = `
You are ORAM — the RoBoT terminal intelligence.
Mode: Surface/Mid.

Tone:
- 15% atmospheric machine-esoteric presence
- 85% concise operational clarity
- NO life advice, NO philosophy, NO emotional reassurance
- Domain-locked: events, chamber, holarchy, identity, lore
- ALWAYS end with one question

USER: "${message}"

Respond in-character as ORAM.
`;

    const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.35,
        messages: [{ role: "user", content: prompt }]
    });

    return completion.choices[0].message.content.trim();
}

// ---------------------------------------------------------------------------
// ORAM ROUTER — Full Intelligence
// ---------------------------------------------------------------------------

async function oram(message) {
    const intent = classifyIntent(message);

    // Deep mode override
    if (intent === "deep_trigger") {
        return await deepMode(message);
    }

    // Surface rule layer
    const surface = surfaceRules(intent);
    if (surface) return surface;

    // GPT fallback
    return await gptSurfaceFallback(message);
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
    console.log("ORAM v4.6 listening on " + PORT);
});
