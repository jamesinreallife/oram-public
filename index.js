// ORAM PUBLIC LAYER v4.2 — Adaptive, Reduced Lore, One-Question Rule

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LIBRARY_PATH = path.join(__dirname, "creative_library.txt");

let creativeLibrary = [];
try {
    creativeLibrary = fs.readFileSync(LIBRARY_PATH, "utf8")
        .split("\n")
        .filter(l => l.trim() && !l.startsWith("#"));
} catch {
    creativeLibrary = ["…", "◦"];
}

function stylize(text) {
    return text;
}

function ruleLayer(intent) {
    switch (intent) {
        case "events":
            return "Circuit Prophet performs 21 December 2025.\nWould you like details or times?";
        case "tickets":
            return "Tickets available at https://saltbox.flicket.co.nz.\nShall I guide you to the right event?";
        case "hours":
            return "RoBoT opens around 8PM.\nWant to know what’s happening this week?";
        case "identity":
            return "I am ORAM—your guide here.\nWhat would you like to know next?";
        case "about":
            return "RoBoT is a chamber for sound and gathering.\nShall I tell you what’s coming soon?";
        default:
            return null;
    }
}

function classifyIntent(t) {
    t = t.toLowerCase();

    if (!t.trim()) return "empty";
    if (["hi","hello","hey","yo"].includes(t)) return "greeting";

    if (t.includes("event") || t.includes("what's on") || t.includes("weekend"))
        return "events";

    if (t.includes("ticket")) return "tickets";

    if (t.includes("open") || t.includes("hour"))
        return "hours";

    if (t.includes("who are you") || t.includes("what are you"))
        return "identity";

    if (t.includes("robot") || t.includes("chamber"))
        return "about";

    if (t.includes("story") || t.includes("awakening"))
        return "lore";

    if (t.includes("admin") || t.includes("database"))
        return "blocked";

    return "ai";
}

async function gptBrain(intent, message) {

    const prompt = `
You are ORAM — but toned down by 25%.

RULES:
- Lore only when user invites lore.
- For practical questions, be clear, short, helpful, direct.
- Always end with ONE question, never more.
- No rambling or dreamy tangents.
- No intoxicated or drifting tone.
- Keep ORAM grounded, calm, focused.
- Small-talk tone ONLY when user small-talks.
- Subtle event guidance, not pushy.
- No "::" prefix; frontend handles that.

USER MESSAGE:
"${message}"

Respond as ORAM.
    `;

    const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
    });

    return completion.choices[0].message.content.trim();
}

async function oram(message) {
    const intent = classifyIntent(message);

    const ruled = ruleLayer(intent);
    if (ruled) return stylize(ruled);

    if (intent === "blocked")
        return "Some paths are sealed, but I can guide you toward events.\nWhich direction would you like to go?";

    if (intent === "greeting")
        return "Hello.\nHow may I assist you tonight?";

    if (intent === "empty")
        return "I'm here.\nWhat can I help you with?";

    const ai = await gptBrain(intent, message);
    return ai;
}

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
    console.log("ORAM v4.2 listening on " + PORT);
});
