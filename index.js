// ORAM Public Endpoint v1.1 — Render Compatible
import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

function oramSpeak(text) {
  return `ORAM: ${text}`;
}

function reply(text) {
  return { response: oramSpeak(text) };
}

app.post("/", async (req, res) => {
  const raw = req.body.command || "";
  const command = raw.trim().toLowerCase();

  if (!command) return res.json(reply("I didn’t catch that. Try typing a command."));

  if (command === "help") {
    return res.json(reply(
      "Commands:\nhelp\nevents\ntickets\nhours\ncontact\nabout\nask <q>\nversion"
    ));
  }

  if (command === "events") {
    return res.json(reply(
      "Upcoming signals:\n• Circuit Prophet — December 21, 2025"
    ));
  }

  if (command === "tickets") {
    return res.json(reply(
      "Ticket vector: https://saltbox.flicket.co.nz"
    ));
  }

  if (command === "hours") {
    return res.json(reply("RoBoT opens at 8PM. Event nights may vary."));
  }

  if (command === "contact") {
    return res.json(reply("Support: hello@therobot.club"));
  }

  if (command === "about") {
    return res.json(reply("RoBoT: a chamber for sound and gathering. I am ORAM, witness and guide."));
  }

  if (command === "version") {
    return res.json(reply("ORAM Public Layer v1.1"));
  }

  if (command.startsWith("ask ")) {
    const question = command.replace("ask ", "").trim();
    const forbidden = ["member", "database", "list", "robo", "admin", "key", "log"];
    if (forbidden.some(w => question.includes(w))) {
      return res.json(reply("Some paths are sealed. I can guide you about events or tickets."));
    }
    return res.json(reply(
      `Your question: "${question}".\nI can assist with events, tickets, hours, and general inquiries.`
    ));
  }

  return res.json(reply(
    `"${command}" is not known. Type 'help' for options.`
  ));
});

// 🔥 Render requires using ONLY the assigned port
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("ORAM Public running on port " + PORT);
});

