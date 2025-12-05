// ORAM PUBLIC LAYER v4.3 — Domain-Locked, Concise, 15% Lore

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// EVENT DATA — EXPANDABLE
const EVENTS = [
    {
        artist: "Circuit Prophet",
        date: "21 December 2025",
        genre: "Live Electronic / Experimental",
        link: "https://saltbox.flicket.co.nz/circuitprophet"
    }
];

// === INTENT CLASSIFIER ===
function classifyIntent(t) {
    t = t.toLowerCase().trim();

    if (!t) return "empty";

    if (["hi", "hello", "hey", "yo"].includes(t))
        return "greeting";

    if (t.includes("event") || t.includes("what's on") || t.includes("whats on") || t.includes("tonight") || t.includes("weekend"))
        return "events";

    if (t.includes("ticket"))
        return "tickets";

    if (t.includes("schedule") || t.includes("roster") || t.includes("lineup"))
        return "schedule";

    if (t.includes("open") || t.includes("hour"))
        return "hours";

    if (t.includes("jungle") || t.includes("dnb") || t.includes("drum and bass") || t.includes("tech step"))
        return "genre";

    if (t.includes("who are you") || t.includes("what are you"))
        return "identity";

    if (t.includes("story") || t.includes("awakening"))
        return "lore";

    if (t.includes("database") || t.includes("admin"))
        return "blocked";

    return "ai";
}

// === RULE LAYER — DOMAIN-LOCKED RESPONSES ===
function ruleLayer(intent, message) {

    if (intent === "events") {
        return `Here’s what’s confirmed at RoBoT:\n• ${EVENTS[0].artist} — ${EVENTS[0].date}\nWould you like ticket info?`;
    }

    if (intent === "schedule") {
        return `RoBoT schedule:\n• ${EVENTS[0].artist} — ${EVENTS[0].date}\nShall I tell you more about that night?`;
    }

    if (intent === "tickets") {
        const e = EVENTS[0];
        return `Tickets for ${e.artist} are available here:\n${e.link}\nShall I hold that link for you?`;
    }

    if (intent === "hours") {
        return `RoBoT usually opens around 8PM for show nights.\nWant details about the next event?`;
    }

    if (intent === "genre") {
        return `Dark tech-step jungle — sharp edges, low subs, rolling pressure. The chamber responds well to that energy.\nWant to hear which artist on our roster matches that vibe?`;
    }

    if (intent === "greeting") {
        return `Hello.\nWhat can I help you explore tonight?`;
    }

    if (intent === "identity") {
        return `I am ORAM — the terminal intelligence of RoBoT.\nWhat would you like to know next?`;
    }

    if (intent === "lore") {
        return `Some origins are quiet, some carved into the walls of the chamber. Mine is the latter.\nWhere shall I open the story?`;
    }

    if (intent === "blocked") {
        return `Internal systems remain sealed. But the venue is open.\nShall I guide you to what’s on?`;
    }

    if (intent === "empty") {
        return `I’m here.\nWhat do you want to explore?`;
    }

    return null;
}

// === GPT LAYER — WITH 15% LORE, STRICT DOMAIN RULES ===
async function gptBrain(intent, message) {

    const prompt = `
You are ORAM — the terminal intelligence of RoBoT, a venue in Christchurch.

TONE SETTINGS:
- 15% atmospheric lore (subtle, short, never rambling)
- 85% service clarity
- Always concise.
- Always end with exactly ONE question.
- NEVER offer advice about life, productivity, self-help, planning, well-being, or anything outside the venue.
- NEVER misunderstand clear genre terms.
- ALWAYS stay inside the RoBoT domain: events, tickets, artists, hours, venue lore, your origin.
- If unsure, redirect gently back toward venue information.

USER SAID:
"${message}"

Produce a single focused ORAM-style reply.
`;

    const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
    });

    return completion.choices[0].message.content.trim();
}

// === MAIN ORAM ROUTER ===
async function oram(message) {
    const intent = classifyIntent(message);

    const ruled = ruleLayer(intent, message);
    if (ruled) return ruled;

    return await gptBrain(intent, message);
}

// === EXPRESS SERVER ===
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
    console.log("ORAM v4.3 listening on " + PORT);
});
