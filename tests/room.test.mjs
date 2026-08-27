import assert from "node:assert/strict";
import test from "node:test";

import {
  CARD_COUNT,
  applyGameAction,
  buildCardOrder,
  createEmptyScores,
} from "../lib/room.js";

const players = [
  { id: "p1", name: "Alice", avatar: "🦁" },
  { id: "p2", name: "Bob", avatar: "🐯" },
];

function createGame() {
  return {
    players,
    phase: "play",
    cardSeed: 12345,
    cardIdx: 0,
    playerIdx: 0,
    scores: createEmptyScores(players),
    flipped: false,
    decided: false,
  };
}

test("card order is deterministic and contains every card exactly once", () => {
  const first = buildCardOrder(12345);
  const second = buildCardOrder(12345);

  assert.deepEqual(first, second);
  assert.equal(first.length, CARD_COUNT);
  assert.equal(new Set(first).size, CARD_COUNT);
  assert.deepEqual([...first].sort((a, b) => a - b), Array.from({ length: CARD_COUNT }, (_, index) => index));
});

test("only the active player can complete the current turn", () => {
  const initial = createGame();
  assert.deepEqual(applyGameAction(initial, "flip", "p2"), initial);

  const flipped = applyGameAction(initial, "flip", "p1");
  assert.equal(flipped.flipped, true);
  assert.deepEqual(applyGameAction(flipped, "did", "p2"), flipped);

  const decided = applyGameAction(flipped, "did", "p1");
  assert.equal(decided.scores.Alice.did, 1);
  assert.equal(decided.decided, true);

  const next = applyGameAction(decided, "next", "p1");
  assert.equal(next.cardIdx, 1);
  assert.equal(next.playerIdx, 1);
  assert.equal(next.flipped, false);
  assert.equal(next.decided, false);
});

test("a complete deck ends on the results phase without skipping turns", () => {
  let game = createGame();

  for (let index = 0; index < CARD_COUNT; index += 1) {
    const activePlayer = game.players[game.playerIdx];
    game = applyGameAction(game, "flip", activePlayer.id);
    game = applyGameAction(game, index % 2 === 0 ? "did" : "drank", activePlayer.id);
    game = applyGameAction(game, "next", activePlayer.id);
  }

  assert.equal(game.phase, "result");
  assert.equal(game.cardIdx, CARD_COUNT - 1);
  assert.equal(
    Object.values(game.scores).reduce((total, score) => total + score.did + score.drank, 0),
    CARD_COUNT
  );
});
