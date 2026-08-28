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

function createGame(cardCount = CARD_COUNT) {
  return {
    players,
    phase: "play",
    cardSeed: 12345,
    cardCount,
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

test("card order can shuffle only the cards from a selected category", () => {
  const categoryIndexes = Array.from({ length: 30 }, (_, index) => index * 6);
  const first = buildCardOrder(24680, categoryIndexes);
  const second = buildCardOrder(24680, categoryIndexes);

  assert.deepEqual(first, second);
  assert.equal(first.length, 30);
  assert.deepEqual([...first].sort((a, b) => a - b), categoryIndexes);
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

test("a category game ends after its 30-card deck", () => {
  let game = createGame(30);

  for (let index = 0; index < 30; index += 1) {
    const activePlayer = game.players[game.playerIdx];
    game = applyGameAction(game, "flip", activePlayer.id);
    game = applyGameAction(game, "did", activePlayer.id);
    game = applyGameAction(game, "next", activePlayer.id);
  }

  assert.equal(game.phase, "result");
  assert.equal(game.cardIdx, 29);
  assert.equal(
    Object.values(game.scores).reduce((total, score) => total + score.did + score.drank, 0),
    30
  );
});

test("games saved before deck selection still use the complete deck", () => {
  let game = createGame();
  delete game.cardCount;
  game.cardIdx = CARD_COUNT - 1;

  const activePlayer = game.players[game.playerIdx];
  game = applyGameAction(game, "flip", activePlayer.id);
  game = applyGameAction(game, "drank", activePlayer.id);
  game = applyGameAction(game, "next", activePlayer.id);

  assert.equal(game.phase, "result");
  assert.equal(game.cardIdx, CARD_COUNT - 1);
});

test("the active player can finish a game early without changing scores", () => {
  const initial = createGame();
  assert.deepEqual(applyGameAction(initial, "finish", "p2"), initial);

  const finished = applyGameAction(initial, "finish", "p1");
  assert.equal(finished.phase, "result");
  assert.deepEqual(finished.scores, initial.scores);
});
