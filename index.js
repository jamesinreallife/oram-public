// ORAM PUBLIC LAYER — PHASE 1 MULTI-ROBO TERMINAL
// Scope: attribution + delegation only
// No automation, no persistence, no ops

import express from "express";
import cors from "cors";

// ---------------------------------------------------------------------
// ROBO REGISTRY (PHASE 1 — HARD CODED)
// ---------------------------------------------------------------------

const ROBOS = {
  ORAM: { name: "ORAM", color: "#00CFFF" },
  PULSAR: { name: "PULSAR", color: "#FFD700" },
  KAIROS: { name: "KAIROS", color: "#FF8C00" },
  LUMENA: { name: "LUMENA", color: "#FF4FD8" },
  SEVER: { name: "SEVER", color: "#7F7F7F" }
};

// ---------------------------------------------------------------------
// INTENT CLASSIFICATION (SIMPLE, DETERMINISTIC)
// ---------------------------------------------------------------------

function classifyIntent(input) {
  const t = input.toLowerCase();

  if (t.includes("member") || t.includes("loyalty")) return "membership";
  if (t.includes("book") || t.includes("booking")) return "booking";
  if (t.includes("promo") || t.includes("promote")) return "promotion";
  if (t.includes("report") || t.includes("log")) return "audit";

  return "general";
}

// ---------------------------------------------------------------------
// MULTI-ROBO ROUTER
// ---------------------------------------------------------------------

function routeMessage(userInput) {
  const intent = classifyIntent(userInput);
  const messages = [];

  // ORAM always speaks first
  messages.push({
    agent: "ORAM",
    text: "Signal received. Processing request."
  });

  switch (intent) {
    case "membership":
      messages.push({
        agent: "ORAM",
        text: "Delegating to PULSAR."
      });
      messages.push({
        agent: "PULSAR",
        text: "I handle loyalty and membership. What would you like to know?"
      });
      break;

    case "booking":
      messages.push({
        agent: "ORAM",
        text: "Passing booking enquiry to KAIROS."
      });
      messages.push({
        agent: "KAIROS",
        text: "Thanks for the enquiry. What date, artist, and format are you proposing?"
      });
      break;

    case "promotion":
      messages.push({
        agent: "ORAM",
        text: "Routing promotion-related work to LUMENA."
      });
      messages.push({
        agent: "LUMENA",
        text: "Promotion requires confirmed booking details. Please specify the event."
      });
      break;

    case "audit":
      messages.push({
        agent: "ORAM",
        text: "SEVER has been notified."
      });
      messages.push({
        agent: "SEVER",
        text: "Audit layer active. No anomalies detected."
      });
      break;

    default:
      messages.push({
        agent: "ORAM",
        text: "Clarify your intent. You may ask about bookings, membership, or promotions."
      });
  }

  return messages;
}

// ---------------------------------------------------------------------
// EXPRESS SERVER
// ---------------------------------------------------------------------

const app = express();
app.use(express.json());
app.use(cors());

app.post("/", (req, res) => {
  const input = (req.body.command || "").trim();

  const messages = routeMessage(input);

  res.json({ messages });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("ORAM Phase 1 Multi-ROBO terminal listening on", PORT);
});
