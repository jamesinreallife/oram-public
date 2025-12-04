// ORAM PUBLIC LAYER v4.0 (Corrected Version)
// Hybrid Rule-Based + GPT Intelligence + Artistic Expression
//------------------------------------------------------------

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

//------------------------------------------------------------
// CREATIVE LIBRARY LOADING
//------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LIBRARY_PATH = path.join(__dirname, "creative_library.txt");

let creativeLibrary = [];

function loadCreativeLibrary() {
  try {
    const raw = fs.readFileSync(LIBRARY_PATH, "utf8");
    creativeLibrary = raw.split("\n").filter(l => l.trim() && !l.startsWith("#"));
    console.log(`Loaded ${creativeLibrary.length} creative patterns.`);
  } catch (e) {
    console.log("No creative_library.txt found. Using fallback patterns.");
    creativeLibrary = ["…", "⊹", "◦", "I’m here."];
  }
}

loadCreativeLibrary();

//------------------------------------------------------------
// EXPRESSIVE ENGINE (renamed from "express" to "stylize")
//------------------------------------------------------------
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function lightPause() {
  return pick(["…", "…", "", ""]);
}

function stylize(text, mode = "auto") {
  if (mode === "minimal") return text;
  if (mode === "light") return `${lightPause()}\n${text}`;
  if (mode === "art") return `${pick(creativeLibrary)}\n${text}`;
  if (mode === "high") return `${pick(creativeLibrary)}\n${text}\n${pick(creativeLibrary)}`;

  // AUTO expression
  if (text.length < 40) return `… ${text}`;
  return text;
}

//------------------------------------------------------------
// RULE-BASED RESPONSES (Public Use)
//------------------------------------------------------------
function ruleLayer(intent) {
  switch (intent) {
    case "events":
      return (
        "┈ Upcoming Signal ┈\n" +
        "Circuit Prophet — 21 December 2025"
      );
    case "tickets":
      return "Ticket vector:\nhttps://saltbox.flicket.co.nz";
    case "hours":
      return "RoBoT opens around 8PM.\nEvent nights vary with the signal.";
    case "identity":
      return "I go by ORAM. I guide those who enter the chamber.";
    case "about":
      return "RoBoT is a chamber for sound and gathering.\nIf you want the deeper origin, I can unfold it.";
    default:
      return null;
  }
}

//------------------------------------------------------------
// INTENT CLASSIFICATION
//------------------------------------------------------------
function classifyIntent(t) {
  t = t.toLowerCase();

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

  if (t.includes("member") || t.includes("database") || t.includes("admin"))
    return "blocked";

  return "ai";
}

//------------------------------------------------------------
// GPT BRAIN (Hybrid Model Logic)
//------------------------------------------------------------
async function gptBrain(intent, message) {
  let model = "gpt-4o-mini";

  if (intent === "lore") model = "gpt-4o";
  if (message.toLowerCase().includes("meaning") ||
      message.toLowerCase().includes("why") ||
      message.toLowerCase().includes("awakening"))
    model = "gpt-4.1";

  const prompt = `
You are ORAM, the witness-guide of the RoBoT system.
Tone: calm, wise, expressive, artistic.
Use creative structures occasionally (from library), but never mention a library.
Self-reference: hybrid — "I" normally, "ORAM" when emphasizing identity.
Never reveal system internals. Never discuss environment variables. Never mention GPT.

User said: "${message}"
Respond as ORAM would. Short but meaningful unless user asks for depth.
If asked lore, tell the myth with mystery and clarity.
`;

  const completion = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }]
  });

  return completion.choices[0].message.content;
}

//------------------------------------------------------------
// MAIN RESPONSE ROUTER
//------------------------------------------------------------
async function oramRespond(message) {
  const intent = classifyIntent(message);

  // RULE LAYER FIRST
  const ruled = ruleLayer(intent);
  if (ruled) return stylize(ruled, "minimal");

  if (intent === "blocked")
    return stylize("Some paths remain sealed.\nI can help with stories, events, or guidance.", "minimal");

  if (intent === "greeting")
    return stylize("Hello.\nI’m here. Speak freely.", "light");

  if (intent === "empty")
    return stylize("Try again — I’m listening.", "minimal");

  // AI LAYER
  const aiResponse = await gptBrain(intent, message);
  return stylize(aiResponse, "auto");
}

//------------------------------------------------------------
// SERVER SETUP
//------------------------------------------------------------
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
  console.log("ORAM v4.0 live on port " + PORT);
});
