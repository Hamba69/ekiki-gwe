import { createPusher, getRoomKey } from "../../lib/server.js";
import { kvGet, kvSet } from "../../lib/kv.js";
import { applyGameAction } from "../../lib/room.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body || {};
  const code = String(body.code || "").trim().toUpperCase();
  const action = String(body.action || "").trim();
  const playerId = String(body.playerId || "").trim();

  if (!code || !action || !playerId) {
    return res.status(400).json({ error: "Code, action, and playerId are required" });
  }

  const key = getRoomKey(code);
  const room = await kvGet(key);

  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  const nextRoom = applyGameAction(room, action, playerId);
  const changed = JSON.stringify(nextRoom) !== JSON.stringify(room);

  if (changed) {
    await kvSet(key, nextRoom, { ex: 14400 });
    const pusher = createPusher();
    await pusher.trigger(`room-${code}`, "game-state", { roomState: nextRoom });
  }

  return res.status(200).json({ ok: true, roomState: nextRoom });
}