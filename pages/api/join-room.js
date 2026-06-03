import { randomUUID } from "crypto";
import { kv } from "@vercel/kv";
import { createPusher, getBaseUrl, getRoomKey } from "../../lib/server.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body || {};
  const code = String(body.code || "").trim().toUpperCase();
  const name = String(body.name || "").trim();
  const avatar = String(body.avatar || "").trim();

  if (!code || !name || !avatar) {
    return res.status(400).json({ error: "Code, name, and avatar are required" });
  }

  const key = getRoomKey(code);
  const room = await kv.get(key);

  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  const duplicate = room.players.some(
    (player) => player.name.toLowerCase() === name.toLowerCase()
  );

  if (duplicate) {
    return res.status(409).json({ error: "That name is already in the room" });
  }

  const player = { id: randomUUID(), name, avatar };
  const roomState = {
    ...room,
    players: [...room.players, player],
    scores: {
      ...room.scores,
      [player.name]: room.scores?.[player.name] || { did: 0, drank: 0 },
    },
  };

  await kv.set(key, roomState, { ex: 14400 });

  const pusher = createPusher();
  await pusher.trigger(`room-${code}`, "player-joined", {
    roomState,
    players: roomState.players,
  });

  return res.status(200).json({
    ok: true,
    roomUrl: `${getBaseUrl(req)}/join/${code}`,
    roomState,
  });
}