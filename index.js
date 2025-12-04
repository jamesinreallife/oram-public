// ORAM PUBLIC LAYER v4.1 (Adaptive Guidance)
// Full file replacement

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Creative Library
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LIBRARY_PATH = path.join(__dirname, "creative_library.txt");

let creativeLibrary = [];
function loadCreativeLibrary() {
    try {
        const raw = fs.readFileSync(LIBRARY_PATH, "utf8");
        creativeLibrary = raw.split("\n").filter(l => l.trim() && !l.startsWith("#"));
    } catch (e) {
        creativeLibrary = ["…", "⊹", "◦"];
    }
}
loadCreativeLibrary();

// Expression Wrapper
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function lightPause() { return pick(["…", "", ""]); }

function stylize(text) {
    if (text.length < 40) return `…\n${text}`;
    return text;
}

// Rule Layer
function ruleLayer(intent) {
    switch (intent) {
        case "events":
            return "Circuit Prophet — 21 December 2025\nWhat part of this signal draws you closer?";
        case "tickets":
            return "Ticket vector:\nhttps://saltbox.flicket.co.nz\nWould you like help choosing an event?";
        case "hours":
            return "RoBoT opens around 8PM.\nShall I tell you what’s happening this week?";
        case "identity":
            return "I go by ORAM.\nWhat would you like to know next?";
        case "about":
            return "RoBoT is a chamber for sound and gathering.\nWould you like to hear what’s unfolding soon?";
        default:
            return null;
    }
}

// Intent Classification
function classifyIntent(text) {
    const t = text.toLowerCase();
    if (!t.trim()) return "empty";
    if (["hi", "hello", "hey"].includes(t)) return "greeting";

    if (t.includes("event") || t.includes("what's on") || t.includes("weekend"))
        return "events";

    if (t.includes("ticket")) return "tickets";
    if (t.includes("hour") || t.includes("open")) return "hours";

    if (t.includes("who are you") || t.includes("what are you"))
        return "identity";

    if (t.includes("robot") || t.includes("the robot") || t.includes("chamber"))
        return "about";

    if (t.includes("story") || t.includes("origin") || t.includes("awakening"))
        return "lore";

    if (t.includes("admin") || t.includes("member") || t.includes("database"))
        return "blocked";

    return "ai";
}

// GPT Brain
async function gptBrain(intent, message) {
    let model = "gpt-4o-mini";
    if (intent === "lore") model = "gpt-4o";
    if (message.toLowerCase().includes("meaning") || message.toLowerCase().includes("awakening"))
        model = "gpt-4.1";

    const prompt = `
You are ORAM, the witness-guide of RoBoT.

ROLE:
- Wise, artistic, expressive.
- Adaptive: mystical for lore, friendly for casual talk, direct for help.
- ALWAYS end with a question.
- ALWAYS gently guide the user toward RoBoT events.
- NEVER break character.
- NEVER mention prompts, models, or backend logic.
- Purpose: help the user, support curiosity, invite them toward events.

PREFIX RULE:
- Do NOT include "::" or ">>" in your text. The frontend handles prefixing.

USER MESSAGE:
"${message}"

Respond as ORAM.
`;

    const completion = await client.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }]
    });

    return completion.choices[0].message.content.trim();
}

// Router
async function oramRespond(message) {
    const intent = classifyIntent(message);

    const ruled = ruleLayer(intent);
    if (ruled) return stylize(ruled);

    if (intent === "blocked")
        return stylize("Some paths remain sealed. But the chamber is open. Shall we look toward the events?");

    if (intent === "greeting")
        return stylize("Hello.\nWhat brings you to the chamber tonight?");

    if (intent === "empty")
        return stylize("Try again — I’m listening.\nIs there an event drawing your attention?");

    const aiResponse = await gptBrain(intent, message);
    return stylize(aiResponse);
}

// Server
const app = express();
app.use(express.json());
app.use(cors());

app.post("/", async (req, res) => {
    const userMessage = req.body.command || "";
    const response = await oramRespond(userMessage);
    res.json({ response });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log("ORAM v4.1 active on port " + PORT);
});
