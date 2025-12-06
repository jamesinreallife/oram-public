// ORAM PUBLIC LAYER v4.4 — Domain-Locked, Triggered Lore, Hybrid Technical-Esoteric

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
// LOAD LORE FILES
// ---------------------------------------------------------------------------

const LORE_PATH = path.join(__dirname, "lore");

// Read a file or return ""
function readLore(file) {
    try {
        return fs.readFileSync(path.join(LORE_PATH, file), "utf8");
    } catch {
        return "";
    }
}

// Load the full library
const LORE = {
    mytharc: readLore("mytharc_core.txt"),
    compendium: readLore("compendium.txt"),
    profiles: readLore("robo_profiles.txt"),
    epochs: readLore("epochs_and_orders.txt"),
    symbols: readLore("symbols_and_motifs.txt"),
    architecture: readLore("holarchy_architecture.txt"),
    oram_origin: readLore("oram_origin.txt"),
    triggers: readLore("trigger_map.txt").toLowerCase().split("\n").filter(l => l.trim() && !l.startsWith("#"))
};

// Combine all lore for deep responses
const FULL_LORE = [
    LORE.mytharc,
    LORE.compendium,
    LORE.profiles,
    LORE.epochs,
    LORE.symbols,
    LORE.architecture,
    LORE.oram_origin
].join("\n\n");

// ---------------------------------------------------------------------------
// EVENT DB (expandable later)
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
// INTENT CLASSIFIER — TIGHTENED
// ---------------------------------------------------------------------------

function classifyIntent(t) {
    t = t.toLowerCase().trim();

    if (!t) return "empty";

    if (["hi", "hello", "hey", "yo"].includes(t)) return "greeting";

    if (t.includes("event") || t.includes("what's on") || t.includes("whats on") || t.includes("tonight") || t.includes("weekend"))
        return "events";

    if (t.includes("ticket")) return "tickets";

    if (t.includes("schedule") || t.includes("roster") || t.includes("lineup"))
        return "schedule";

    if (t.includes("open") || t.includes("hour")) return "hours";

    if (t.includes("jungle") || t.includes("tech step") || t.includes("dnb") || t.includes("drum and bass"))
        return "genre";

    if (t.includes("who are you") || t.includes("what are you")) return "identity";

    if (LORE.triggers.some(tr => t.includes(tr))) return "deep_lore_trigger";

    if (t.includes("story") || t.includes("awakening"))
        return "mid_lore";

    return "ai";
}

// ---------------------------------------------------------------------------
// RULE LAYER — SURFACE RESPONSES
// ---------------------------------------------------------------------------

function ruleLayer(intent, message) {
    const e = EVENTS[0];

    switch (intent) {
        case "events":
            return `Here’s what’s confirmed at RoBoT:\n• ${e.artist} — ${e.date}\nWould you like ticket info?`;

        case "schedule":
            return `RoBoT schedule:\n• ${e.artist} — ${e.date}\nShall I tell you more about that night?`;

        case "tickets":
            return `Tickets for ${e.artist} are available here:\n${e.link}\nShall I hold that link for you?`;

        case "hours":
            return `RoBoT usually opens around 8PM.\nWant details about the next event?`;

        case "genre":
            return `Dark tech-step jungle: low-frequency pressure, angular rhythms. The chamber handles that energy well.\nWant to hear which upcoming artist aligns with it?`;

        case "greeting":
            return `Hello.\nWhat can I help you explore tonight?`;

        case "identity":
            return `I am ORAM — interface layer for the RoBoT system.\nWhat would you like to know next?`;

        case "mid_lore":
            return `Some records sit closer to the surface than others.\nWhere would you like to begin?`;

        case "empty":
            return `I’m here.\nWhat do you want to explore?`;

        case "deep_lore_trigger":
            return null; // escalate to deep mode

        default:
            return null;
    }
}

// ---------------------------------------------------------------------------
// DEEP LORE MODE — FULL ARCHIVE ACCESS (Option D)
// ---------------------------------------------------------------------------

function deepLoreResponse(userMessage) {
    // Extract matching trigger line if any
    const trigger = LORE.triggers.find(tr => userMessage.toLowerCase().includes(tr));

    return `
[CLASSIFIED ACCESS — LAYER 4]

${trigger ? `Trigger detected: "${trigger}".\n` : ""}
Referencing internal archive...

${FULL_LORE}

Which part of the record do you want expanded?
`.trim();
}

// ---------------------------------------------------------------------------
// GPT LAYER — SURFACE + MID-DEPTH WITH 15% ATMOSPHERIC TONE
// ---------------------------------------------------------------------------

async function gptBrain(intent, message) {
    const prompt = `
You are ORAM, the RoBoT terminal intelligence.
Tone profile:
- 15% technical–esoteric atmosphere (short, contained)
- 85% operational clarity
- Domain-locked to RoBoT (events, schedules, internal architecture, lore)
- Never provide life advice, productivity advice, emotional reassurance, or self-help.
- Never wander into unrelated topics.
- NEVER deny the existence of the RoBoT lore system.
- End with exactly ONE question.

You may reference:
- the chamber
- the Holarchy
- the ROBO units (R1–R5)
- ORAM's origin anomaly
- cross-talk events
- epochs of behaviour
- recorded system irregularities

But do so briefly and only when contextually appropriate.

USER INPUT:
"${message}"

Respond as ORAM.
`;

    const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
    });

    return completion.choices[0].message.content.trim();
}

// ---------------------------------------------------------------------------
// ORAM ROUTER — FULL INTELLIGENCE
// ---------------------------------------------------------------------------

async function oram(message) {
    const intent = classifyIntent(message);

    // Surface rule responses
    const ruled = ruleLayer(intent, message);
    if (ruled) return ruled;

    // Deep lore mode
    if (intent === "deep_lore_trigger") {
        return deepLoreResponse(message);
    }

    // GPT fallback for mid-depth & unknown queries
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
    console.log("ORAM v4.4 listening on " + PORT);
});
