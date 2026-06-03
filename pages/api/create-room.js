import { randomUUID } from "crypto";
import { kv } from "@vercel/kv";
import { getBaseUrl, getRoomKey } from "../../lib/server.js";
import { createEmptyScores } from "../../lib/room.js";

function makeCode() {
  return Math.random().toString(36).slice(2, 8).padEnd(6, "0").toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body || {};
  const name = String(body.name || "").trim();
  const avatar = String(body.avatar || "").trim();

  if (!name || !avatar) {
    return res.status(400).json({ error: "Name and avatar are required" });
  }

  let code = makeCode();
  let room = await kv.get(getRoomKey(code));

  while (room) {
    code = makeCode();
    room = await kv.get(getRoomKey(code));
  }

  const hostId = randomUUID();
  const hostPlayer = { id: hostId, name, avatar };
  const roomState = {
    code,
    hostId,
    host: name,
    players: [hostPlayer],
    phase: "lobby",
    cardSeed: null,
    cardIdx: 0,
    playerIdx: 0,
    scores: createEmptyScores([hostPlayer]),
    flipped: false,
    decided: false,
  };

  await kv.set(getRoomKey(code), roomState, { ex: 14400 });

  return res.status(200).json({
    code,
    roomUrl: `${getBaseUrl(req)}/join/${code}`,
    roomState,
  });
}