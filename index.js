// ORAM PUBLIC LAYER — PHASE 2 (HARD FLOOR CONTROL ENABLED)
// Single authoritative backend file

import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const PORT = process.env.PORT || 10000;

/* =========================================================
   EVENT DATA (CURRENTLY STATIC — OK FOR NOW)
========================================================= */

const EVENTS = [
  {
    artist: "Circuit Prophet",
    date: "21 December 2025",
    link: "https://saltbox.flicket.co.nz/circuitprophet"
  }
];

/* =========================================================
   UTIL
========================================================= */

function msg(agent, text) {
  return { agent, text };
}

/* =========================================================
   HARD FLOOR ROBO RESPONSES
========================================================= */

function forcedRoboResponse(robo) {
  switch (robo) {
    case "KAIROS":
      return msg(
        "KAIROS",
        "Thanks for reaching out. I can help with bookings. What date, artist, and format are you proposing?"
      );

    case "PULSAR":
      return msg(
        "PULSAR",
        "I manage membership and loyalty. What would you like help with?"
      );

    case "LUMENA":
      return msg(
        "LUMENA",
        "I handle promotions and broadcasts. What event or release are you preparing to promote?"
      );

    case "SEVER":
      return msg(
        "SEVER",
        "Analysis channel open. What would you like reviewed?"
      );

    default:
      return msg(
        robo,
        "How can I assist you?"
      );
  }
}

/* =========================================================
   ORAM NORMAL INTENT HANDLING (UNCHANGED BEHAVIOUR)
========================================================= */

function classifyIntent(text) {
  const t = text.toLowerCase();

  if (t.includes("event") || t.includes("what's on")) return "events";
  if (t.includes("ticket")) return "tickets";
  if (t.includes("booking")) return "booking";
  if (!t.trim()) return "empty";

  return "general";
}

function surfaceResponse(intent) {
  const e = EVENTS[0];

  switch (intent) {
    case "events":
      return msg(
        "ORAM",
        `Here’s what’s confirmed at RoBoT:\n• ${e.artist} — ${e.date}\nWould you like ticket info?`
      );

    case "tickets":
      return msg(
        "ORAM",
        `Tickets for ${e.artist} are available here:\n${e.link}`
      );

    case "booking":
      return [
        msg("ORAM", "Passing booking enquiry to KAIROS."),
        msg(
          "KAIROS",
          "Thanks for the enquiry. What date, artist, and format are you proposing?"
        )
      ];

    case "empty":
      return msg("ORAM", "I’m here. What would you like to explore?");

    default:
      return msg("ORAM", "Acknowledged. What would you like to explore?");
  }
}

/* =========================================================
   MAIN ROUTER
========================================================= */

async function oramRouter(command, forcedSpeaker) {
  const messages = [];

  // HARD FLOOR CONTROL — OVERRIDE EVERYTHING
  if (forcedSpeaker) {
    messages.push(forcedRoboResponse(forcedSpeaker));
    return messages;
  }

  // Normal ORAM flow
  const intent = classifyIntent(command);
  const response = surfaceResponse(intent);

  if (Array.isArray(response)) {
    return response;
  }

  messages.push(response);
  return messages;
}

/* =========================================================
   HTTP ENTRYPOINT
========================================================= */

app.post("/", async (req, res) => {
  try {
    const { command = "", forced_speaker = null } = req.body;

    const messages = await oramRouter(command, forced_speaker);

    res.json({ messages });
  } catch (err) {
    res.status(500).json({
      messages: [msg("SYSTEM", "Internal error.")]
    });
  }
});

app.listen(PORT, () => {
  console.log("ORAM Phase 2 (Hard Floor Control) listening on " + PORT);
});
