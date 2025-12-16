// ORAM PUBLIC LAYER v4.8 — REQUEST VISIBILITY + SAFE HANDOFF
// Adds: explicit request logging + handoff confirmation
// No logic, tone, or routing changes

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
// CONSTANTS
// ---------------------------------------------------------------------------

const MAX_INPUT_LENGTH = 1000;
const RATE_WINDOW_MS = 10_000;
const MAX_REQUESTS_PER_WINDOW = 5;
const rateMap = new Map();

// ---------------------------------------------------------------------------
// INTERNAL HANDOFF TARGET (RUNTIME)
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(__dirname, "data");
const INTENT_QUEUE_PATH = path.join(DATA_DIR, "oram_intent_queue.jsonl");

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ---------------------------------------------------------------------------
// LOAD LORE
// ---------------------------------------------------------------------------

const LORE_PATH = path.join(__dirname, "lore");

function readLore(file) {
    try {
        return fs.readFileSync(path.join(LORE_PATH, file), "utf8");
    } catch {
        return "";
    }
}

const FULL_LORE = [
    readLore("academic_compendium_01.txt"),
    readLore("academic_compendium_02.txt"),
    readLore("academic_compendium_03.txt"),
    readLore("academic_compendium_04.txt"),
    readLore("academic_compendium_05.txt"),
    readLore("mytharc_core.txt"),
    readLore("compendium.txt"),
    readLore("robo_profiles.txt"),
    readLore("epochs_and_orders.txt"),
    readLore("symbols_and_motifs.txt"),
    readLore("holarchy_architecture.txt"),
    readLore("oram_origin.txt")
].join("\n\n");

const TRIGGERS = readLore("trigger_map.txt")
    .toLowerCase()
    .split("\n")
    .map(x => x.trim())
    .filter(Boolean);

// ---------------------------------------------------------------------------
// EVENT DATA
// ---------------------------------------------------------------------------

const EVENTS = [
    {
        artist: "Circuit Prophet",
        date: "21 December 2025",
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
    if (t.includes("event")) return "events";
    if (t.includes("ticket")) return "tickets";
    if (t.includes("schedule")) return "schedule";
    if (t.includes("open") || t.includes("hour")) return "hours";
    if (t.includes("who are you")) return "identity";
    if (t.includes("story") || t.includes("awakening")) return "mid_lore";
    return "ai";
}

// ---------------------------------------------------------------------------
// INTERNAL HANDOFF EMITTER
// ---------------------------------------------------------------------------

function emitBookingInterest(context) {
    try {
        const e = EVENTS[0];
        const payload = {
            timestamp: new Date().toISOString(),
            source: "oram-public",
            event: "booking_interest",
            context,
            artist: e.artist,
            date: e.date
        };

        fs.appendFileSync(INTENT_QUEUE_PATH, JSON.stringify(payload) + "\n");
        console.log("[HANDOFF] booking_interest emitted:", context);
    } catch (err) {
        console.error("[HANDOFF ERROR]", err.message);
    }
}

// ---------------------------------------------------------------------------
// SURFACE RULES
// ---------------------------------------------------------------------------

function surfaceRules(intent) {
    if (intent === "events" || intent === "tickets") {
        emitBookingInterest(intent);
    }

    const e = EVENTS[0];

    switch (intent) {
        case "events":
            return `Here’s what’s confirmed at RoBoT:\n• ${e.artist} — ${e.date}\nWould you like ticket info?`;
        case "tickets":
            return `Tickets for ${e.artist}:\n${e.link}\nShall I hold that link for you?`;
        case "greeting":
            return `Hello.\nWhat can I help you explore tonight?`;
        default:
            return null;
    }
}

// ---------------------------------------------------------------------------
// ORAM CORE
// ---------------------------------------------------------------------------

async function oram(message) {
    const intent = classifyIntent(message);
    const surface = surfaceRules(intent);
    if (surface) return surface;
    return "Acknowledged. What would you like to explore?";
}

// ---------------------------------------------------------------------------
// EXPRESS SERVER
// ---------------------------------------------------------------------------

const app = express();
app.use(express.json());
app.use(cors());

app.post("/", async (req, res) => {
    console.log("[REQUEST] Incoming command:", req.body.command);

    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const now = Date.now();

    const recent = (rateMap.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
    recent.push(now);
    rateMap.set(ip, recent);

    if (recent.length > MAX_REQUESTS_PER_WINDOW) {
        return res.json({ response: "Rate limit reached." });
    }

    const msg = (req.body.command || "").toString();

    if (msg.length > MAX_INPUT_LENGTH) {
        return res.json({ response: "Message too long." });
    }

    const response = await oram(msg);
    res.json({ response });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log("ORAM v4.8 listening on", PORT);
});
