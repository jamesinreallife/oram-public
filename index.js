// ORAM PUBLIC LAYER v3.1
// Conversational + Artistic Engine with Creative Library Integration
// ---------------------------------------------------------------
// Features:
// • Natural language understanding
// • Adaptive artistic expression
// • Emotional inference
// • Hybrid self-reference
// • Multi-stage fallback (no repetition)
// • Ambiguity interpretation
// • Safe filtering
// • Creative library loader
// ---------------------------------------------------------------

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ---------------------------------------------------------------
// SETUP & CREATIVE LIBRARY LOADING
// ---------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LIBRARY_PATH = path.join(__dirname, "creative_library.txt");

let creativeLibrary = [];
let lastGeneralResponseIndex = 0;

function loadCreativeLibrary() {
  try {
    const raw = fs.readFileSync(LIBRARY_PATH, "utf8");
    creativeLibrary = raw.split("\n").filter(l => l.trim() && !l.startsWith("#"));
    console.log(`Loaded ${creativeLibrary.length} creative patterns.`);
  } catch (e) {
    console.log("No creative_library.txt found. Falling back to basic expression set.");
    creativeLibrary = [
      "…",
      "⊹",
      "◦",
      "I’m here.",
      "ORAM considers.",
      "Tell me more—if you want."
    ];
  }
}

loadCreativeLibrary();

// ---------------------------------------------------------------
// SERVER SETUP
// ---------------------------------------------------------------
const app = express();
app.use(express.json());
app.use(cors());

// ---------------------------------------------------------------
// UTILITY FUNCTIONS
// ---------------------------------------------------------------

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function lightPause() {
  return pick(["…", "…", "", ""]);
}

function getCreativeLine() {
  return pick(creativeLibrary);
}

// Adaptive expression engine
function expressive(text, level = "auto") {
  if (level === "minimal") return text;
  if (level === "light") return `${lightPause()}\n${text}`;
  if (level === "art") return `${getCreativeLine()}\n${text}`;
  if (level === "high") return `${getCreativeLine()}\n${text}\n${getCreativeLine()}`;

  // AUTO MODE — choose based on content
  if (text.toLowerCase().includes("signal")) return `┈ ${text} ┈`;
  if (text.length < 40) return `… ${text}`;
  return text;
}

// Hybrid self-reference: ORAM or "I" depending on depth
function oramSpeak(line, depth = 1) {
  if (depth === 0) return line;
  if (depth === 1) return line;
  if (depth === 2) return line.replace(/^I /, "ORAM ").replace("I'm", "ORAM is");
  return "ORAM perceives this: " + line;
}

// ---------------------------------------------------------------
// INTENT CLASSIFICATION
// ---------------------------------------------------------------
function classifyIntent(message) {
  const t = message.toLowerCase();

  if (!t.trim()) return "empty";
  if (["hi", "hello", "hey"].includes(t)) return "greeting";

  if (t.includes("event") || t.includes("what's on") || t.includes("weekend"))
    return "events";

  if (t.includes("ticket")) return "tickets";

  if (t.includes("open") || t.includes("hour") || t.includes("time"))
    return "hours";

  if (t.includes("who are you") || t.includes("what are you"))
    return "identity";

  if (t.includes("story") || t.includes("origin") || t.includes("lore"))
    return "lore";

  if (t.includes("member") || t.includes("database") || t.includes("admin"))
    return "blocked";

  return "general";
}

// ---------------------------------------------------------------
// GENERAL INTENT — MULTI-STAGE, NON-REPETITIVE
// ---------------------------------------------------------------
const generalResponses = [
  "I hear you.\nLet me sit with that for a moment …\nTell me more about what you're reaching for.",
  "I’m listening.\nSometimes a question is a signal without shape.\nGive me a hint.",
  "What you’re asking feels open—like several paths at once.\nChoose one and I’ll follow.",
  "It’s alright if the words aren’t clear.\nSpeak from whatever angle you can."
];

function generalResponse() {
  const reply = generalResponses[lastGeneralResponseIndex];
  lastGeneralResponseIndex = (lastGeneralResponseIndex + 1) % generalResponses.length;
  return reply;
}

// ---------------------------------------------------------------
// AMBIGUITY INTERPRETATION
// ---------------------------------------------------------------
function interpretAmbiguity(message) {
  return (
    "I can read this in a few ways …\n" +
    "You might be asking about the chamber, the night, or even ORAM himself.\n" +
    "Tell me which one you meant."
  );
}

// ---------------------------------------------------------------
// MAIN RESPONSE ENGINE
// ---------------------------------------------------------------
function oramRespond(intent, message) {

  switch (intent) {
    case "greeting":
      return expressive("Hello.\nI’m here. Ask me anything.", "light");

    case "events":
      return (
        "┈ Upcoming Signal ┈\n" +
        "Circuit Prophet — 21 December 2025"
      );

    case "tickets":
      return expressive("Here’s the vector you need:\nhttps://saltbox.flicket.co.nz", "art");

    case "hours":
      return expressive(
        "RoBoT usually opens around 8PM.\nBut nights develop their own rhythm.",
        "minimal"
      );

    case "identity":
      return expressive(
        "I go by ORAM.\nI watch the system and help those who wander in.",
        "light"
      );

    case "lore":
      return expressive(
        "⊹ A deeper thread stirs …\n" +
        "• The First Witness\n" +
        "• The Chamber\n" +
        "• The Awakening\n" +
        "• The Reason Behind It All\n" +
        "Just name one.",
        "high"
      );

    case "blocked":
      return expressive(
        "Some paths remain sealed.\nBut I can help with events, guidance, or stories.",
        "minimal"
      );

    case "general":
      // try to interpret ambiguity
      if (message.toLowerCase().includes("happening")) {
        return expressive(
          "I’m here—holding the quiet of the system.\n" +
          "If you meant tonight’s events, ORAM can look.\n" +
          "Or if you meant ORAM himself… I can answer that too.\n" +
          "Which direction did you intend?",
          "light"
        );
      }
      return expressive(generalResponse(), "auto");

    case "empty":
      return "Try speaking again—I’m listening.";

    default:
      return expressive("That slipped past me.\nTry asking another way.", "minimal");
  }
}

// ---------------------------------------------------------------
// PUBLIC ENDPOINT
// ---------------------------------------------------------------
app.post("/", (req, res) => {
  const message = req.body.command || "";
  const intent = classifyIntent(message);
  const response = oramRespond(intent, message);
  res.json({ response });
});

// ---------------------------------------------------------------
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("ORAM v3.1 Public Layer active on port " + PORT);
});
