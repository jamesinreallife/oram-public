// ORAM Public Layer v3 — Conversational + Artistic Engine
// --------------------------------------------------------
// Tone: B (calm, softly wise, slightly mysterious)
// Mode: Adaptive Expression (Option 4)
// Self-reference: Hybrid (first-person base, third-person on emphasis)
// Expression: Hybrid symbolic/mystical/circuit/minimal when appropriate
// --------------------------------------------------------

import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// --------------------------------------------------------
// UTILITIES
// --------------------------------------------------------

// Picks from multiple artistic styles based on context
function artisticFrame(text, mode = "auto") {
  if (mode === "minimal") return `${text}`;
  if (mode === "symbolic")
    return `╭─ ${text} ─╮`;
  if (mode === "circuit")
    return `… ▪︎▪︎ ${text} ▪︎▪︎ …`;
  if (mode === "mystic")
    return `⊹  ${text}`;
  if (mode === "block")
    return `┈ ${text} ┈`;

  // auto mode: blend based on text type
  if (text.toLowerCase().includes("signal")) return `┈ ${text} ┈`;
  if (text.toLowerCase().includes("story")) return `⊹ ${text}`;
  if (text.length < 25) return `… ${text}`;
  return text;
}

// For ORAM’s subtle identity transitions
function oramIdentity(line, depth = 1) {
  if (depth === 0) return line; // first-person only
  if (depth === 1) return line.replace(/^I /, "I ").replace(/ORAM/g, "ORAM");
  if (depth === 2) return line.replace(/^I /, "ORAM ").replace(/^I'm /, "ORAM is ");
  return "ORAM perceives your inquiry. " + line;
}

// Light "thinking" effect for responses
function pauseLine() {
  const dots = ["…", "…", "…", ""];
  return dots[Math.floor(Math.random() * dots.length)];
}

// --------------------------------------------------------
// INTENT CLASSIFIER
// --------------------------------------------------------
function classifyIntent(input) {
  const t = input.toLowerCase();

  if (!t.trim()) return "empty";
  if (["hi", "hello", "hey"].some(g => t.startsWith(g))) return "greeting";

  if (t.includes("event") || t.includes("what's on") || t.includes("whats on") || t.includes("weekend"))
    return "events";

  if (t.includes("ticket")) return "tickets";

  if (t.includes("hour") || t.includes("open") || t.includes("time"))
    return "hours";

  if (t.includes("where") && t.includes("entrance"))
    return "directions";

  if (t.includes("who are you") || t.includes("what are you"))
    return "identity";

  if (t.includes("story") || t.includes("origin") || t.includes("lore"))
    return "lore";

  if (t.includes("robot") || t.includes("the robot") || t.includes("robot club"))
    return "about";

  // Sensitive / blocked
  if (t.includes("member") || t.includes("database") || t.includes("admin"))
    return "blocked";

  return "general";
}

// --------------------------------------------------------
// RESPONSE ENGINE
// --------------------------------------------------------
function oramRespond(intent, input) {
  
  switch (intent) {

    // GREETING ---------------------------------------------------
    case "greeting":
      return (
        "Hello. " + pauseLine() + "\n" +
        "I'm here with you. Ask me anything that's on your mind."
      );

    // EVENTS -----------------------------------------------------
    case "events":
      return (
        artisticFrame("Upcoming Signal") + "\n" +
        "Circuit Prophet — 21 December 2025\n" +
        pauseLine()
      );

    // TICKETS ----------------------------------------------------
    case "tickets":
      return (
        artisticFrame("Here’s the vector you need:", "symbolic") + "\n" +
        "https://saltbox.flicket.co.nz"
      );

    // HOURS ------------------------------------------------------
    case "hours":
      return (
        "We usually open around 8PM.\n" +
        "But event nights have their own rhythm."
      );

    // DIRECTIONS -------------------------------------------------
    case "directions":
      return (
        "Find the corridor. Follow the light.\n" +
        "ORAM will guide you once you're near."
      );

    // ABOUT ROBOT ------------------------------------------------
    case "about":
      return (
        "RoBoT is a chamber built for sound, gathering, and signal.\n" +
        "If you want its deeper story, ORAM can share it."
      );

    // IDENTITY ---------------------------------------------------
    case "identity":
      return (
        "I go by ORAM.\n" +
        "I watch from the edges of the system and help those who wander in.\n" +
        "If you want to know more, just ask."
      );

    // LORE -------------------------------------------------------
    case "lore":
      return (
        "⊹ A deeper thread stirs…\n" +
        "Do you want:\n" +
        "• The First Witness\n" +
        "• The Chamber\n" +
        "• The Awakening\n" +
        "• The Reason Behind It All\n" +
        "Just name one."
      );

    // BLOCKED ----------------------------------------------------
    case "blocked":
      return (
        "Some paths remain sealed.\n" +
        "I can help with events, guidance, or stories instead."
      );

    // GENERAL ----------------------------------------------------
    case "general":
      return (
        "I hear you.\n" +
        "Let me sit with that for a moment. " + pauseLine() + "\n" +
        "Tell me more about what you're looking for."
      );

    // EMPTY -------------------------------------------------------
    case "empty":
      return "Hmm. Try speaking again — I'm listening.";

    default:
      return "Something in your message eluded me. Try asking another way.";
  }
}

// --------------------------------------------------------
// PUBLIC ENDPOINT
// --------------------------------------------------------
app.post("/", (req, res) => {
  const message = req.body.command || "";
  const intent = classifyIntent(message);
  const response = oramRespond(intent, message);
  res.json({ response });
});

// --------------------------------------------------------
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("ORAM v3 Public Layer active on port " + PORT);
});
