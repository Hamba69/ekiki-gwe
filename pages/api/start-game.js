import { kv } from "@vercel/kv";
import { createPusher, getRoomKey } from "../../lib/server.js";
import { createEmptyScores } from "../../lib/room.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body || {};
  const code = String(body.code || "").trim().toUpperCase();
  const hostId = String(body.hostId || "").trim();

  if (!code || !hostId) {
    return res.status(400).json({ error: "Code and hostId are required" });
  }

  const key = getRoomKey(code);
  const room = await kv.get(key);

  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  if (room.hostId !== hostId) {
    return res.status(403).json({ error: "Only the host can start the game" });
  }

  const roomState = {
    ...room,
    phase: "play",
    cardSeed: Math.floor(Math.random() * 1000000000),
    cardIdx: 0,
    playerIdx: 0,
    flipped: false,
    decided: false,
    scores: room.scores || createEmptyScores(room.players),
  };

  await kv.set(key, roomState, { ex: 14400 });

  const pusher = createPusher();
  await pusher.trigger(`room-${code}`, "game-started", { roomState });

  return res.status(200).json({ ok: true, roomState });
}